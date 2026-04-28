import http from "node:http";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadSchema() {
  const p = path.join(__dirname, "schemas", "pheromone.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export const schema = loadSchema();

/** Deterministic decay: base * exp(-decayRate * dt_s) + inflations (FR-3.x). */
export function currentIntensity(rec, nowMs = Date.now()) {
  const t0 = typeof rec.publishedAt === "number" ? rec.publishedAt : nowMs;
  const dtS = Math.max(0, (nowMs - t0) / 1000);
  const base = rec.baseIntensity ?? 0;
  const lam = rec.decayRate ?? 0;
  const inf = rec.inflations ?? 0;
  return base * Math.exp(-lam * dtS) + inf;
}

export function validate(body) {
  if (typeof body.id !== "string" || !body.id) return "missing id";
  if (typeof body.stanceTarget !== "string") return "stanceTarget";
  if (typeof body.baseIntensity !== "number") return "baseIntensity";
  if (typeof body.decayRate !== "number") return "decayRate";
  if (body.seq !== undefined && typeof body.seq !== "number") return "seq";
  if (
    body.inflations !== undefined &&
    (typeof body.inflations !== "number" || !Number.isInteger(body.inflations) || body.inflations < 0)
  ) {
    return "inflations";
  }
  return null;
}

export function sbpLog(obj) {
  const row = { ts: Date.now(), ...obj };
  const s = `${JSON.stringify(row)}\n`;
  const fp = process.env.SBP_LOG_FILE;
  if (fp) {
    try {
      fs.appendFileSync(fp, s, "utf8");
    } catch {
      /* ignore */
    }
  }
  if (process.env.SBP_LOG_STDERR === "1") {
    try {
      process.stderr.write(s);
    } catch {
      /* ignore */
    }
  }
}

function withIntensity(rec, nowMs) {
  return { ...rec, intensity: currentIntensity(rec, nowMs) };
}

/** In-memory ledger + claims (default). */
export class MemoryLedgerStore {
  /** @type {Map<string, object>} */
  ledger = new Map();
  /** @type {Map<string, string>} */
  claims = new Map();

  /** @param {object} rec full persisted record (includes publishedAt, inflations) */
  putRecord(rec) {
    const copy = { ...rec };
    delete copy.intensity;
    this.ledger.set(rec.id, copy);
  }

  /** @param {object} json validated POST body */
  publish(json) {
    const rec = {
      ...json,
      publishedAt: Date.now(),
      inflations: Number.isInteger(json.inflations) ? json.inflations : 0,
    };
    delete rec.intensity;
    this.putRecord(rec);
  }

  /** @returns {boolean} true if newly claimed */
  claim(id, token) {
    if (this.claims.has(id)) return false;
    this.claims.set(id, token);
    return true;
  }

  /** @internal replay helper: set claim without appending to disk */
  replayClaim(id, token) {
    if (!this.claims.has(id)) this.claims.set(id, token);
  }

  inflate(id) {
    const cur = this.ledger.get(id);
    if (!cur) return false;
    cur.inflations = (cur.inflations ?? 0) + 1;
    this.ledger.set(id, cur);
    return true;
  }
}

/** Append-only JSONL persistence (ADR-0008). */
export class JsonlLedgerStore extends MemoryLedgerStore {
  /**
   * @param {string} filePath absolute or cwd-relative log path
   */
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this._replay();
  }

  _appendLine(obj) {
    const dir = path.dirname(this.filePath);
    if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(this.filePath, `${JSON.stringify(obj)}\n`, "utf8");
  }

  _replay() {
    if (!fs.existsSync(this.filePath)) return;
    const raw = fs.readFileSync(this.filePath, "utf8");
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      let ev;
      try {
        ev = JSON.parse(line);
      } catch {
        continue;
      }
      if (ev.type === "publish" && ev.payload) {
        const p = { ...ev.payload };
        if (typeof p.publishedAt !== "number") p.publishedAt = Date.now();
        if (!Number.isInteger(p.inflations)) p.inflations = 0;
        super.putRecord(p);
      } else if (ev.type === "claim" && ev.id && ev.token) {
        this.replayClaim(ev.id, ev.token);
      } else if (ev.type === "inflate" && ev.id) {
        super.inflate(ev.id);
      }
    }
  }

  publish(json) {
    const rec = {
      ...json,
      publishedAt: Date.now(),
      inflations: Number.isInteger(json.inflations) ? json.inflations : 0,
    };
    delete rec.intensity;
    this._appendLine({ type: "publish", payload: rec });
    this.putRecord(rec);
  }

  claim(id, token) {
    if (this.claims.has(id)) return false;
    this._appendLine({ type: "claim", id, token });
    return super.claim(id, token);
  }

  inflate(id) {
    this._appendLine({ type: "inflate", id });
    return super.inflate(id);
  }
}

/** Lexicographic JSON for deterministic compaction output (nested objects sorted). */
export function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
}

/**
 * Replay JSONL ledger, drop claimed rows with currentIntensity < floor, rewrite atomically (ADR-0009).
 * @param {string} filePath
 * @param {{ nowMs?: number; decayGcFloor?: number }} [opts]
 * @returns {{ kept: number; dropped: number }}
 */
export function compactJsonlLedger(filePath, opts = {}) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("compactJsonlLedger: filePath required");
  }
  const floor =
    opts.decayGcFloor !== undefined
      ? opts.decayGcFloor
      : Number(process.env.SBP_DECAY_GC_FLOOR ?? 0.01);
  const nowMs = opts.nowMs ?? Date.now();
  if (!fs.existsSync(filePath)) {
    return { kept: 0, dropped: 0 };
  }
  const store = new JsonlLedgerStore(filePath);
  /** @type {string[]} */
  const dropped = [];
  /** @type {{ id: string; rec: object; token: string | undefined }[]} */
  const rows = [];
  for (const id of [...store.ledger.keys()].sort()) {
    const rec = store.ledger.get(id);
    if (!rec) continue;
    const inten = currentIntensity(rec, nowMs);
    const token = store.claims.get(id);
    const claimed = token !== undefined;
    if (inten < floor && claimed) {
      dropped.push(id);
      continue;
    }
    rows.push({ id, rec, token });
  }
  let body = "";
  for (const { id, rec, token } of rows) {
    const payload = { ...rec };
    delete payload.intensity;
    body += `${stableStringify({ type: "publish", payload })}\n`;
    if (token !== undefined) {
      body += `${stableStringify({ type: "claim", id, token })}\n`;
    }
  }
  const tmp = `${filePath}.compact.tmp`;
  fs.writeFileSync(tmp, body, "utf8");
  fs.renameSync(tmp, filePath);
  return { kept: rows.length, dropped: dropped.length };
}

/**
 * Opt-in periodic compaction (ADR-0009). `setInterval` / `clearInterval` injectable for tests.
 * @param {string} filePath
 * @param {{
 *   intervalMs?: number;
 *   nowMs?: () => number;
 *   setInterval?: typeof setInterval;
 *   clearInterval?: typeof clearInterval;
 *   compact?: typeof compactJsonlLedger;
 * }} [opts]
 */
export function scheduleDecayGc(filePath, opts = {}) {
  const intervalMs =
    opts.intervalMs !== undefined
      ? opts.intervalMs
      : Number(process.env.SBP_DECAY_GC_INTERVAL_MS ?? 0);
  if (!intervalMs || intervalMs <= 0 || !filePath) {
    return { stop: () => {} };
  }
  const si = opts.setInterval ?? setInterval;
  const ci = opts.clearInterval ?? clearInterval;
  const compact = opts.compact ?? compactJsonlLedger;
  const now = opts.nowMs ?? (() => Date.now());
  const handle = si(() => {
    try {
      compact(filePath, { nowMs: now() });
    } catch (e) {
      sbpLog({ event: "decay_gc_error", err: String(e && e.message ? e.message : e) });
    }
  }, intervalMs);
  return { stop: () => ci(handle) };
}

/**
 * @param {{ store?: MemoryLedgerStore }} [options]
 */
export function createLedgerServer(options = {}) {
  const store = options.store ?? new MemoryLedgerStore();
  const clients = new Set();

  function broadcast(event, data) {
    const line = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      try {
        res.write(line);
      } catch {
        clients.delete(res);
      }
    }
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/stream") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      clients.add(res);
      req.on("close", () => clients.delete(res));
      res.write("event: hello\ndata: {}\n\n");
      sbpLog({ event: "sse_open", path: "/stream" });
      return;
    }
    if (req.method === "GET" && url.pathname === "/pheromones") {
      const now = Date.now();
      const rows = [...store.ledger.values()].map((r) => withIntensity(r, now));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rows));
      sbpLog({ event: "get_pheromones", count: rows.length });
      return;
    }
    if (req.method === "POST" && url.pathname === "/pheromones") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const json = JSON.parse(body || "{}");
        const err = validate(json);
        if (err) {
          res.writeHead(400).end(err);
          sbpLog({ event: "publish_error", id: json.id, err });
          return;
        }
        store.publish(json);
        const rec = store.ledger.get(json.id);
        const payload = withIntensity(rec, Date.now());
        broadcast("pheromone", payload);
        res.writeHead(201).end("ok");
        sbpLog({ event: "publish", id: json.id, intensity: payload.intensity });
      });
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/pheromones/") && url.pathname.endsWith("/claim")) {
      const id = url.pathname.split("/")[2];
      if (store.claims.has(id)) {
        res.writeHead(409).end("claimed");
        sbpLog({ event: "claim_conflict", id });
        return;
      }
      const token = randomUUID();
      store.claim(id, token);
      broadcast("claim", { id });
      res.writeHead(200).end("ok");
      sbpLog({ event: "claim", id });
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/pheromones/") && url.pathname.endsWith("/inflate")) {
      const id = url.pathname.split("/")[2];
      if (!store.inflate(id)) {
        res.writeHead(404).end("missing");
        sbpLog({ event: "inflate_missing", id });
        return;
      }
      const cur = store.ledger.get(id);
      const intensity = currentIntensity(cur, Date.now());
      broadcast("inflate", { id, intensity });
      res.writeHead(200).end("ok");
      sbpLog({ event: "inflate", id, intensity });
      return;
    }
    res.writeHead(404).end("not found");
    sbpLog({ event: "not_found", path: url.pathname });
  });

  return { server, ledger: store.ledger, claims: store.claims, store };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const logPath = process.env.SBP_LEDGER_JSONL;
  const store = logPath ? new JsonlLedgerStore(logPath) : new MemoryLedgerStore();
  const decayGc = logPath ? scheduleDecayGc(logPath) : { stop: () => {} };
  const { server } = createLedgerServer({ store });
  const port = Number(process.env.PORT || 3847);
  server.listen(port, () => {
    console.error(`sbp listening ${port}${logPath ? ` jsonl=${logPath}` : ""}`);
  });
  const shutdownGc = () => decayGc.stop();
  process.once("SIGINT", shutdownGc);
  process.once("SIGTERM", shutdownGc);
}

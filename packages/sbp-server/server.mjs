import http from "node:http";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

import { currentIntensity } from "./intensity.mjs";

export { currentIntensity };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadSchema() {
  const p = path.join(__dirname, "schemas", "pheromone.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export const schema = loadSchema();

/**
 * Load union of `stance_vector` keys from a JSON file or every `*.json` in a directory
 * (non-recursive, lexicographic order). JSON is not executed; invalid JSON throws at startup.
 * @param {string} registryPath
 * @returns {Set<string>}
 */
export function loadStanceRegistry(registryPath) {
  const resolved = path.resolve(registryPath);
  const targets = new Set();
  /** @param {object} obj */
  function collect(obj) {
    const vec = obj && typeof obj === "object" ? obj.stance_vector : null;
    if (!vec || typeof vec !== "object" || Array.isArray(vec)) {
      throw new Error("stance registry entry missing stance_vector object");
    }
    for (const k of Object.keys(vec)) {
      if (typeof k === "string" && k) targets.add(k);
    }
  }
  const st = fs.statSync(resolved);
  if (st.isFile()) {
    collect(JSON.parse(fs.readFileSync(resolved, "utf8")));
    return targets;
  }
  if (st.isDirectory()) {
    const files = fs.readdirSync(resolved).filter((f) => f.endsWith(".json")).sort();
    if (files.length === 0) {
      throw new Error(`stance registry directory has no *.json: ${resolved}`);
    }
    for (const f of files) {
      const full = path.join(resolved, f);
      collect(JSON.parse(fs.readFileSync(full, "utf8")));
    }
    return targets;
  }
  throw new Error(`stance registry path not found: ${resolved}`);
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
  if (body.kind !== undefined && (typeof body.kind !== "string" || !body.kind)) return "kind";
  return null;
}

const AUTH_CLASSES = new Set(["worker", "privileged"]);

/**
 * Load `{ tokens: { "<token>": { agentId, class } } }` (FR-9.1). Absent env/file = open mode
 * (identity resolution never activates; existing single-operator behavior is unchanged).
 * @param {string} filePath
 * @returns {Map<string, { agentId: string, class: "worker" | "privileged" }>}
 */
export function loadAuthTokens(filePath) {
  const resolved = path.resolve(filePath);
  const data = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const tokens = data && typeof data === "object" ? data.tokens : null;
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    throw new Error(`auth tokens file missing "tokens" object: ${resolved}`);
  }
  const map = new Map();
  for (const [token, identity] of Object.entries(tokens)) {
    if (!token) continue;
    const agentId = identity && typeof identity === "object" ? identity.agentId : undefined;
    const cls = identity && typeof identity === "object" ? identity.class : undefined;
    if (typeof agentId !== "string" || !agentId) {
      throw new Error(`auth tokens file: token entry missing agentId: ${resolved}`);
    }
    if (!AUTH_CLASSES.has(cls)) {
      throw new Error(`auth tokens file: token ${agentId} has unknown class ${String(cls)}: ${resolved}`);
    }
    map.set(token, { agentId, class: cls });
  }
  return map;
}

/**
 * Load `{ kinds: { "<kind>": { publishableBy: ["worker","privileged"] } } }` (FR-9.1). Class-gating
 * on `kind` only activates when both this registry AND SBP_AUTH_TOKENS_FILE are configured.
 * @param {string} filePath
 * @returns {Map<string, { publishableBy: Set<string> }>}
 */
export function loadKindRegistry(filePath) {
  const resolved = path.resolve(filePath);
  const data = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const kinds = data && typeof data === "object" ? data.kinds : null;
  if (!kinds || typeof kinds !== "object" || Array.isArray(kinds)) {
    throw new Error(`kind registry file missing "kinds" object: ${resolved}`);
  }
  const map = new Map();
  for (const [kind, entry] of Object.entries(kinds)) {
    const publishableBy = entry && typeof entry === "object" ? entry.publishableBy : null;
    if (!Array.isArray(publishableBy) || publishableBy.length === 0) {
      throw new Error(`kind registry file: kind ${kind} missing non-empty publishableBy: ${resolved}`);
    }
    for (const cls of publishableBy) {
      if (!AUTH_CLASSES.has(cls)) {
        throw new Error(`kind registry file: kind ${kind} has unknown class ${String(cls)}: ${resolved}`);
      }
    }
    map.set(kind, { publishableBy: new Set(publishableBy) });
  }
  return map;
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
  /** @type {number | null} */
  replayedAt = null;

  storeKind() {
    return "memory";
  }

  healthPing() {
    return true;
  }

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
   * @param {{ skipWriterLock?: boolean }} [opts] compaction replay skips the exclusive lock
   */
  constructor(filePath, opts = {}) {
    super();
    this.filePath = path.resolve(filePath);
    this.lockDir = `${this.filePath}.sbp-writer-lock`;
    this._lockHeld = false;
    if (!opts.skipWriterLock) {
      try {
        fs.mkdirSync(this.lockDir);
        this._lockHeld = true;
      } catch (e) {
        if (e && e.code === "EEXIST") {
          const err = new Error("sbp: ledger locked");
          err.code = "ELEDGERLOCKED";
          throw err;
        }
        throw e;
      }
    }
    this._replay();
    this.replayedAt = Date.now();
  }

  storeKind() {
    return "jsonl";
  }

  healthPing() {
    fs.accessSync(this.filePath, fs.constants.R_OK);
    return true;
  }

  /** Release exclusive writer lock (tests / graceful shutdown). */
  releaseWriterLock() {
    if (!this._lockHeld) return;
    try {
      fs.rmSync(this.lockDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    this._lockHeld = false;
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
        if (!p.kind) p.kind = "signal";
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

/** SQLite ledger (ADR-0011) — mutually exclusive with JSONL env in the standalone entrypoint. */
export class SqliteLedgerStore extends MemoryLedgerStore {
  /**
   * @param {string} dbPath absolute or cwd-relative path
   */
  constructor(dbPath) {
    super();
    this.dbPath = path.resolve(dbPath);
    const dir = path.dirname(this.dbPath);
    if (dir && dir !== ".") fs.mkdirSync(dir, { recursive: true });
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("synchronous = NORMAL");
    this.db.pragma("busy_timeout = 5000");
    this._initSchema();
    this._replayFromDb();
    this.replayedAt = Date.now();
  }

  storeKind() {
    return "sqlite";
  }

  healthPing() {
    this.db.prepare("SELECT 1").get();
    return true;
  }

  close() {
    try {
      this.db.close();
    } catch {
      /* ignore */
    }
  }

  _initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pheromones (
        id TEXT PRIMARY KEY,
        json TEXT NOT NULL,
        published_at INTEGER NOT NULL,
        inflations INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        claimed_at INTEGER NOT NULL
      );
    `);
  }

  _replayFromDb() {
    const rows = this.db.prepare("SELECT id, json FROM pheromones ORDER BY id").all();
    for (const row of rows) {
      const p = JSON.parse(String(row.json));
      if (!p.kind) p.kind = "signal";
      super.putRecord(p);
    }
    const claims = this.db.prepare("SELECT id, token FROM claims ORDER BY id").all();
    for (const c of claims) {
      this.replayClaim(String(c.id), String(c.token));
    }
  }

  publish(json) {
    const rec = {
      ...json,
      publishedAt: Date.now(),
      inflations: Number.isInteger(json.inflations) ? json.inflations : 0,
    };
    delete rec.intensity;
    const payload = { ...rec };
    const run = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT OR REPLACE INTO pheromones (id, json, published_at, inflations) VALUES (@id, @json, @published_at, @inflations)`,
        )
        .run({
          id: rec.id,
          json: JSON.stringify(payload),
          published_at: rec.publishedAt,
          inflations: rec.inflations ?? 0,
        });
    });
    run();
    this.putRecord(rec);
  }

  claim(id, token) {
    if (this.claims.has(id)) return false;
    const run = this.db.transaction(() => {
      this.db
        .prepare(`INSERT OR IGNORE INTO claims (id, token, claimed_at) VALUES (?, ?, ?)`)
        .run(id, token, Date.now());
    });
    run();
    return super.claim(id, token);
  }

  inflate(id) {
    if (!super.inflate(id)) return false;
    const cur = this.ledger.get(id);
    if (!cur) return false;
    const copy = { ...cur };
    delete copy.intensity;
    const run = this.db.transaction(() => {
      this.db
        .prepare(`UPDATE pheromones SET json = ?, inflations = ? WHERE id = ?`)
        .run(JSON.stringify(copy), cur.inflations ?? 0, id);
    });
    run();
    return true;
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
    opts.forceSizeRotation === true
      ? 1.0
      : opts.decayGcFloor !== undefined
        ? opts.decayGcFloor
        : Number(process.env.SBP_DECAY_GC_FLOOR ?? 0.01);
  const nowMs = opts.nowMs ?? Date.now();
  const t0 = Date.now();
  let bytesBefore = 0;
  if (fs.existsSync(filePath)) bytesBefore = fs.statSync(filePath).size;
  if (!fs.existsSync(filePath)) {
    return { kept: 0, dropped: 0 };
  }
  const store = new JsonlLedgerStore(filePath, { skipWriterLock: true });
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
  const bytesAfter = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
  sbpLog({
    event: "compaction_done",
    store: "jsonl",
    kept: rows.length,
    dropped: dropped.length,
    durationMs: Date.now() - t0,
    bytesBefore,
    bytesAfter,
  });
  return { kept: rows.length, dropped: dropped.length };
}

/**
 * SQLite ledger compaction (ADR-0011): drop claimed rows with intensity strictly below floor.
 * @param {string} dbPath
 * @param {{ nowMs?: number; decayGcFloor?: number; forceSizeRotation?: boolean }} [opts]
 */
export function compactSqliteLedger(dbPath, opts = {}) {
  if (!dbPath || typeof dbPath !== "string") {
    throw new Error("compactSqliteLedger: dbPath required");
  }
  const floor =
    opts.forceSizeRotation === true
      ? 1.0
      : opts.decayGcFloor !== undefined
        ? opts.decayGcFloor
        : Number(process.env.SBP_DECAY_GC_FLOOR ?? 0.01);
  const nowMs = opts.nowMs ?? Date.now();
  const t0 = Date.now();
  let bytesBefore = 0;
  if (fs.existsSync(dbPath)) bytesBefore = fs.statSync(dbPath).size;
  if (!fs.existsSync(dbPath)) {
    return { kept: 0, dropped: 0 };
  }
  const db = new Database(dbPath);
  try {
    db.pragma("busy_timeout = 5000");
    const rows = db.prepare("SELECT id, json FROM pheromones").all();
    const claims = new Map(
      db
        .prepare("SELECT id, token FROM claims")
        .all()
        .map((r) => [String(r.id), String(r.token)]),
    );
    /** @type {string[]} */
    const dropIds = [];
    for (const row of rows) {
      const rec = JSON.parse(String(row.json));
      const id = String(row.id);
      const inten = currentIntensity(rec, nowMs);
      if (claims.has(id) && inten < floor) {
        dropIds.push(id);
      }
    }
    const run = db.transaction(() => {
      for (const id of dropIds) {
        db.prepare("DELETE FROM claims WHERE id = ?").run(id);
        db.prepare("DELETE FROM pheromones WHERE id = ?").run(id);
      }
    });
    run();
    const kept = Number(db.prepare("SELECT COUNT(*) AS c FROM pheromones").get().c);
    const bytesAfter = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    sbpLog({
      event: "compaction_done",
      store: "sqlite",
      kept,
      dropped: dropIds.length,
      durationMs: Date.now() - t0,
      bytesBefore,
      bytesAfter,
    });
    return { kept, dropped: dropIds.length };
  } finally {
    db.close();
  }
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
  const maxBytes = Number(process.env.SBP_LEDGER_MAX_BYTES ?? 0);
  const handle = si(() => {
    try {
      let forceSizeRotation = false;
      if (maxBytes > 0 && fs.existsSync(filePath) && fs.statSync(filePath).size > maxBytes) {
        forceSizeRotation = true;
      }
      compact(filePath, { nowMs: now(), forceSizeRotation });
    } catch (e) {
      sbpLog({ event: "decay_gc_error", err: String(e && e.message ? e.message : e) });
    }
  }, intervalMs);
  return { stop: () => ci(handle) };
}

/**
 * @param {{
 *   store?: MemoryLedgerStore;
 *   stanceTargets?: Set<string> | null;
 *   storeLabel?: "memory" | "jsonl" | "sqlite";
 *   authTokens?: Map<string, { agentId: string, class: "worker" | "privileged" }> | null;
 *   kindRegistry?: Map<string, { publishableBy: Set<string> }> | null;
 *   inflateBudget?: { maxPerWindow: number, windowSeconds: number } | null;
 * }} [options]
 */
export function createLedgerServer(options = {}) {
  const store = options.store ?? new MemoryLedgerStore();
  /** @type {Set<string> | null} */
  const stanceTargets = options.stanceTargets ?? null;
  const storeLabel =
    options.storeLabel ?? (typeof store.storeKind === "function" ? store.storeKind() : "memory");
  // Identity resolution (FR-9.1) only activates when authTokens is configured — absent it, every
  // mutating route behaves exactly as before (open mode; single-operator behavior unchanged).
  const authTokens = options.authTokens ?? null;
  const kindRegistry = options.kindRegistry ?? null;
  const inflateBudget = options.inflateBudget ?? null;
  /** @type {Map<string, { windowStart: number, count: number }>} */
  const inflateBudgetState = new Map();
  const clients = new Set();

  /**
   * @param {import("node:http").IncomingMessage} req
   * @returns {{ agentId: string, class: "worker" | "privileged" } | { error: "missing_token" | "unknown_token" }}
   */
  function resolveIdentity(req) {
    const header = req.headers.authorization || "";
    const m = /^Bearer (.+)$/.exec(header);
    if (!m) return { error: "missing_token" };
    const identity = authTokens.get(m[1]);
    if (!identity) return { error: "unknown_token" };
    return identity;
  }

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
    if (req.method === "GET" && url.pathname === "/healthz") {
      let ok = true;
      try {
        store.healthPing();
      } catch {
        ok = false;
      }
      const body = JSON.stringify({
        ok,
        store: storeLabel,
        replayedAt: store.replayedAt ?? null,
        pheromones: store.ledger.size,
        claims: store.claims.size,
      });
      res.writeHead(ok ? 200 : 503, { "Content-Type": "application/json" });
      res.end(body);
      sbpLog({ event: "healthz", ok, store: storeLabel });
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
        if (stanceTargets && !stanceTargets.has(json.stanceTarget)) {
          res.writeHead(400).end("stance_unknown");
          sbpLog({
            event: "stance_unknown",
            id: json.id,
            stanceTarget: json.stanceTarget,
          });
          return;
        }
        json.kind = json.kind || "signal";
        if (authTokens) {
          const identity = resolveIdentity(req);
          if ("error" in identity) {
            const status = identity.error === "missing_token" ? 401 : 403;
            res.writeHead(status).end(`auth_error:${status}:${identity.error}`);
            sbpLog({ event: "auth_error", route: "publish", reason: identity.error, id: json.id });
            return;
          }
          if (kindRegistry) {
            const kindEntry = kindRegistry.get(json.kind);
            if (!kindEntry) {
              res.writeHead(400).end("kind_unregistered");
              sbpLog({ event: "kind_unregistered", id: json.id, kind: json.kind });
              return;
            }
            if (!kindEntry.publishableBy.has(identity.class)) {
              res.writeHead(403).end("auth_error:403:kind_privileged");
              sbpLog({
                event: "auth_error",
                route: "publish",
                reason: "kind_privileged",
                id: json.id,
                kind: json.kind,
                class: identity.class,
              });
              return;
            }
          }
          json.agentId = identity.agentId;
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
      if (authTokens) {
        const identity = resolveIdentity(req);
        if ("error" in identity) {
          const status = identity.error === "missing_token" ? 401 : 403;
          res.writeHead(status).end(`auth_error:${status}:${identity.error}`);
          sbpLog({ event: "auth_error", route: "claim", reason: identity.error, id });
          return;
        }
      }
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
      if (authTokens) {
        const identity = resolveIdentity(req);
        if ("error" in identity) {
          const status = identity.error === "missing_token" ? 401 : 403;
          res.writeHead(status).end(`auth_error:${status}:${identity.error}`);
          sbpLog({ event: "auth_error", route: "inflate", reason: identity.error, id });
          return;
        }
        if (inflateBudget) {
          const now = Date.now();
          const windowMs = inflateBudget.windowSeconds * 1000;
          const state = inflateBudgetState.get(identity.agentId);
          if (!state || now - state.windowStart >= windowMs) {
            inflateBudgetState.set(identity.agentId, { windowStart: now, count: 1 });
          } else if (state.count >= inflateBudget.maxPerWindow) {
            res.writeHead(429).end("auth_error:429:inflate_budget");
            sbpLog({ event: "auth_error", route: "inflate", reason: "inflate_budget", id, agentId: identity.agentId });
            return;
          } else {
            state.count += 1;
          }
        }
      }
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

/**
 * @param {string} targetPath
 * @param {object} payload
 */
function writeRuntimeFileAtomic(targetPath, payload) {
  const dir = path.dirname(path.resolve(targetPath));
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${path.resolve(targetPath)}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(payload), "utf8");
  fs.renameSync(tmp, path.resolve(targetPath));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const supervised = (process.env.SBP_SUPERVISED || "").trim() === "1";
  const worktree = (process.env.STIGMERGY_WORKTREE || "").trim();
  let jsonlPath = (process.env.SBP_LEDGER_JSONL || "").trim();
  let sqlitePath = (process.env.SBP_LEDGER_SQLITE || "").trim();
  if (jsonlPath && sqlitePath) {
    console.error("sbp: set only one of SBP_LEDGER_JSONL or SBP_LEDGER_SQLITE");
    process.exit(1);
  }
  if (supervised && !sqlitePath && !jsonlPath) {
    if (!worktree) {
      console.error("sbp: SBP_SUPERVISED=1 requires STIGMERGY_WORKTREE or explicit SBP_LEDGER_SQLITE / SBP_LEDGER_JSONL");
      process.exit(1);
    }
    const stDir = path.join(path.resolve(worktree), ".stigmergy");
    fs.mkdirSync(stDir, { recursive: true });
    sqlitePath = path.join(stDir, "ledger.db");
  }
  /** @type {MemoryLedgerStore} */
  let store;
  let decayPath = "";
  /** @type {"memory"|"jsonl"|"sqlite"} */
  let storeLabel = "memory";
  try {
    if (sqlitePath) {
      store = new SqliteLedgerStore(sqlitePath);
      decayPath = sqlitePath;
      storeLabel = "sqlite";
    } else if (jsonlPath) {
      store = new JsonlLedgerStore(jsonlPath);
      decayPath = jsonlPath;
      storeLabel = "jsonl";
    } else {
      store = new MemoryLedgerStore();
    }
  } catch (e) {
    if (e && e.code === "ELEDGERLOCKED") {
      console.error(e.message || String(e));
      process.exit(75);
    }
    throw e;
  }
  const compactFn =
    storeLabel === "sqlite" ? compactSqliteLedger : storeLabel === "jsonl" ? compactJsonlLedger : null;
  const decayGc =
    decayPath && compactFn
      ? scheduleDecayGc(decayPath, { compact: compactFn, ledgerStoreKind: storeLabel })
      : { stop: () => {} };
  const reg = (process.env.SBP_STANCE_REGISTRY || "").trim();
  /** @type {Set<string> | null} */
  let stanceTargets = null;
  if (reg) {
    stanceTargets = loadStanceRegistry(reg);
  }
  const authTokensFile = (process.env.SBP_AUTH_TOKENS_FILE || "").trim();
  const authTokens = authTokensFile ? loadAuthTokens(authTokensFile) : null;
  const kindRegistryFile = (process.env.SBP_KIND_REGISTRY_FILE || "").trim();
  const kindRegistry = kindRegistryFile ? loadKindRegistry(kindRegistryFile) : null;
  const inflateMaxPerWindow = Number(process.env.SBP_INFLATE_MAX_PER_WINDOW ?? 0);
  const inflateWindowSeconds = Number(process.env.SBP_INFLATE_WINDOW_SECONDS ?? 0);
  const inflateBudget =
    inflateMaxPerWindow > 0 && inflateWindowSeconds > 0
      ? { maxPerWindow: inflateMaxPerWindow, windowSeconds: inflateWindowSeconds }
      : null;
  const { server } = createLedgerServer({
    store,
    stanceTargets,
    storeLabel,
    authTokens,
    kindRegistry,
    inflateBudget,
  });
  const portEnv = process.env.PORT;
  const port = portEnv === undefined || portEnv === "" ? 3847 : Number(portEnv);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error("sbp: invalid PORT");
    process.exit(1);
  }
  const runtimeFile = (process.env.SBP_RUNTIME_FILE || "").trim();
  const host = "127.0.0.1";
  server.listen(port, host, () => {
    const addr = server.address();
    const actualPort = addr && typeof addr === "object" ? addr.port : port;
    const extra =
      storeLabel === "jsonl" ? ` jsonl=${jsonlPath}` : storeLabel === "sqlite" ? ` sqlite=${sqlitePath}` : "";
    console.error(`sbp listening ${actualPort}${extra}`);
    if (runtimeFile) {
      try {
        writeRuntimeFileAtomic(runtimeFile, {
          url: `http://127.0.0.1:${actualPort}`,
          port: actualPort,
          pid: process.pid,
          startedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error("sbp: failed to write SBP_RUNTIME_FILE", e);
        process.exit(1);
      }
    }
  });
  const shutdownGc = () => decayGc.stop();
  process.once("SIGINT", shutdownGc);
  process.once("SIGTERM", shutdownGc);
}

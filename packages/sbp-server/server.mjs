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

export function validate(body) {
  if (typeof body.id !== "string" || !body.id) return "missing id";
  if (typeof body.stanceTarget !== "string") return "stanceTarget";
  if (typeof body.baseIntensity !== "number") return "baseIntensity";
  if (typeof body.decayRate !== "number") return "decayRate";
  if (body.seq !== undefined && typeof body.seq !== "number") return "seq";
  return null;
}

/** In-memory ledger + claims (default). */
export class MemoryLedgerStore {
  /** @type {Map<string, object>} */
  ledger = new Map();
  /** @type {Map<string, string>} */
  claims = new Map();

  /** @param {object} json validated POST body */
  publish(json) {
    this.ledger.set(json.id, { ...json, intensity: json.baseIntensity });
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
    cur.intensity = (cur.intensity || cur.baseIntensity) + 1;
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
        super.publish(ev.payload);
      } else if (ev.type === "claim" && ev.id && ev.token) {
        this.replayClaim(ev.id, ev.token);
      } else if (ev.type === "inflate" && ev.id) {
        super.inflate(ev.id);
      }
    }
  }

  publish(json) {
    this._appendLine({ type: "publish", payload: json });
    super.publish(json);
  }

  claim(id, token) {
    this._appendLine({ type: "claim", id, token });
    super.claim(id, token);
    return true;
  }

  inflate(id) {
    this._appendLine({ type: "inflate", id });
    return super.inflate(id);
  }
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
      return;
    }
    if (req.method === "GET" && url.pathname === "/pheromones") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify([...store.ledger.values()]));
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
          return;
        }
        store.publish(json);
        broadcast("pheromone", json);
        res.writeHead(201).end("ok");
      });
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/pheromones/") && url.pathname.endsWith("/claim")) {
      const id = url.pathname.split("/")[2];
      if (store.claims.has(id)) {
        res.writeHead(409).end("claimed");
        return;
      }
      const token = randomUUID();
      store.claim(id, token);
      broadcast("claim", { id });
      res.writeHead(200).end("ok");
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/pheromones/") && url.pathname.endsWith("/inflate")) {
      const id = url.pathname.split("/")[2];
      if (!store.inflate(id)) {
        res.writeHead(404).end("missing");
        return;
      }
      const cur = store.ledger.get(id);
      broadcast("inflate", { id, intensity: cur.intensity });
      res.writeHead(200).end("ok");
      return;
    }
    res.writeHead(404).end("not found");
  });

  return { server, ledger: store.ledger, claims: store.claims, store };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const logPath = process.env.SBP_LEDGER_JSONL;
  const store = logPath ? new JsonlLedgerStore(logPath) : new MemoryLedgerStore();
  const { server } = createLedgerServer({ store });
  const port = Number(process.env.PORT || 3847);
  server.listen(port, () => console.error(`sbp listening ${port}${logPath ? ` jsonl=${logPath}` : ""}`));
}

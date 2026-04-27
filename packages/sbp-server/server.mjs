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
  return null;
}

export function createLedgerServer() {
  const ledger = new Map();
  const claims = new Map();
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
      res.end(JSON.stringify([...ledger.values()]));
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
        ledger.set(json.id, { ...json, intensity: json.baseIntensity });
        broadcast("pheromone", json);
        res.writeHead(201).end("ok");
      });
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/pheromones/") && url.pathname.endsWith("/claim")) {
      const id = url.pathname.split("/")[2];
      if (claims.has(id)) {
        res.writeHead(409).end("claimed");
        return;
      }
      claims.set(id, randomUUID());
      broadcast("claim", { id });
      res.writeHead(200).end("ok");
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/pheromones/") && url.pathname.endsWith("/inflate")) {
      const id = url.pathname.split("/")[2];
      const cur = ledger.get(id);
      if (!cur) {
        res.writeHead(404).end("missing");
        return;
      }
      cur.intensity = (cur.intensity || cur.baseIntensity) + 1;
      ledger.set(id, cur);
      broadcast("inflate", { id, intensity: cur.intensity });
      res.writeHead(200).end("ok");
      return;
    }
    res.writeHead(404).end("not found");
  });

  return { server, ledger, claims };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { server } = createLedgerServer();
  const port = Number(process.env.PORT || 3847);
  server.listen(port, () => console.error(`sbp listening ${port}`));
}

import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createLedgerServer, MemoryLedgerStore } from "../server.mjs";

test("GET /stream sends hello then pheromone SSE after POST /pheromones", async () => {
  const store = new MemoryLedgerStore();
  const { server } = createLedgerServer({ store });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const chunks = [];
  const req = http.request(
    { hostname: "127.0.0.1", port, path: "/stream", method: "GET" },
    (res) => {
      assert.equal(res.statusCode, 200);
      assert.equal(res.headers["content-type"], "text/event-stream");
      res.on("data", (c) => chunks.push(c));
    },
  );
  req.on("error", () => {});
  req.end();
  await new Promise((r) => setTimeout(r, 40));

  const pid = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee";
  const body = JSON.stringify({
    id: pid,
    stanceTarget: "feature_implementation",
    baseIntensity: 1,
    decayRate: 0.01,
  });
  await drain(await post(`${base}/pheromones`, body));
  await new Promise((r) => setTimeout(r, 60));

  const text = Buffer.concat(chunks).toString("utf8");
  assert.match(text, /event:\s*hello/);
  assert.match(text, /event:\s*pheromone/);
  req.destroy();
  server.closeAllConnections?.();
  server.close();
  await once(server, "close");
});

function post(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: { "Content-Length": Buffer.byteLength(body) },
      },
      resolve,
    );
    req.on("error", reject);
    req.end(body);
  });
}

function drain(res) {
  return new Promise((resolve, reject) => {
    res.on("data", () => {});
    res.on("end", resolve);
    res.on("error", reject);
  });
}

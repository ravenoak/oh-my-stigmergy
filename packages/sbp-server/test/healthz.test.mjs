import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createLedgerServer, MemoryLedgerStore } from "../server.mjs";

test("GET /healthz memory store", async () => {
  const store = new MemoryLedgerStore();
  const { server } = createLedgerServer({ store, storeLabel: "memory" });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const res = await get(`http://127.0.0.1:${port}/healthz`);
  assert.equal(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assert.equal(j.ok, true);
  assert.equal(j.store, "memory");
  assert.equal(j.pheromones, 0);
  server.close();
  await once(server, "close");
});

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    http
      .get({ hostname: u.hostname, port: u.port, path: u.pathname }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      })
      .on("error", reject);
  });
}

import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createLedgerServer, currentIntensity } from "../server.mjs";

test("POST pheromone then claim idempotent conflict", async () => {
  const { server, ledger } = createLedgerServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const base = `http://127.0.0.1:${port}`;

  try {
    const body = JSON.stringify({
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      stanceTarget: "security_auditing",
      baseIntensity: 1,
      decayRate: 0.05,
    });
    await drain(await post(`${base}/pheromones`, body));
    await drain(await post(`${base}/pheromones/f47ac10b-58cc-4372-a567-0e02b2c3d479/claim`, ""));
    const r409 = await post(`${base}/pheromones/f47ac10b-58cc-4372-a567-0e02b2c3d479/claim`, "");
    await drain(r409);
    assert.equal(r409.statusCode, 409);

    await drain(await post(`${base}/pheromones/f47ac10b-58cc-4372-a567-0e02b2c3d479/inflate`, ""));
    const rec = ledger.get("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    const now = rec.publishedAt;
    assert.ok(Math.abs(currentIntensity(rec, now) - 2) < 1e-6);
  } finally {
    server.closeAllConnections?.();
    server.close();
    await once(server, "close");
  }
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

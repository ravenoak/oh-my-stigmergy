import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createLedgerServer } from "../server.mjs";

test("bulk publish + claim stays within CI SLO (p95)", async () => {
  const k = 80;
  const { server } = createLedgerServer();
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const ids = [];
  const publishTimes = [];
  for (let i = 0; i < k; i += 1) {
    const id = randomUUID();
    ids.push(id);
    const body = JSON.stringify({
      id,
      stanceTarget: "load",
      baseIntensity: 1,
      decayRate: 0.01,
    });
    const t0 = performance.now();
    await drain(await post(`${base}/pheromones`, body));
    publishTimes.push(performance.now() - t0);
  }

  const claimTimes = [];
  for (const id of ids) {
    const t0 = performance.now();
    await drain(await post(`${base}/pheromones/${id}/claim`, ""));
    claimTimes.push(performance.now() - t0);
  }

  const p95 = (arr) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(0.95 * (s.length - 1))];
  };
  /** CI SLO (see docs/operations/sbp-slo.md) */
  const sloMs = 80;
  assert.ok(p95(publishTimes) < sloMs, `publish p95 ${p95(publishTimes)}ms`);
  assert.ok(p95(claimTimes) < sloMs, `claim p95 ${p95(claimTimes)}ms`);

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

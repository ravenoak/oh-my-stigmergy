import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createLedgerServer, currentIntensity } from "../server.mjs";

test("inflate raises intensity floor", async () => {
  const { server, ledger } = createLedgerServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const body = JSON.stringify({
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    stanceTarget: "feature_implementation",
    baseIntensity: 0.1,
    decayRate: 0.5,
  });
  await drain(await post(`${base}/pheromones`, body));
  await drain(await post(`${base}/pheromones/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/inflate`, ""));
  const rec = ledger.get("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  assert.ok(currentIntensity(rec, Date.now()) > 0.1);
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

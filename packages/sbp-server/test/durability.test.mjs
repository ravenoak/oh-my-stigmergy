import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createLedgerServer, currentIntensity, JsonlLedgerStore } from "../server.mjs";

test("JsonlLedgerStore survives restart with identical ledger + claims", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-dur-"));
  const ledgerPath = path.join(dir, "ledger.jsonl");

  const store1 = new JsonlLedgerStore(ledgerPath);
  const { server: s1 } = createLedgerServer({ store: store1 });
  await new Promise((r) => s1.listen(0, r));
  const port1 = s1.address().port;
  const base1 = `http://127.0.0.1:${port1}`;
  const pid = "11111111-2222-4333-8444-555555555555";
  const body = JSON.stringify({
    id: pid,
    stanceTarget: "security_auditing",
    baseIntensity: 1,
    decayRate: 0.05,
  });
  await drain(await post(`${base1}/pheromones`, body));
  await drain(await post(`${base1}/pheromones/${pid}/claim`, ""));
  await drain(await post(`${base1}/pheromones/${pid}/inflate`, ""));
  s1.closeAllConnections?.();
  s1.close();
  await once(s1, "close");

  const store2 = new JsonlLedgerStore(ledgerPath);
  const { server: s2, ledger, claims } = createLedgerServer({ store: store2 });
  assert.ok(Math.abs(currentIntensity(ledger.get(pid), Date.now()) - 2) < 0.01);
  assert.ok(claims.has(pid));
  s2.closeAllConnections?.();
  s2.close();
  await once(s2, "close");
});

test("JsonlLedgerStore skips truncated tail line on replay", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-trunc-"));
  const ledgerPath = path.join(dir, "ledger.jsonl");
  const good = JSON.stringify({
    type: "publish",
    payload: {
      id: "22222222-3333-4444-8555-666666666666",
      stanceTarget: "x",
      baseIntensity: 0.5,
      decayRate: 0.1,
    },
  });
  fs.writeFileSync(ledgerPath, `${good}\n{"type":`, "utf8");

  const store = new JsonlLedgerStore(ledgerPath);
  const { server } = createLedgerServer({ store });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const res = await get(`${base}/pheromones`);
  const rows = JSON.parse((await readBody(res)).toString("utf8"));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "22222222-3333-4444-8555-666666666666");
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

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "GET",
      },
      resolve,
    );
    req.on("error", reject);
    req.end();
  });
}

function drain(res) {
  return new Promise((resolve, reject) => {
    res.on("data", () => {});
    res.on("end", resolve);
    res.on("error", reject);
  });
}

function readBody(res) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => resolve(Buffer.concat(chunks)));
    res.on("error", reject);
  });
}

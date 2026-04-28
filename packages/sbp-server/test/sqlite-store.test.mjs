import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import http from "node:http";
import {
  compactSqliteLedger,
  createLedgerServer,
  currentIntensity,
  SqliteLedgerStore,
} from "../server.mjs";

test("SqliteLedgerStore persists publish + claim across reopen", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-sql-"));
  const db = path.join(dir, "ledger.db");
  const pid = "33333333-4444-4555-8666-777777777777";
  const s1 = new SqliteLedgerStore(db);
  s1.publish({
    id: pid,
    stanceTarget: "t",
    baseIntensity: 1,
    decayRate: 0,
  });
  assert.ok(s1.claim(pid, "tok1"));
  s1.close();

  const s2 = new SqliteLedgerStore(db);
  assert.ok(s2.ledger.has(pid));
  assert.equal(s2.claims.get(pid), "tok1");
  s2.close();
});

test("SqliteLedgerStore claim conflict returns false", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-sql2-"));
  const db = path.join(dir, "ledger.db");
  const s = new SqliteLedgerStore(db);
  const pid = "44444444-5555-4666-8777-888888888888";
  s.publish({ id: pid, stanceTarget: "t", baseIntensity: 0.5, decayRate: 0.1 });
  assert.equal(s.claim(pid, "a"), true);
  assert.equal(s.claim(pid, "b"), false);
  s.close();
});

test("compactSqliteLedger drops claimed low-intensity rows", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-sql3-"));
  const db = path.join(dir, "ledger.db");
  const nowMs = 2_000_000;
  const lowId = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee";
  const s = new SqliteLedgerStore(db);
  s.publish({
    id: lowId,
    stanceTarget: "s",
    baseIntensity: 0.001,
    decayRate: 80,
    publishedAt: 0,
    inflations: 0,
  });
  assert.ok(currentIntensity(s.ledger.get(lowId), nowMs) < 0.01);
  s.claim(lowId, "tok");
  s.close();
  const r = compactSqliteLedger(db, { nowMs, decayGcFloor: 0.01 });
  assert.ok(r.dropped >= 1);
  const s2 = new SqliteLedgerStore(db);
  assert.ok(!s2.ledger.has(lowId));
  s2.close();
});

test("GET /healthz on sqlite store returns 200", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-sql4-"));
  const db = path.join(dir, "ledger.db");
  const store = new SqliteLedgerStore(db);
  const { server } = createLedgerServer({ store, storeLabel: "sqlite" });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const res = await httpGet(`http://127.0.0.1:${port}/healthz`);
  assert.equal(res.statusCode, 200);
  const j = JSON.parse(res.body);
  assert.equal(j.ok, true);
  assert.equal(j.store, "sqlite");
  server.close();
  await once(server, "close");
  store.close();
});

function httpGet(url) {
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

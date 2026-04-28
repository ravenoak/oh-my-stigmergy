import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  compactJsonlLedger,
  currentIntensity,
  stableStringify,
} from "../server.mjs";

test("compactJsonlLedger drops claimed rows below intensity floor (stable bytes)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-compact-"));
  const ledgerPath = path.join(dir, "ledger.jsonl");
  const nowMs = 2_000_000;
  const lowId = "00000000-0000-4000-8000-000000000001";
  const highId = "ffffffff-ffff-4fff-bfff-ffffffffffff";
  const lowPayload = {
    id: lowId,
    stanceTarget: "s",
    baseIntensity: 0.001,
    decayRate: 80,
    publishedAt: 0,
    inflations: 0,
  };
  assert.ok(currentIntensity(lowPayload, nowMs) < 0.01);
  const highPayload = {
    id: highId,
    stanceTarget: "t",
    baseIntensity: 1,
    decayRate: 0,
    publishedAt: nowMs,
    inflations: 0,
  };
  const lines = [
    stableStringify({ type: "publish", payload: lowPayload }),
    stableStringify({ type: "claim", id: lowId, token: "tok-low" }),
    stableStringify({ type: "publish", payload: highPayload }),
  ].join("\n");
  fs.writeFileSync(ledgerPath, `${lines}\n`, "utf8");

  const stats = compactJsonlLedger(ledgerPath, { nowMs, decayGcFloor: 0.01 });
  assert.deepEqual(stats, { kept: 1, dropped: 1 });

  const out = fs.readFileSync(ledgerPath, "utf8");
  const expected =
    `${stableStringify({ type: "publish", payload: highPayload })}\n`;
  assert.equal(out, expected);
});

test("compactJsonlLedger no-op when file missing", () => {
  const stats = compactJsonlLedger(path.join(os.tmpdir(), "no-such-ledger-xyz.jsonl"));
  assert.deepEqual(stats, { kept: 0, dropped: 0 });
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scheduleDecayGc, stableStringify, compactJsonlLedger } from "../server.mjs";

test("scheduleDecayGc passes forceSizeRotation when JSONL exceeds SBP_LEDGER_MAX_BYTES", () => {
  const prevMax = process.env.SBP_LEDGER_MAX_BYTES;
  process.env.SBP_LEDGER_MAX_BYTES = "500";
  try {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-size-rot-"));
    const ledgerPath = path.join(dir, "ledger.jsonl");
    const nowMs = 2_000_000;
    const id = "bbbbbbbb-cccc-4ddd-eeee-ffffffffffff";
    const payload = {
      id,
      stanceTarget: "s",
      baseIntensity: 1,
      decayRate: 0,
      publishedAt: nowMs,
      inflations: 0,
    };
    const baseLines = [
      stableStringify({ type: "publish", payload }),
      stableStringify({ type: "claim", id, token: "tok-1" }),
    ];
    const padding = [];
    for (let i = 0; i < 40; i++) {
      padding.push(JSON.stringify({ type: "noop", n: i, pad: "y".repeat(50) }));
    }
    fs.writeFileSync(ledgerPath, [...baseLines, ...padding].join("\n") + "\n", "utf8");
    assert.ok(fs.statSync(ledgerPath).size > 500);

    let sawForceSizeRotation = false;
    const mockCompact = (p, opts) => {
      if (opts && opts.forceSizeRotation === true) sawForceSizeRotation = true;
      return compactJsonlLedger(p, opts);
    };

    const h = scheduleDecayGc(ledgerPath, {
      intervalMs: 5,
      setInterval: (fn) => {
        fn();
        return 1;
      },
      clearInterval: () => {},
      compact: mockCompact,
      nowMs: () => nowMs,
    });
    assert.equal(sawForceSizeRotation, true);
    h.stop();
  } finally {
    if (prevMax === undefined) delete process.env.SBP_LEDGER_MAX_BYTES;
    else process.env.SBP_LEDGER_MAX_BYTES = prevMax;
  }
});

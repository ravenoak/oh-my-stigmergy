import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { JsonlLedgerStore } from "../server.mjs";

test("second JsonlLedgerStore on same file throws ELEDGERLOCKED", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-mw-"));
  const ledgerPath = path.join(dir, "ledger.jsonl");
  const a = new JsonlLedgerStore(ledgerPath);
  assert.throws(
    () => {
      new JsonlLedgerStore(ledgerPath);
    },
    (e) => e && e.code === "ELEDGERLOCKED",
  );
  a.releaseWriterLock();
});

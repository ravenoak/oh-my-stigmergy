import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("metrics CLI summarizes NDJSON audit log", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-metrics-"));
  const logf = path.join(dir, "sbp.ndjson");
  const t0 = 1_700_000_000_000;
  const lines = [
    JSON.stringify({ ts: t0, event: "healthz", ok: true, store: "memory" }),
    JSON.stringify({ ts: t0 + 1, event: "publish", id: "a", intensity: 1.0 }),
    JSON.stringify({ ts: t0 + 2, event: "claim", id: "a" }),
    JSON.stringify({ ts: t0 + 3, event: "claim_conflict", id: "a" }),
    JSON.stringify({ ts: t0 + 4, event: "inflate", id: "a", intensity: 2.0 }),
    JSON.stringify({
      ts: t0 + 5,
      event: "compaction_done",
      store: "jsonl",
      kept: 10,
      dropped: 2,
      durationMs: 7,
      bytesBefore: 100,
      bytesAfter: 50,
    }),
    JSON.stringify({ ts: t0 + 6, event: "decay_gc_error", err: "boom" }),
    "{not json",
    "",
  ];
  fs.writeFileSync(logf, `${lines.join("\n")}\n`, "utf8");

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const pkgRoot = path.resolve(__dirname, "..");
  const r = spawnSync(process.execPath, [path.join("bin", "metrics.mjs"), logf], {
    cwd: pkgRoot,
    encoding: "utf8",
  });
  assert.equal(r.status, 0, `stderr: ${r.stderr}`);
  const out = JSON.parse(String(r.stdout).trim());

  assert.equal(out.version, 1);
  assert.equal(out.input.parsed, 7);
  assert.ok(out.input.skipped >= 1);
  assert.deepEqual(out.window, { startTs: t0, endTs: t0 + 6, durationMs: 6 });

  assert.equal(out.pheromones.published, 1);
  assert.equal(out.pheromones.claimed, 1);
  assert.equal(out.pheromones.inflated, 1);
  assert.equal(out.pheromones.claimConflicts, 1);

  assert.equal(out.http.healthz, 1);
  assert.equal(out.compaction.runs, 1);
  assert.equal(out.compaction.decayGcErrors, 1);
  assert.equal(out.compaction.byStore.jsonl.runs, 1);
  assert.equal(out.compaction.byStore.jsonl.kept, 10);
  assert.equal(out.compaction.byStore.jsonl.dropped, 2);
  assert.equal(out.compaction.byStore.jsonl.bytesBefore, 100);
  assert.equal(out.compaction.byStore.jsonl.bytesAfter, 50);
  assert.equal(out.compaction.byStore.jsonl.durationMsP95, 7);
});

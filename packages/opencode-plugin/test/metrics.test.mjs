import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("metrics CLI summarizes plugin NDJSON audit log", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-metrics-"));
  const logf = path.join(dir, "audit.ndjson");
  const t0 = 1_700_000_100_000;
  const lines = [
    JSON.stringify({ ts: t0, event: "plugin_initialized", baseUrl: "http://x", repoRoot: "/r", auditEnabled: true }),
    JSON.stringify({
      ts: t0 + 1,
      event: "tool_execute",
      tool: "stigmergy_publish",
      ok: true,
      class: "ok",
      durationMs: 5,
      repoRoot: "/r",
    }),
    JSON.stringify({
      ts: t0 + 2,
      event: "tool_execute",
      tool: "stigmergy_claim",
      ok: false,
      class: "claimed_conflict",
      durationMs: 3,
      repoRoot: "/r",
    }),
    JSON.stringify({ ts: t0 + 3, event: "sbp_publish_attempt", reason: "session_idle", id: "u" }),
    JSON.stringify({ ts: t0 + 4, event: "sbp_publish_error", reason: "session_idle", id: "u", err: "x" }),
    "{bad",
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
  assert.ok(out.input.skipped >= 1);
  assert.equal(out.events.byEvent.plugin_initialized, 1);
  assert.equal(out.events.byEvent.tool_execute, 2);
  assert.equal(out.tools.byTool.stigmergy_publish.executions, 1);
  assert.equal(out.tools.byTool.stigmergy_claim.fail, 1);
  assert.equal(out.tools.byClass.ok, 1);
  assert.equal(out.tools.byClass.claimed_conflict, 1);
  assert.equal(out.eventPublish.attempt, 1);
  assert.equal(out.eventPublish.error, 1);
});

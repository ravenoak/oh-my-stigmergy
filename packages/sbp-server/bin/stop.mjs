#!/usr/bin/env node
/**
 * Gracefully stop a supervised SBP: reads `.stigmergy/runtime.json` under the worktree (argv or STIGMERGY_WORKTREE).
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const worktree = (process.argv[2] || process.env.STIGMERGY_WORKTREE || "").trim();
if (!worktree) {
  console.error("usage: node bin/stop.mjs <worktree-dir>");
  console.error("   or: STIGMERGY_WORKTREE=/path node bin/stop.mjs");
  process.exit(2);
}

const runtimePath = path.join(path.resolve(worktree), ".stigmergy", "runtime.json");
if (!fs.existsSync(runtimePath)) {
  console.error(`no runtime file at ${runtimePath}`);
  process.exit(1);
}

let runtime;
try {
  runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
} catch (e) {
  console.error("failed to read runtime.json", e);
  process.exit(1);
}

const pid = runtime.pid;
if (typeof pid !== "number" || pid <= 0) {
  console.error("runtime.json missing valid pid");
  process.exit(1);
}

try {
  process.kill(pid, "SIGTERM");
  console.error(`sent SIGTERM to sbp pid=${pid}`);
} catch (e) {
  if (e && /** @type {NodeJS.ErrnoException} */ (e).code === "ESRCH") {
    console.error(`pid ${pid} not running`);
    process.exit(1);
  }
  throw e;
}

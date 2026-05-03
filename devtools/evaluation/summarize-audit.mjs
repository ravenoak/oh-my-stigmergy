#!/usr/bin/env node
/**
 * Deterministic NDJSON audit summarizer for Phase 20 metrics M3/M4(a).
 * Input: path to STIGMERGY_AUDIT_LOG_FILE output (one JSON object per line).
 * Output: single CSV header + one data row to stdout.
 */
import fs from "node:fs";
import readline from "node:readline";

const MISCONF_EVENTS = new Set([
  "supervision_resolve_failed",
  "supervision_spawn_timeout",
  "supervision_outer_timeout",
]);

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: summarize-audit.mjs <audit.ndjson>");
    process.exit(2);
  }

  let misconfiguration_events = 0;
  let tool_execute_total = 0;
  let stigmergy_publish_count = 0;

  const stream = fs.createReadStream(path, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let row;
    try {
      row = JSON.parse(trimmed);
    } catch {
      continue;
    }
    const ev = row.event;
    if (typeof ev === "string" && MISCONF_EVENTS.has(ev)) {
      misconfiguration_events += 1;
    }
    if (ev === "tool_execute") {
      tool_execute_total += 1;
      if (row.tool === "stigmergy_publish") {
        stigmergy_publish_count += 1;
      }
    }
  }

  console.log(
    "misconfiguration_events,tool_execute_total,stigmergy_publish_count",
  );
  console.log(
    `${misconfiguration_events},${tool_execute_total},${stigmergy_publish_count}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

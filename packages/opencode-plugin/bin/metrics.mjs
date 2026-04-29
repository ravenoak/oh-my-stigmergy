#!/usr/bin/env node
/**
 * Summarize OpenCode plugin NDJSON audit logs (STIGMERGY_AUDIT_LOG_FILE).
 *
 * Usage:
 *   node bin/metrics.mjs <audit.ndjson>
 *
 * Output: JSON summary on stdout.
 */
import fs from "node:fs";
import path from "node:path";

function usageExit() {
  console.error("usage: node bin/metrics.mjs <audit.ndjson>");
  process.exit(1);
}

/** @param {number[]} xs */
function p95(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(0.95 * (s.length - 1))];
}

/** @param {Record<string, number>} m @param {string} k */
function inc(m, k) {
  m[k] = (m[k] ?? 0) + 1;
}

const inPath = process.argv[2];
if (!inPath) usageExit();

const abs = path.resolve(inPath);
let raw;
try {
  raw = fs.readFileSync(abs, "utf8");
} catch (e) {
  console.error(`opencode-plugin metrics: cannot read ${abs}: ${String(e && e.message ? e.message : e)}`);
  process.exit(2);
}

const lines = raw.split("\n");
let parsed = 0;
let skipped = 0;

/** @type {Record<string, number>} */
const byEvent = {};

/** @type {Record<string, { executions: number; ok: number; fail: number; durationMsP95: number | null }>} */
const byTool = {};

/** @type {Record<string, number>} */
const byClass = {};

/** @type {number[]} */
const toolDurationsAll = [];

let minTs = null;
let maxTs = null;

/** @type {{ attempt: number; ok: number; failed: number; error: number }} */
const publish = { attempt: 0, ok: 0, failed: 0, error: 0 };

for (const ln of lines) {
  if (!ln.trim()) continue;
  let o;
  try {
    o = JSON.parse(ln);
  } catch {
    skipped += 1;
    continue;
  }
  if (!o || typeof o !== "object") {
    skipped += 1;
    continue;
  }
  const ts = o.ts;
  const ev = o.event;
  if (typeof ts !== "number" || typeof ev !== "string" || !ev) {
    skipped += 1;
    continue;
  }
  parsed += 1;
  inc(byEvent, ev);
  if (minTs === null || ts < minTs) minTs = ts;
  if (maxTs === null || ts > maxTs) maxTs = ts;

  if (ev === "tool_execute" && typeof o.tool === "string") {
    const toolName = o.tool;
    if (!byTool[toolName]) {
      byTool[toolName] = { executions: 0, ok: 0, fail: 0, durationMsP95: null };
    }
    byTool[toolName].executions += 1;
    if (o.ok === true) byTool[toolName].ok += 1;
    else if (o.ok === false) byTool[toolName].fail += 1;
    const cls = typeof o.class === "string" ? o.class : "other";
    inc(byClass, cls);
    const d = typeof o.durationMs === "number" ? o.durationMs : null;
    if (d !== null) {
      if (!byTool[toolName]._durations) byTool[toolName]._durations = [];
      byTool[toolName]._durations.push(d);
      toolDurationsAll.push(d);
    }
  }

  if (ev === "sbp_publish_attempt") publish.attempt += 1;
  if (ev === "sbp_publish_ok") publish.ok += 1;
  if (ev === "sbp_publish_failed") publish.failed += 1;
  if (ev === "sbp_publish_error") publish.error += 1;
}

for (const k of Object.keys(byTool)) {
  const t = byTool[k];
  const arr = t._durations;
  delete t._durations;
  t.durationMsP95 = Array.isArray(arr) ? p95(arr) : null;
}

const startTs = minTs ?? null;
const endTs = maxTs ?? null;
const durationMs = startTs !== null && endTs !== null ? Math.max(0, endTs - startTs) : null;

const summary = {
  version: 1,
  input: {
    path: abs,
    lines: lines.length,
    parsed,
    skipped,
  },
  window: {
    startTs,
    endTs,
    durationMs,
  },
  events: {
    total: Object.values(byEvent).reduce((a, b) => a + b, 0),
    byEvent,
  },
  tools: {
    byTool,
    byClass,
    durationMsP95All: p95(toolDurationsAll),
  },
  eventPublish: publish,
};

console.log(JSON.stringify(summary));

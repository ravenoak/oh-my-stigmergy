#!/usr/bin/env node
/**
 * Summarize SBP NDJSON audit logs into empirical signals.
 *
 * Usage:
 *   node bin/metrics.mjs <sbp.ndjson>
 *
 * Output:
 *   JSON summary on stdout (machine-readable).
 */
import fs from "node:fs";
import path from "node:path";

function usageExit() {
  console.error("usage: node bin/metrics.mjs <sbp.ndjson>");
  process.exit(1);
}

const inPath = process.argv[2];
if (!inPath) usageExit();

const abs = path.resolve(inPath);
let raw;
try {
  raw = fs.readFileSync(abs, "utf8");
} catch (e) {
  console.error(`sbp metrics: cannot read ${abs}: ${String(e && e.message ? e.message : e)}`);
  process.exit(2);
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

const lines = raw.split("\n");
let parsed = 0;
let skipped = 0;

/** @type {Record<string, number>} */
const byEvent = {};

/** @type {Set<string>} */
const publishedIds = new Set();
/** @type {Set<string>} */
const claimedIds = new Set();
/** @type {Set<string>} */
const inflatedIds = new Set();

/** @type {number[]} */
const compactionDurationsJsonl = [];
/** @type {number[]} */
const compactionDurationsSqlite = [];

/** @type {{ jsonl: { runs: number; kept: number; dropped: number; bytesBefore: number; bytesAfter: number }, sqlite: { runs: number; kept: number; dropped: number; bytesBefore: number; bytesAfter: number } }} */
const compactionAgg = {
  jsonl: { runs: 0, kept: 0, dropped: 0, bytesBefore: 0, bytesAfter: 0 },
  sqlite: { runs: 0, kept: 0, dropped: 0, bytesBefore: 0, bytesAfter: 0 },
};

let minTs = null;
let maxTs = null;

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

  if (ev === "publish" && typeof o.id === "string" && o.id) {
    publishedIds.add(o.id);
  }
  if (ev === "claim" && typeof o.id === "string" && o.id) {
    claimedIds.add(o.id);
  }
  if (ev === "inflate" && typeof o.id === "string" && o.id) {
    inflatedIds.add(o.id);
  }

  if (ev === "compaction_done") {
    const store = o.store === "sqlite" ? "sqlite" : o.store === "jsonl" ? "jsonl" : null;
    if (!store) continue;
    const kept = typeof o.kept === "number" ? o.kept : 0;
    const dropped = typeof o.dropped === "number" ? o.dropped : 0;
    const bytesBefore = typeof o.bytesBefore === "number" ? o.bytesBefore : 0;
    const bytesAfter = typeof o.bytesAfter === "number" ? o.bytesAfter : 0;
    const durationMs = typeof o.durationMs === "number" ? o.durationMs : null;
    compactionAgg[store].runs += 1;
    compactionAgg[store].kept += kept;
    compactionAgg[store].dropped += dropped;
    compactionAgg[store].bytesBefore += bytesBefore;
    compactionAgg[store].bytesAfter += bytesAfter;
    if (durationMs !== null) {
      if (store === "jsonl") compactionDurationsJsonl.push(durationMs);
      if (store === "sqlite") compactionDurationsSqlite.push(durationMs);
    }
  }
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
  pheromones: {
    published: publishedIds.size,
    claimed: claimedIds.size,
    inflated: inflatedIds.size,
    claimConflicts: byEvent.claim_conflict ?? 0,
    publishErrors: byEvent.publish_error ?? 0,
    stanceUnknown: byEvent.stance_unknown ?? 0,
    inflateMissing: byEvent.inflate_missing ?? 0,
  },
  sse: {
    opens: byEvent.sse_open ?? 0,
  },
  http: {
    notFound: byEvent.not_found ?? 0,
    healthz: byEvent.healthz ?? 0,
  },
  compaction: {
    runs: (byEvent.compaction_done ?? 0),
    decayGcErrors: byEvent.decay_gc_error ?? 0,
    byStore: {
      jsonl: { ...compactionAgg.jsonl, durationMsP95: p95(compactionDurationsJsonl) },
      sqlite: { ...compactionAgg.sqlite, durationMsP95: p95(compactionDurationsSqlite) },
    },
  },
};

console.log(JSON.stringify(summary));

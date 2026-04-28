#!/usr/bin/env node
/**
 * Manual JSONL ledger compaction (ADR-0009).
 * Usage: node bin/compact.mjs <ledger.jsonl>
 */
import path from "node:path";
import { compactJsonlLedger } from "../server.mjs";

const p = process.argv[2];
if (!p) {
  console.error("usage: node bin/compact.mjs <ledger.jsonl>");
  process.exit(1);
}
const abs = path.resolve(p);
const r = compactJsonlLedger(abs);
// stdout: machine-readable summary for scripts
console.log(JSON.stringify(r));

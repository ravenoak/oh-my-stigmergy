#!/usr/bin/env node
// Usage: node check-close.mjs <orderId>
// Prints the phaseTransition history for a work order so the operator can judge whether
// it's closed. No terminal-phase semantics are enforced (no taxonomy exists yet) — this
// is a read aid, not a gate.
import { checkClose } from "./lib.mjs";

const [orderId] = process.argv.slice(2);
if (!orderId) {
  console.error("usage: node check-close.mjs <orderId>");
  process.exit(2);
}

const { ok, status, text, marks } = await checkClose(orderId);
if (!ok) {
  console.error(`check-close: failed (${status}): ${text}`);
  process.exit(1);
}

if (marks.length === 0) {
  console.log(`check-close: no phaseTransition marks found for ${orderId}`);
  process.exit(0);
}

console.log(`check-close: phase history for ${orderId}`);
for (const m of marks) {
  console.log(`  ${new Date(m.publishedAt).toISOString()}  ${m.payload.phase}`);
}
console.log(`check-close: latest phase = ${marks[marks.length - 1].payload.phase}`);

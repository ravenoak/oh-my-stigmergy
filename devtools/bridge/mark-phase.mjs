#!/usr/bin/env node
// Usage: node mark-phase.mjs <orderId> <phase>
//
// phase is a free-form label, not a closed enum — no SDLC phase taxonomy has been
// established yet (docs/planning/orchestrator-implementation-plan.md §7). Use whatever
// label is meaningful for the work order; this CLI's job is to record it on the ledger,
// not to enforce a taxonomy that doesn't exist.
import { markPhase, warnIfNoSession } from "./lib.mjs";

const [orderId, phase] = process.argv.slice(2);
if (!orderId || !phase) {
  console.error("usage: node mark-phase.mjs <orderId> <phase>");
  process.exit(2);
}

warnIfNoSession();

const { ok, status, text } = await markPhase({ orderId, phase });

if (!ok) {
  console.error(`mark-phase: failed (${status}): ${text}`);
  process.exit(1);
}
console.log(`mark-phase: ok (${orderId} -> ${phase})`);

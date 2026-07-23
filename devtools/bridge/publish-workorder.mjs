#!/usr/bin/env node
// Usage: node publish-workorder.mjs <orderId> <goal> [--phase <phase>] [--stance <stanceTarget>]
import { publishWorkOrder, warnIfNoSession } from "./lib.mjs";

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--phase") flags.phase = argv[++i];
    else if (argv[i] === "--stance") flags.stance = argv[++i];
    else positional.push(argv[i]);
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const [orderId, goal] = positional;

if (!orderId || !goal) {
  console.error("usage: node publish-workorder.mjs <orderId> <goal> [--phase <phase>] [--stance <stanceTarget>]");
  process.exit(2);
}
if (!/^wo-[a-z0-9]{8,}$/.test(orderId)) {
  console.error(`orderId must match ^wo-[a-z0-9]{8,}$ (got "${orderId}")`);
  process.exit(2);
}
const createdBy = (process.env.STIGMERGY_AGENT_ID || "").trim();
if (!createdBy) {
  console.error("bridge: STIGMERGY_AGENT_ID must be set to the agentId matching your STIGMERGY_AGENT_TOKEN");
  process.exit(2);
}

warnIfNoSession();

const { ok, status, text } = await publishWorkOrder({
  orderId,
  goal,
  createdBy,
  phase: flags.phase,
  stance: flags.stance,
});

if (!ok) {
  console.error(`publish-workorder: failed (${status}): ${text}`);
  process.exit(1);
}
console.log(`publish-workorder: ok (${orderId})`);

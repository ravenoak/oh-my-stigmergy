#!/usr/bin/env node
import { appendLog, startSession } from "./lib.mjs";

try {
  const { sessionId, startedAt } = startSession();
  appendLog({ event: "session_start", startedAt });
  console.log(`bridge session started: ${sessionId}`);
} catch (e) {
  console.error(`bridge: ${e.message}`);
  process.exit(1);
}

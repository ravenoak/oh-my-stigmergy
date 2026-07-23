#!/usr/bin/env node
import { appendLog, endSession } from "./lib.mjs";

try {
  const { sessionId, startedAt, endedAt, durationMs } = endSession();
  // endSession() already cleared the state file, so pass sessionId explicitly —
  // appendLog's auto-lookup would otherwise find no open session.
  appendLog({ event: "session_end", sessionId, startedAt, endedAt, durationMs });
  console.log(`bridge session ended: ${sessionId} (${Math.round(durationMs / 1000)}s)`);
} catch (e) {
  console.error(`bridge: ${e.message}`);
  process.exit(1);
}

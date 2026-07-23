import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import { createLedgerServer } from "../../../packages/sbp-server/server.mjs";
import { checkClose, markPhase, publishWorkOrder } from "../lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bridgeDir = path.resolve(__dirname, "..");

async function withServer(fn) {
  const tokens = new Map([["test-token", { agentId: "test-agent", class: "worker" }]]);
  const { server, ledger } = createLedgerServer({ authTokens: tokens });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
  const prevUrl = process.env.SBP_URL;
  const prevToken = process.env.STIGMERGY_AGENT_TOKEN;
  process.env.SBP_URL = base;
  process.env.STIGMERGY_AGENT_TOKEN = "test-token";
  try {
    await fn({ base, ledger });
  } finally {
    if (prevUrl === undefined) delete process.env.SBP_URL;
    else process.env.SBP_URL = prevUrl;
    if (prevToken === undefined) delete process.env.STIGMERGY_AGENT_TOKEN;
    else process.env.STIGMERGY_AGENT_TOKEN = prevToken;
    server.close();
    await once(server, "close");
  }
}

function tmpLogEnv() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const logFile = path.join(dir, "log.ndjson");
  const prev = process.env.STIGMERGY_BRIDGE_LOG_FILE;
  process.env.STIGMERGY_BRIDGE_LOG_FILE = logFile;
  return {
    logFile,
    restore() {
      if (prev === undefined) delete process.env.STIGMERGY_BRIDGE_LOG_FILE;
      else process.env.STIGMERGY_BRIDGE_LOG_FILE = prev;
    },
  };
}

// --- Network-touching logic (lib.mjs), tested in-process — spawning a child process that
// makes its own network call hangs in this sandbox even for plain http.get to loopback
// (confirmed via isolated repro, independent of this bridge's own code), so these test the
// exported functions directly rather than spawning the CLI scripts. ---

test("publishWorkOrder round-trips against a real SBP server under identity", async () => {
  await withServer(async ({ ledger }) => {
    const log = tmpLogEnv();
    try {
      const { ok, status } = await publishWorkOrder({
        orderId: "wo-abcd1234",
        goal: "ship the thing",
        createdBy: "test-agent",
      });
      assert.equal(ok, true, `status=${status}`);

      const rows = [...ledger.values()];
      assert.equal(rows.length, 1);
      assert.equal(rows[0].kind, "workOrder");
      assert.equal(rows[0].payload.orderId, "wo-abcd1234");
      assert.equal(rows[0].agentId, "test-agent");

      const logLine = JSON.parse(fs.readFileSync(log.logFile, "utf8").trim());
      assert.equal(logLine.event, "publish_workorder");
      assert.equal(logLine.ok, true);
    } finally {
      log.restore();
    }
  });
});

test("publishWorkOrder with mismatched createdBy is rejected by the server", async () => {
  await withServer(async () => {
    const log = tmpLogEnv();
    try {
      const { ok, status, text } = await publishWorkOrder({
        orderId: "wo-abcd1234",
        goal: "ship the thing",
        createdBy: "someone-else",
      });
      assert.equal(ok, false);
      assert.equal(status, 403);
      assert.equal(text, "auth_error:403:provenance_mismatch");
    } finally {
      log.restore();
    }
  });
});

test("markPhase then checkClose shows phase history in order", async () => {
  await withServer(async () => {
    const log = tmpLogEnv();
    try {
      const m1 = await markPhase({ orderId: "wo-abcd1234", phase: "implement" });
      assert.equal(m1.ok, true);
      const m2 = await markPhase({ orderId: "wo-abcd1234", phase: "review" });
      assert.equal(m2.ok, true);

      const { ok, marks } = await checkClose("wo-abcd1234");
      assert.equal(ok, true);
      assert.equal(marks.length, 2);
      assert.equal(marks[0].payload.phase, "implement");
      assert.equal(marks[1].payload.phase, "review");
    } finally {
      log.restore();
    }
  });
});

test("checkClose reports no marks for an unknown order id", async () => {
  await withServer(async () => {
    const log = tmpLogEnv();
    try {
      const { ok, marks } = await checkClose("wo-99999999");
      assert.equal(ok, true);
      assert.equal(marks.length, 0);
    } finally {
      log.restore();
    }
  });
});

// --- Pure argv-validation paths (no network) — safe to exercise via the real CLI subprocess. ---

function runBridge(script, args, env) {
  return spawnSync(process.execPath, [path.join(bridgeDir, script), ...args], {
    cwd: bridgeDir,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

test("session-start then session-end logs session_start/session_end with a duration", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const logFile = path.join(dir, "log.ndjson");
  const stateFile = path.join(dir, "state.json");
  const env = { STIGMERGY_BRIDGE_LOG_FILE: logFile, STIGMERGY_BRIDGE_STATE_FILE: stateFile };

  const start = runBridge("session-start.mjs", [], env);
  assert.equal(start.status, 0, start.stderr);
  assert.match(start.stdout, /bridge session started: sess-/);

  const end = runBridge("session-end.mjs", [], env);
  assert.equal(end.status, 0, end.stderr);
  assert.match(end.stdout, /bridge session ended: sess-/);

  const lines = fs.readFileSync(logFile, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  assert.equal(lines[0].event, "session_start");
  assert.equal(lines[1].event, "session_end");
  assert.ok(lines[1].durationMs >= 0);
  assert.equal(lines[0].sessionId, lines[1].sessionId);
});

test("session-start twice without session-end errors instead of silently overwriting", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const env = {
    STIGMERGY_BRIDGE_LOG_FILE: path.join(dir, "log.ndjson"),
    STIGMERGY_BRIDGE_STATE_FILE: path.join(dir, "state.json"),
  };
  const first = runBridge("session-start.mjs", [], env);
  assert.equal(first.status, 0, first.stderr);
  const second = runBridge("session-start.mjs", [], env);
  assert.notEqual(second.status, 0);
  assert.match(second.stderr, /already open/);
});

test("session-end without an open session errors", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const env = {
    STIGMERGY_BRIDGE_LOG_FILE: path.join(dir, "log.ndjson"),
    STIGMERGY_BRIDGE_STATE_FILE: path.join(dir, "state.json"),
  };
  const r = runBridge("session-end.mjs", [], env);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /no bridge session is open/);
});

test("publish-workorder CLI rejects a malformed orderId before touching the network", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const env = {
    SBP_URL: "http://127.0.0.1:1", // unreachable — proves this is never contacted
    STIGMERGY_AGENT_ID: "test-agent",
    STIGMERGY_BRIDGE_LOG_FILE: path.join(dir, "log.ndjson"),
    STIGMERGY_BRIDGE_STATE_FILE: path.join(dir, "state.json"),
  };
  const r = runBridge("publish-workorder.mjs", ["not-a-valid-id", "goal"], env);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /orderId must match/);
});

test("publish-workorder CLI rejects a missing STIGMERGY_AGENT_ID before touching the network", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const env = {
    SBP_URL: "http://127.0.0.1:1",
    STIGMERGY_AGENT_ID: "",
    STIGMERGY_BRIDGE_LOG_FILE: path.join(dir, "log.ndjson"),
    STIGMERGY_BRIDGE_STATE_FILE: path.join(dir, "state.json"),
  };
  const r = runBridge("publish-workorder.mjs", ["wo-abcd1234", "goal"], env);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /STIGMERGY_AGENT_ID/);
});

test("mark-phase and check-close CLIs require their positional args", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bridge-test-"));
  const env = {
    STIGMERGY_BRIDGE_LOG_FILE: path.join(dir, "log.ndjson"),
    STIGMERGY_BRIDGE_STATE_FILE: path.join(dir, "state.json"),
  };
  const mark = runBridge("mark-phase.mjs", ["wo-abcd1234"], env);
  assert.equal(mark.status, 2);
  assert.match(mark.stderr, /usage:/);

  const close = runBridge("check-close.mjs", [], env);
  assert.equal(close.status, 2);
  assert.match(close.stderr, /usage:/);
});

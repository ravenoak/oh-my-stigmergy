import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createLedgerServer, loadAuthTokens } from "../../sbp-server/server.mjs";
import StigmergyPluginModule, { StigmergyPlugin, server } from "../src/index.mjs";

/** @returns {import("@opencode-ai/plugin").ToolContext} */
function toolCtx(over = {}) {
  return {
    sessionID: "sid",
    messageID: "mid",
    agent: "agent",
    directory: "/tmp",
    worktree: "/tmp",
    abort: new AbortController().signal,
    metadata() {},
    ask() {
      return /** @type {any} */ ({});
    },
    ...over,
  };
}

test("module default export matches PluginModule shape for @opencode-ai/plugin 1.14.x", () => {
  assert.equal(typeof StigmergyPluginModule, "object");
  assert.equal(StigmergyPluginModule.id, "@oh-my-stigmergy/opencode-plugin");
  assert.equal(typeof StigmergyPluginModule.server, "function");
  assert.equal(StigmergyPluginModule.server, StigmergyPlugin);
  assert.equal(server, StigmergyPlugin);
});

test("StigmergyPlugin exposes eight tools and logs init", async () => {
  const prev = process.env.SBP_URL;
  process.env.SBP_URL = "http://127.0.0.1:9";
  const logs = [];
  const hooks = await StigmergyPlugin({
    directory: "/tmp",
    worktree: "/tmp",
    client: {
      app: {
        log: async ({ body }) => {
          logs.push(body);
        },
      },
    },
    $: async () => {
      throw new Error("no shell");
    },
  });
  assert.ok(hooks.tool);
  assert.equal(Object.keys(hooks.tool).length, 8);
  assert.ok(logs.some((b) => b.message === "StigmergyPlugin_initialized"));
  process.env.SBP_URL = prev;
});

test("stigmergy_publish round-trip against real SBP", async () => {
  const auditDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-audit-"));
  const auditPath = path.join(auditDir, "audit.ndjson");
  const prevAudit = process.env.STIGMERGY_AUDIT_LOG_FILE;
  process.env.STIGMERGY_AUDIT_LOG_FILE = auditPath;

  const { server } = createLedgerServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const prev = process.env.SBP_URL;
  process.env.SBP_URL = `http://127.0.0.1:${port}`;
  try {
    const hooks = await StigmergyPlugin({
      directory: "/tmp",
      worktree: "/tmp",
      client: { app: { log: async () => {} } },
      $: async () => ({}),
    });
    const id = "11111111-1111-4111-8111-111111111111";
    const r = await hooks.tool.stigmergy_publish.execute(
      {
        id,
        stanceTarget: "security_auditing",
        baseIntensity: 1,
        decayRate: 0.05,
      },
      toolCtx(),
    );
    assert.equal(r, "ok");
    const list = await hooks.tool.stigmergy_pheromones.execute({}, toolCtx());
    assert.match(list, new RegExp(id));

    const auditText = fs.readFileSync(auditPath, "utf8");
    assert.match(auditText, /"event":"plugin_initialized"/);
    assert.match(auditText, /"event":"tool_execute"/);
    assert.match(auditText, /"tool":"stigmergy_publish"/);
  } finally {
    server.close();
    await once(server, "close");
    process.env.SBP_URL = prev;
    if (prevAudit === undefined) delete process.env.STIGMERGY_AUDIT_LOG_FILE;
    else process.env.STIGMERGY_AUDIT_LOG_FILE = prevAudit;
  }
});

test("STIGMERGY_AGENT_TOKEN authenticates against an auth-mode real SBP server", async () => {
  const authDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-auth-"));
  const tokensPath = path.join(authDir, "tokens.json");
  fs.writeFileSync(
    tokensPath,
    JSON.stringify({ tokens: { "worker-token": { agentId: "opencode-agent", class: "worker" } } }),
    "utf8",
  );
  const authTokens = loadAuthTokens(tokensPath);

  const { server, ledger } = createLedgerServer({ authTokens });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const prevUrl = process.env.SBP_URL;
  const prevToken = process.env.STIGMERGY_AGENT_TOKEN;
  process.env.SBP_URL = `http://127.0.0.1:${port}`;
  process.env.STIGMERGY_AGENT_TOKEN = "worker-token";
  try {
    const hooks = await StigmergyPlugin({
      directory: "/tmp",
      worktree: "/tmp",
      client: { app: { log: async () => {} } },
      $: async () => ({}),
    });
    const id = "22222222-2222-4222-8222-222222222222";
    const r = await hooks.tool.stigmergy_publish.execute(
      { id, stanceTarget: "security_auditing", baseIntensity: 1, decayRate: 0.05 },
      toolCtx(),
    );
    assert.equal(r, "ok");
    assert.equal(ledger.get(id).agentId, "opencode-agent");
  } finally {
    server.close();
    await once(server, "close");
    process.env.SBP_URL = prevUrl;
    if (prevToken === undefined) delete process.env.STIGMERGY_AGENT_TOKEN;
    else process.env.STIGMERGY_AGENT_TOKEN = prevToken;
  }
});

test("missing STIGMERGY_AGENT_TOKEN against an auth-mode real SBP server surfaces auth_error", async () => {
  const authDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-auth-"));
  const tokensPath = path.join(authDir, "tokens.json");
  fs.writeFileSync(
    tokensPath,
    JSON.stringify({ tokens: { "worker-token": { agentId: "opencode-agent", class: "worker" } } }),
    "utf8",
  );
  const authTokens = loadAuthTokens(tokensPath);

  const { server } = createLedgerServer({ authTokens });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const prevUrl = process.env.SBP_URL;
  const prevToken = process.env.STIGMERGY_AGENT_TOKEN;
  process.env.SBP_URL = `http://127.0.0.1:${port}`;
  delete process.env.STIGMERGY_AGENT_TOKEN;
  try {
    const hooks = await StigmergyPlugin({
      directory: "/tmp",
      worktree: "/tmp",
      client: { app: { log: async () => {} } },
      $: async () => ({}),
    });
    const id = "33333333-3333-4333-8333-333333333333";
    const r = await hooks.tool.stigmergy_publish.execute(
      { id, stanceTarget: "security_auditing", baseIntensity: 1, decayRate: 0.05 },
      toolCtx(),
    );
    assert.equal(r, "auth_error:401:missing_token");
  } finally {
    server.close();
    await once(server, "close");
    process.env.SBP_URL = prevUrl;
    if (prevToken === undefined) delete process.env.STIGMERGY_AGENT_TOKEN;
    else process.env.STIGMERGY_AGENT_TOKEN = prevToken;
  }
});

test("stigmergy_claim returns conflict on double claim", async () => {
  const { server } = createLedgerServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const prev = process.env.SBP_URL;
  process.env.SBP_URL = `http://127.0.0.1:${port}`;
  const hooks = await StigmergyPlugin({
    directory: "/tmp",
    worktree: "/tmp",
    client: { app: { log: async () => {} } },
    $: async () => ({}),
  });
  const id = "22222222-2222-4222-8222-222222222222";
  await hooks.tool.stigmergy_publish.execute(
    { id, stanceTarget: "security_auditing", baseIntensity: 1, decayRate: 0.05 },
    toolCtx(),
  );
  const first = await hooks.tool.stigmergy_claim.execute({ id }, toolCtx());
  assert.equal(first, "ok");
  const second = await hooks.tool.stigmergy_claim.execute({ id }, toolCtx());
  assert.equal(second, "claimed_conflict:409");
  server.close();
  await once(server, "close");
  process.env.SBP_URL = prev;
});

test("publish fail-soft when SBP unreachable", async () => {
  const prev = process.env.SBP_URL;
  process.env.SBP_URL = "http://127.0.0.1:1";
  const hooks = await StigmergyPlugin({
    directory: "/tmp",
    worktree: "/tmp",
    client: { app: { log: async () => {} } },
    $: async () => ({}),
  });
  const r = await hooks.tool.stigmergy_publish.execute(
    {
      id: "33333333-3333-4333-8333-333333333333",
      stanceTarget: "security_auditing",
      baseIntensity: 1,
      decayRate: 0.05,
    },
    toolCtx(),
  );
  assert.match(String(r), /^sbp_error:/);
  process.env.SBP_URL = prev;
});

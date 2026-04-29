import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createLedgerServer } from "../../sbp-server/server.mjs";
import { StigmergyPlugin } from "../src/index.mjs";

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

test("StigmergyPlugin exposes six tools and logs init", async () => {
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
  assert.equal(Object.keys(hooks.tool).length, 6);
  assert.ok(logs.some((b) => b.message === "StigmergyPlugin_initialized"));
  process.env.SBP_URL = prev;
});

test("stigmergy_publish round-trip against real SBP", async () => {
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
  server.close();
  await once(server, "close");
  process.env.SBP_URL = prev;
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

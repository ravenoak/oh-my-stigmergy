import test from "node:test";
import assert from "node:assert/strict";
import { buildTools } from "../src/tools.mjs";

/** @returns {import("@opencode-ai/plugin").ToolContext} */
function toolCtx() {
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
  };
}

test("stigmergy_publish rejects empty id (Zod)", async () => {
  const sbp = {
    async publish() {
      return { ok: true, status: 201, text: "ok" };
    },
  };
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp" });
  const r = await tools.stigmergy_publish.execute(
    { id: "", stanceTarget: "x", baseIntensity: 1, decayRate: 0.1 },
    toolCtx(),
  );
  assert.ok(String(r).startsWith("validation_error:"));
});

test("graph_load_node rejects invalid depth", async () => {
  const sbp = { async publish() {}, async listPheromones() {}, async claim() {}, async inflate() {} };
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp" });
  const r = await tools.graph_load_node.execute({ node_id: "a.py#1", depth: 99 }, toolCtx());
  assert.ok(String(r).startsWith("validation_error:"));
});

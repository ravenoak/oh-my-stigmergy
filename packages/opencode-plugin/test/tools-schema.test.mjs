import test from "node:test";
import assert from "node:assert/strict";
import { buildTools } from "../src/tools.mjs";
import {
  DEFAULT_ORCHESTRATION_POLICY,
  validateOrchestrationPolicy,
} from "../src/orchestration.mjs";

function policy() {
  return validateOrchestrationPolicy({
    ...DEFAULT_ORCHESTRATION_POLICY,
    stanceModels: { ...DEFAULT_ORCHESTRATION_POLICY.stanceModels },
  });
}

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
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp", orchestrationPolicy: policy() });
  const r = await tools.stigmergy_publish.execute(
    { id: "", stanceTarget: "x", baseIntensity: 1, decayRate: 0.1 },
    toolCtx(),
  );
  assert.ok(String(r).startsWith("validation_error:"));
});

test("graph_load_node rejects invalid depth", async () => {
  const sbp = { async publish() {}, async listPheromones() {}, async claim() {}, async inflate() {} };
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp", orchestrationPolicy: policy() });
  const r = await tools.graph_load_node.execute({ node_id: "a.py#1", depth: 99 }, toolCtx());
  assert.ok(String(r).startsWith("validation_error:"));
});

test("stigmergy_resolve_model returns model and local_preferred", async () => {
  const sbp = { async listPheromones() {} };
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp", orchestrationPolicy: policy() });
  const r = await tools.stigmergy_resolve_model.execute({ stance_target: "feature_implementation" }, toolCtx());
  assert.ok(String(r).includes("model:"));
  assert.ok(String(r).includes("local_preferred:"));
});

test("stigmergy_actionable filters list from SBP", async () => {
  const payload = JSON.stringify([
    { id: "a", stanceTarget: "x", intensity: 0.8 },
    { id: "b", stanceTarget: "x", intensity: 0.2 },
  ]);
  const sbp = {
    async listPheromones() {
      return { ok: true, status: 200, text: payload };
    },
  };
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp", orchestrationPolicy: policy() });
  const r = await tools.stigmergy_actionable.execute(
    { olfactory_threshold: 0.5, limit: 5 },
    toolCtx(),
  );
  const arr = JSON.parse(String(r));
  assert.equal(arr.length, 1);
  assert.equal(arr[0].id, "a");
});

test("stigmergy_actionable uses policy defaults when args empty", async () => {
  const rows = Array.from({ length: 8 }, (_, i) => ({
    id: `p${i}`,
    stanceTarget: "x",
    intensity: 0.99,
  }));
  const sbp = {
    async listPheromones() {
      return { ok: true, status: 200, text: JSON.stringify(rows) };
    },
  };
  const pol = validateOrchestrationPolicy({
    defaultModel: DEFAULT_ORCHESTRATION_POLICY.defaultModel,
    stanceModels: { ...DEFAULT_ORCHESTRATION_POLICY.stanceModels },
    localPreferredStances: [...DEFAULT_ORCHESTRATION_POLICY.localPreferredStances],
    defaultOlfactoryThreshold: 0,
    defaultActionableLimit: 3,
    maxActionable: 3,
  });
  const tools = buildTools({ sbp, client: {}, $: null, repoRoot: "/tmp", orchestrationPolicy: pol });
  const r = await tools.stigmergy_actionable.execute({}, toolCtx());
  const arr = JSON.parse(String(r));
  assert.equal(arr.length, 3);
});

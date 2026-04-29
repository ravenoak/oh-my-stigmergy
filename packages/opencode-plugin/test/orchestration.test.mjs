import test from "node:test";
import assert from "node:assert/strict";
import {
  filterActionablePheromones,
  resolveModelForStance,
  validateOrchestrationPolicy,
} from "../src/orchestration.mjs";

test("validateOrchestrationPolicy accepts minimal policy", () => {
  const p = validateOrchestrationPolicy({ defaultModel: "m1" });
  assert.equal(p.defaultModel, "m1");
  assert.deepEqual(p.stanceModels, {});
});

test("validateOrchestrationPolicy rejects missing defaultModel", () => {
  assert.throws(() => validateOrchestrationPolicy({}), /defaultModel/);
});

test("resolveModelForStance uses stance map then default", () => {
  const policy = validateOrchestrationPolicy({
    defaultModel: "default/m",
    stanceModels: { a: "stance/a", b: "stance/b" },
  });
  assert.equal(resolveModelForStance("a", policy), "stance/a");
  assert.equal(resolveModelForStance("unknown", policy), "default/m");
});

test("filterActionablePheromones filters by intensity and stance", () => {
  const rows = [
    { id: "1", stanceTarget: "x", intensity: 0.5 },
    { id: "2", stanceTarget: "y", intensity: 0.9 },
    { id: "3", stanceTarget: "y", intensity: 0.2 },
  ];
  const json = filterActionablePheromones(JSON.stringify(rows), {
    olfactoryThreshold: 0.4,
    stanceTarget: "y",
    limit: 10,
  });
  const parsed = JSON.parse(json);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, "2");
});

test("filterActionablePheromones sorts by intensity desc", () => {
  const rows = [
    { id: "a", intensity: 0.6 },
    { id: "b", intensity: 0.9 },
  ];
  const json = filterActionablePheromones(JSON.stringify(rows), {
    olfactoryThreshold: 0,
    limit: 10,
  });
  const parsed = JSON.parse(json);
  assert.equal(parsed[0].id, "b");
});

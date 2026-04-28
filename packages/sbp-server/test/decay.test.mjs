import test from "node:test";
import assert from "node:assert/strict";
import { currentIntensity } from "../server.mjs";

test("currentIntensity decays exponentially with dt", () => {
  const t0 = 1_000_000;
  const rec = {
    id: "x",
    stanceTarget: "t",
    baseIntensity: 10,
    decayRate: 0.5,
    inflations: 0,
    publishedAt: t0,
  };
  const i0 = currentIntensity(rec, t0);
  assert.ok(Math.abs(i0 - 10) < 1e-9);
  const i1 = currentIntensity(rec, t0 + 1000);
  const expected = 10 * Math.exp(-0.5);
  assert.ok(Math.abs(i1 - expected) < 1e-6);
});

test("inflations add to decayed base", () => {
  const t0 = 0;
  const rec = {
    id: "y",
    stanceTarget: "t",
    baseIntensity: 1,
    decayRate: 0,
    inflations: 3,
    publishedAt: t0,
  };
  assert.ok(Math.abs(currentIntensity(rec, t0 + 5000) - 4) < 1e-9);
});

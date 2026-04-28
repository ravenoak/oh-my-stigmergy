import test from "node:test";
import assert from "node:assert/strict";
import { scheduleDecayGc } from "../server.mjs";

test("scheduleDecayGc invokes compact on first tick when interval injectable", () => {
  let compactCalls = 0;
  let lastPath = "";
  const mockCompact = (p) => {
    compactCalls += 1;
    lastPath = p;
  };
  /** @type {ReturnType<typeof setInterval> | undefined} */
  let saved;
  const fakeSetInterval = (fn, ms) => {
    assert.equal(ms, 7);
    fn();
    saved = 1;
    return saved;
  };
  let cleared;
  const fakeClearInterval = (h) => {
    cleared = h;
  };
  const h = scheduleDecayGc("/tmp/ledger-x.jsonl", {
    intervalMs: 7,
    setInterval: fakeSetInterval,
    clearInterval: fakeClearInterval,
    compact: mockCompact,
    nowMs: () => 42,
  });
  assert.equal(compactCalls, 1);
  assert.equal(lastPath, "/tmp/ledger-x.jsonl");
  h.stop();
  assert.equal(cleared, saved);
});

test("scheduleDecayGc is inert when intervalMs is zero", () => {
  const h = scheduleDecayGc("/x", { intervalMs: 0 });
  h.stop();
});

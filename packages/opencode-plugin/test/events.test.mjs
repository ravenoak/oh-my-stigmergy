import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildEventHandler } from "../src/events.mjs";

/** Deterministic fake timers: setTimeoutFn/clearTimeoutFn record callbacks; fireAll()
 * awaits every currently-pending callback (simulating "the debounce window elapsed"
 * for every path with a pending edit) without any real wall-clock wait. */
function fakeTimers() {
  let nextId = 1;
  /** @type {Map<number, () => unknown>} */
  const scheduled = new Map();
  return {
    setTimeoutFn(fn) {
      const id = nextId++;
      scheduled.set(id, fn);
      return id;
    },
    clearTimeoutFn(id) {
      scheduled.delete(id);
    },
    pendingCount() {
      return scheduled.size;
    },
    async fireAll() {
      const fns = [...scheduled.values()];
      scheduled.clear();
      for (const fn of fns) await fn();
    },
  };
}

test("session.idle publishes pheromone with envelope", async () => {
  /** @type {any[]} */
  const bodies = [];
  const sbp = {
    async publish(body) {
      bodies.push(body);
      return { ok: true, status: 201, text: "ok" };
    },
  };
  const h = buildEventHandler({
    sbp,
    client: { app: { log: async () => {} } },
    defaultStance: "custom_stance",
  });
  await h({ event: { type: "session.idle" } });
  assert.equal(bodies.length, 1);
  assert.equal(bodies[0].stanceTarget, "custom_stance");
  assert.equal(bodies[0].payload.source, "opencode-plugin");
  assert.equal(bodies[0].payload.event, "session.idle");
});

test("file.edited includes path when present (debounceMs: 0 = immediate, pre-debounce behavior)", async () => {
  /** @type {any[]} */
  const bodies = [];
  const sbp = {
    async publish(body) {
      bodies.push(body);
      return { ok: true, status: 201, text: "ok" };
    },
  };
  const h = buildEventHandler({
    sbp,
    client: { app: { log: async () => {} } },
    defaultStance: "feature_implementation",
    debounceMs: 0,
  });
  await h({ event: { type: "file.edited", path: "src/foo.ts" } });
  assert.equal(bodies.length, 1);
  assert.equal(bodies[0].payload.path, "src/foo.ts");
  assert.equal(bodies[0].payload.event, "file.edited");
});

test("session.idle fail-soft when publish throws", async () => {
  const auditDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-events-audit-"));
  const auditPath = path.join(auditDir, "audit.ndjson");
  const prevAudit = process.env.STIGMERGY_AUDIT_LOG_FILE;
  process.env.STIGMERGY_AUDIT_LOG_FILE = auditPath;

  const sbp = {
    async publish() {
      throw new Error("network down");
    },
  };
  const logs = [];
  try {
    const h = buildEventHandler({
      sbp,
      client: {
        app: {
          log: async ({ body }) => {
            logs.push(body);
          },
        },
      },
      defaultStance: "feature_implementation",
    });
    await h({ event: { type: "session.idle" } });
    assert.ok(logs.some((b) => b.level === "warn" && String(b.message).includes("sbp_publish_error")));

    const auditText = fs.readFileSync(auditPath, "utf8");
    assert.match(auditText, /"event":"plugin_event_received"/);
    assert.match(auditText, /"event":"sbp_publish_error"/);
  } finally {
    if (prevAudit === undefined) delete process.env.STIGMERGY_AUDIT_LOG_FILE;
    else process.env.STIGMERGY_AUDIT_LOG_FILE = prevAudit;
  }
});

test("file.edited debounces rapid edits to the same path into a single publish", async () => {
  /** @type {any[]} */
  const bodies = [];
  const sbp = {
    async publish(body) {
      bodies.push(body);
      return { ok: true, status: 201, text: "ok" };
    },
  };
  const timers = fakeTimers();
  const h = buildEventHandler({
    sbp,
    client: { app: { log: async () => {} } },
    defaultStance: "feature_implementation",
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  await h({ event: { type: "file.edited", path: "src/foo.ts" } });
  await h({ event: { type: "file.edited", path: "src/foo.ts" } });
  await h({ event: { type: "file.edited", path: "src/foo.ts" } });

  // Nothing published yet — each edit reset the trailing-edge timer instead of firing immediately.
  assert.equal(bodies.length, 0);
  assert.equal(timers.pendingCount(), 1);

  await timers.fireAll();
  assert.equal(bodies.length, 1);
  assert.equal(bodies[0].payload.path, "src/foo.ts");
});

test("file.edited on different paths debounces independently", async () => {
  /** @type {any[]} */
  const bodies = [];
  const sbp = {
    async publish(body) {
      bodies.push(body);
      return { ok: true, status: 201, text: "ok" };
    },
  };
  const timers = fakeTimers();
  const h = buildEventHandler({
    sbp,
    client: { app: { log: async () => {} } },
    defaultStance: "feature_implementation",
    setTimeoutFn: timers.setTimeoutFn,
    clearTimeoutFn: timers.clearTimeoutFn,
  });

  await h({ event: { type: "file.edited", path: "src/foo.ts" } });
  await h({ event: { type: "file.edited", path: "src/bar.ts" } });

  assert.equal(timers.pendingCount(), 2);
  await timers.fireAll();

  assert.equal(bodies.length, 2);
  const paths = bodies.map((b) => b.payload.path).sort();
  assert.deepEqual(paths, ["src/bar.ts", "src/foo.ts"]);
});

test("file.edited debounce is audited when an edit coalesces into a pending timer", async () => {
  const auditDir = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-events-audit-"));
  const auditPath = path.join(auditDir, "audit.ndjson");
  const prevAudit = process.env.STIGMERGY_AUDIT_LOG_FILE;
  process.env.STIGMERGY_AUDIT_LOG_FILE = auditPath;

  const sbp = { async publish() { return { ok: true, status: 201, text: "ok" }; } };
  const timers = fakeTimers();
  try {
    const h = buildEventHandler({
      sbp,
      client: { app: { log: async () => {} } },
      defaultStance: "feature_implementation",
      setTimeoutFn: timers.setTimeoutFn,
      clearTimeoutFn: timers.clearTimeoutFn,
    });
    await h({ event: { type: "file.edited", path: "src/foo.ts" } });
    await h({ event: { type: "file.edited", path: "src/foo.ts" } });

    const auditText = fs.readFileSync(auditPath, "utf8");
    assert.match(auditText, /"event":"file_edited_debounced"/);
    await timers.fireAll();
  } finally {
    if (prevAudit === undefined) delete process.env.STIGMERGY_AUDIT_LOG_FILE;
    else process.env.STIGMERGY_AUDIT_LOG_FILE = prevAudit;
  }
});

test("file.edited debounce defaults to STIGMERGY_FILE_EDITED_DEBOUNCE_MS when set", async () => {
  const prevEnv = process.env.STIGMERGY_FILE_EDITED_DEBOUNCE_MS;
  process.env.STIGMERGY_FILE_EDITED_DEBOUNCE_MS = "0";
  try {
    /** @type {any[]} */
    const bodies = [];
    const sbp = {
      async publish(body) {
        bodies.push(body);
        return { ok: true, status: 201, text: "ok" };
      },
    };
    const h = buildEventHandler({
      sbp,
      client: { app: { log: async () => {} } },
      defaultStance: "feature_implementation",
    });
    await h({ event: { type: "file.edited", path: "src/foo.ts" } });
    assert.equal(bodies.length, 1, "STIGMERGY_FILE_EDITED_DEBOUNCE_MS=0 should publish immediately");
  } finally {
    if (prevEnv === undefined) delete process.env.STIGMERGY_FILE_EDITED_DEBOUNCE_MS;
    else process.env.STIGMERGY_FILE_EDITED_DEBOUNCE_MS = prevEnv;
  }
});

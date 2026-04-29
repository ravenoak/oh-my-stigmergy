import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildEventHandler } from "../src/events.mjs";

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

test("file.edited includes path when present", async () => {
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

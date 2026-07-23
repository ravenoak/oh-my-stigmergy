import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createLedgerServer, validateWorkOrderProfile } from "../server.mjs";

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: { "Content-Length": Buffer.byteLength(body), ...headers },
      },
      resolve,
    );
    req.on("error", reject);
    req.end(body);
  });
}

function readBody(res) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    res.on("data", (c) => chunks.push(c));
    res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    res.on("error", reject);
  });
}

async function withServer(options, fn) {
  const { server, ledger } = createLedgerServer(options);
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
  try {
    await fn({ base, ledger });
  } finally {
    server.closeAllConnections?.();
    server.close();
    await once(server, "close");
  }
}

function validWorkOrderPayload(overrides = {}) {
  return {
    profileVersion: "1.0",
    orderId: "wo-abcd1234",
    goal: "do the thing",
    provenance: { createdBy: "agent-w" },
    ...overrides,
  };
}

function publishBody(id, kind, payload, extra = {}) {
  return JSON.stringify({
    id,
    stanceTarget: "feature_implementation",
    baseIntensity: 1,
    decayRate: 0.05,
    kind,
    payload,
    ...extra,
  });
}

// --- validateWorkOrderProfile unit coverage ---

test("validateWorkOrderProfile accepts a well-formed payload", () => {
  assert.equal(validateWorkOrderProfile(validWorkOrderPayload()), null);
});

test("validateWorkOrderProfile accepts an optional phase field", () => {
  assert.equal(validateWorkOrderProfile(validWorkOrderPayload({ phase: "implement" })), null);
});

test("validateWorkOrderProfile rejects missing payload", () => {
  assert.match(validateWorkOrderProfile(undefined), /missing payload/);
});

test("validateWorkOrderProfile rejects wrong profileVersion", () => {
  assert.match(validateWorkOrderProfile(validWorkOrderPayload({ profileVersion: "2.0" })), /profileVersion/);
});

test("validateWorkOrderProfile rejects malformed orderId", () => {
  assert.match(validateWorkOrderProfile(validWorkOrderPayload({ orderId: "not-the-right-shape" })), /orderId/);
});

test("validateWorkOrderProfile rejects empty goal", () => {
  assert.match(validateWorkOrderProfile(validWorkOrderPayload({ goal: "" })), /goal/);
});

test("validateWorkOrderProfile rejects missing provenance.createdBy", () => {
  assert.match(validateWorkOrderProfile(validWorkOrderPayload({ provenance: {} })), /createdBy/);
});

test("validateWorkOrderProfile rejects unexpected fields (additive-only, additionalProperties:false)", () => {
  assert.match(validateWorkOrderProfile(validWorkOrderPayload({ extra: "nope" })), /unexpected field/);
});

// --- Server route: structural validation applies regardless of auth mode ---

test("open mode: workOrder kind still requires a well-formed profile", async () => {
  await withServer({}, async ({ base }) => {
    const id = "bbbbbbbb-0000-4000-8000-000000000001";
    const res = await post(`${base}/pheromones`, publishBody(id, "workOrder", { profileVersion: "1.0" }));
    const text = await readBody(res);
    assert.equal(res.statusCode, 400);
    assert.match(text, /^workorder_profile:/);
  });
});

test("open mode: well-formed workOrder payload publishes fine (no identity to cross-check)", async () => {
  await withServer({}, async ({ base, ledger }) => {
    const id = "bbbbbbbb-0000-4000-8000-000000000002";
    const res = await post(
      `${base}/pheromones`,
      publishBody(id, "workOrder", validWorkOrderPayload({ provenance: { createdBy: "whoever" } })),
    );
    assert.equal(res.statusCode, 201);
    await readBody(res);
    assert.equal(ledger.get(id).kind, "workOrder");
  });
});

// --- Server route: provenance cross-check only under identity ---

test("auth mode: provenance.createdBy matching the resolved identity publishes fine", async () => {
  const authTokens = new Map([["tok", { agentId: "agent-w", class: "worker" }]]);
  await withServer({ authTokens }, async ({ base, ledger }) => {
    const id = "bbbbbbbb-0000-4000-8000-000000000003";
    const res = await post(
      `${base}/pheromones`,
      publishBody(id, "workOrder", validWorkOrderPayload({ provenance: { createdBy: "agent-w" } })),
      { Authorization: "Bearer tok" },
    );
    assert.equal(res.statusCode, 201);
    await readBody(res);
    assert.equal(ledger.get(id).agentId, "agent-w");
  });
});

test("auth mode: provenance.createdBy spoofing a different identity is rejected", async () => {
  const authTokens = new Map([["tok", { agentId: "agent-w", class: "worker" }]]);
  await withServer({ authTokens }, async ({ base }) => {
    const id = "bbbbbbbb-0000-4000-8000-000000000004";
    const res = await post(
      `${base}/pheromones`,
      publishBody(id, "workOrder", validWorkOrderPayload({ provenance: { createdBy: "someone-else" } })),
      { Authorization: "Bearer tok" },
    );
    const text = await readBody(res);
    assert.equal(res.statusCode, 403);
    assert.equal(text, "auth_error:403:provenance_mismatch");
  });
});

test("auth mode: kind registry gating still applies after profile validation passes", async () => {
  const authTokens = new Map([["tok", { agentId: "agent-w", class: "worker" }]]);
  const kindRegistry = new Map([["workOrder", { publishableBy: new Set(["privileged"]) }]]);
  await withServer({ authTokens, kindRegistry }, async ({ base }) => {
    const id = "bbbbbbbb-0000-4000-8000-000000000005";
    const res = await post(
      `${base}/pheromones`,
      publishBody(id, "workOrder", validWorkOrderPayload({ provenance: { createdBy: "agent-w" } })),
      { Authorization: "Bearer tok" },
    );
    const text = await readBody(res);
    assert.equal(res.statusCode, 403);
    assert.equal(text, "auth_error:403:kind_privileged");
  });
});

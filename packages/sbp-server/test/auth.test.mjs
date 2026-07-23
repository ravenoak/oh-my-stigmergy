import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { once } from "node:events";
import {
  createLedgerServer,
  loadAuthTokens,
  loadKindRegistry,
} from "../server.mjs";

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
  const { server, ledger, claims, store } = createLedgerServer(options);
  await new Promise((resolve) => server.listen(0, resolve));
  const addr = server.address();
  const base = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`;
  try {
    await fn({ base, ledger, claims, store });
  } finally {
    server.closeAllConnections?.();
    server.close();
    await once(server, "close");
  }
}

function tmpJsonFile(data) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-auth-"));
  const p = path.join(dir, "config.json");
  fs.writeFileSync(p, JSON.stringify(data), "utf8");
  return p;
}

function publishBody(id, extra = {}) {
  return JSON.stringify({
    id,
    stanceTarget: "feature_implementation",
    baseIntensity: 1,
    decayRate: 0.05,
    ...extra,
  });
}

// --- loadAuthTokens / loadKindRegistry file-loading ---

test("loadAuthTokens loads worker and privileged identities", () => {
  const p = tmpJsonFile({
    tokens: {
      "tok-worker": { agentId: "agent-w", class: "worker" },
      "tok-priv": { agentId: "agent-p", class: "privileged" },
    },
  });
  const map = loadAuthTokens(p);
  assert.deepEqual(map.get("tok-worker"), { agentId: "agent-w", class: "worker" });
  assert.deepEqual(map.get("tok-priv"), { agentId: "agent-p", class: "privileged" });
});

test("loadAuthTokens rejects unknown class", () => {
  const p = tmpJsonFile({ tokens: { t: { agentId: "a", class: "root" } } });
  assert.throws(() => loadAuthTokens(p), /unknown class/);
});

test("loadKindRegistry loads publishableBy sets", () => {
  const p = tmpJsonFile({ kinds: { signal: { publishableBy: ["worker", "privileged"] } } });
  const map = loadKindRegistry(p);
  assert.deepEqual([...map.get("signal").publishableBy].sort(), ["privileged", "worker"]);
});

test("loadKindRegistry rejects empty publishableBy", () => {
  const p = tmpJsonFile({ kinds: { signal: { publishableBy: [] } } });
  assert.throws(() => loadKindRegistry(p), /non-empty publishableBy/);
});

// --- Identity resolution on mutating routes ---

test("auth mode: missing Authorization header rejected on publish", async () => {
  const authTokens = new Map([["tok", { agentId: "a", class: "worker" }]]);
  await withServer({ authTokens }, async ({ base }) => {
    const res = await post(`${base}/pheromones`, publishBody("aaaaaaaa-0000-4000-8000-000000000001"));
    const text = await readBody(res);
    assert.equal(res.statusCode, 401);
    assert.equal(text, "auth_error:401:missing_token");
  });
});

test("auth mode: unknown token rejected on publish", async () => {
  const authTokens = new Map([["tok", { agentId: "a", class: "worker" }]]);
  await withServer({ authTokens }, async ({ base }) => {
    const res = await post(
      `${base}/pheromones`,
      publishBody("aaaaaaaa-0000-4000-8000-000000000002"),
      { Authorization: "Bearer nope" },
    );
    const text = await readBody(res);
    assert.equal(res.statusCode, 403);
    assert.equal(text, "auth_error:403:unknown_token");
  });
});

test("auth mode: valid token publishes and stamps agentId (client-supplied agentId overridden)", async () => {
  const authTokens = new Map([["tok-worker", { agentId: "agent-w", class: "worker" }]]);
  await withServer({ authTokens }, async ({ base, ledger }) => {
    const id = "aaaaaaaa-0000-4000-8000-000000000003";
    const res = await post(`${base}/pheromones`, publishBody(id, { agentId: "spoofed" }), {
      Authorization: "Bearer tok-worker",
    });
    assert.equal(res.statusCode, 201);
    await readBody(res);
    assert.equal(ledger.get(id).agentId, "agent-w");
    assert.equal(ledger.get(id).kind, "signal");
  });
});

test("auth mode: claim and inflate also require valid identity", async () => {
  const authTokens = new Map([["tok", { agentId: "agent-w", class: "worker" }]]);
  await withServer({ authTokens }, async ({ base }) => {
    const id = "aaaaaaaa-0000-4000-8000-000000000004";
    await readBody(
      await post(`${base}/pheromones`, publishBody(id), { Authorization: "Bearer tok" }),
    );

    const claimNoAuth = await post(`${base}/pheromones/${id}/claim`, "");
    assert.equal(claimNoAuth.statusCode, 401);
    await readBody(claimNoAuth);

    const claimAuthed = await post(`${base}/pheromones/${id}/claim`, "", {
      Authorization: "Bearer tok",
    });
    assert.equal(claimAuthed.statusCode, 200);
    await readBody(claimAuthed);

    const inflateNoAuth = await post(`${base}/pheromones/${id}/inflate`, "");
    assert.equal(inflateNoAuth.statusCode, 401);
    await readBody(inflateNoAuth);
  });
});

// --- Kind registry class-gating ---

test("kind registry: unregistered kind rejected with 400", async () => {
  const authTokens = new Map([["tok", { agentId: "agent-w", class: "worker" }]]);
  const kindRegistry = new Map([["signal", { publishableBy: new Set(["worker", "privileged"]) }]]);
  await withServer({ authTokens, kindRegistry }, async ({ base }) => {
    const id = "aaaaaaaa-0000-4000-8000-000000000005";
    const res = await post(`${base}/pheromones`, publishBody(id, { kind: "phaseTransition" }), {
      Authorization: "Bearer tok",
    });
    const text = await readBody(res);
    assert.equal(res.statusCode, 400);
    assert.equal(text, "kind_unregistered");
  });
});

test("kind registry: class not in publishableBy rejected with 403", async () => {
  const authTokens = new Map([
    ["tok-worker", { agentId: "agent-w", class: "worker" }],
    ["tok-priv", { agentId: "agent-p", class: "privileged" }],
  ]);
  const kindRegistry = new Map([
    ["signal", { publishableBy: new Set(["worker", "privileged"]) }],
    ["restricted", { publishableBy: new Set(["privileged"]) }],
  ]);
  await withServer({ authTokens, kindRegistry }, async ({ base, ledger }) => {
    const idWorker = "aaaaaaaa-0000-4000-8000-000000000006";
    const resWorker = await post(`${base}/pheromones`, publishBody(idWorker, { kind: "restricted" }), {
      Authorization: "Bearer tok-worker",
    });
    const textWorker = await readBody(resWorker);
    assert.equal(resWorker.statusCode, 403);
    assert.equal(textWorker, "auth_error:403:kind_privileged");

    const idPriv = "aaaaaaaa-0000-4000-8000-000000000007";
    const resPriv = await post(`${base}/pheromones`, publishBody(idPriv, { kind: "restricted" }), {
      Authorization: "Bearer tok-priv",
    });
    assert.equal(resPriv.statusCode, 201);
    await readBody(resPriv);
    assert.equal(ledger.get(idPriv).kind, "restricted");
  });
});

// --- Inflate budget ---

test("inflate budget: exceeding maxPerWindow returns 429, other agents unaffected", async () => {
  const authTokens = new Map([
    ["tok-a", { agentId: "agent-a", class: "worker" }],
    ["tok-b", { agentId: "agent-b", class: "worker" }],
  ]);
  const inflateBudget = { maxPerWindow: 1, windowSeconds: 60 };
  await withServer({ authTokens, inflateBudget }, async ({ base }) => {
    const id = "aaaaaaaa-0000-4000-8000-000000000008";
    await readBody(
      await post(`${base}/pheromones`, publishBody(id), { Authorization: "Bearer tok-a" }),
    );

    const first = await post(`${base}/pheromones/${id}/inflate`, "", { Authorization: "Bearer tok-a" });
    assert.equal(first.statusCode, 200);
    await readBody(first);

    const second = await post(`${base}/pheromones/${id}/inflate`, "", { Authorization: "Bearer tok-a" });
    const secondText = await readBody(second);
    assert.equal(second.statusCode, 429);
    assert.equal(secondText, "auth_error:429:inflate_budget");

    const fromB = await post(`${base}/pheromones/${id}/inflate`, "", { Authorization: "Bearer tok-b" });
    assert.equal(fromB.statusCode, 200);
    await readBody(fromB);
  });
});

test("inflate budget: resets after window elapses", async () => {
  const authTokens = new Map([["tok", { agentId: "agent-a", class: "worker" }]]);
  const inflateBudget = { maxPerWindow: 1, windowSeconds: 0.05 };
  await withServer({ authTokens, inflateBudget }, async ({ base }) => {
    const id = "aaaaaaaa-0000-4000-8000-000000000009";
    await readBody(
      await post(`${base}/pheromones`, publishBody(id), { Authorization: "Bearer tok" }),
    );
    await readBody(
      await post(`${base}/pheromones/${id}/inflate`, "", { Authorization: "Bearer tok" }),
    );
    await new Promise((r) => setTimeout(r, 80));
    const afterWindow = await post(`${base}/pheromones/${id}/inflate`, "", {
      Authorization: "Bearer tok",
    });
    assert.equal(afterWindow.statusCode, 200);
    await readBody(afterWindow);
  });
});

// --- Open-mode regression: identity/kind-gating/inflate-budget features are fully inert ---

test("open mode: publish/claim/inflate succeed without any Authorization header", async () => {
  await withServer({}, async ({ base, ledger }) => {
    const id = "aaaaaaaa-0000-4000-8000-00000000000a";
    const pub = await post(`${base}/pheromones`, publishBody(id));
    assert.equal(pub.statusCode, 201);
    await readBody(pub);

    const claim = await post(`${base}/pheromones/${id}/claim`, "");
    assert.equal(claim.statusCode, 200);
    await readBody(claim);

    const inflate = await post(`${base}/pheromones/${id}/inflate`, "");
    assert.equal(inflate.statusCode, 200);
    await readBody(inflate);

    // kind defaults to "signal" (additive), but no agentId is stamped absent identity.
    assert.equal(ledger.get(id).kind, "signal");
    assert.equal(ledger.get(id).agentId, undefined);
  });
});

test("open mode: client-supplied agentId passes through unstamped (no identity to override it)", async () => {
  await withServer({}, async ({ base, ledger }) => {
    const id = "aaaaaaaa-0000-4000-8000-00000000000b";
    const pub = await post(`${base}/pheromones`, publishBody(id, { agentId: "whatever-the-client-sent" }));
    assert.equal(pub.statusCode, 201);
    await readBody(pub);
    assert.equal(ledger.get(id).agentId, "whatever-the-client-sent");
  });
});

test("open mode: kindRegistry configured without authTokens is inert (misconfiguration guard)", async () => {
  const kindRegistry = new Map([["signal", { publishableBy: new Set(["worker"]) }]]);
  await withServer({ kindRegistry }, async ({ base, ledger }) => {
    const id = "aaaaaaaa-0000-4000-8000-00000000000c";
    const pub = await post(`${base}/pheromones`, publishBody(id, { kind: "anything_unregistered" }));
    assert.equal(pub.statusCode, 201);
    await readBody(pub);
    assert.equal(ledger.get(id).kind, "anything_unregistered");
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";
import { createLedgerServer, loadStanceRegistry } from "../server.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const goodRegistry = path.join(repoRoot, "tests", "fixtures", "stance", "good.json");

test("loadStanceRegistry collects stance_vector keys from file", () => {
  const s = loadStanceRegistry(goodRegistry);
  assert.ok(s.has("security_auditing"));
  assert.ok(s.has("feature_implementation"));
});

test("stance registry on rejects unknown stanceTarget with 400", async () => {
  const targets = loadStanceRegistry(goodRegistry);
  const { server } = createLedgerServer({
    store: undefined,
    stanceTargets: targets,
  });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const body = JSON.stringify({
    id: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
    stanceTarget: "not_in_registry",
    baseIntensity: 1,
    decayRate: 0.1,
  });
  const res = await post(`${base}/pheromones`, body);
  assert.equal(res.statusCode, 400);
  const txt = (await readBody(res)).toString("utf8");
  assert.equal(txt, "stance_unknown");
  server.closeAllConnections?.();
  server.close();
  await once(server, "close");
});

test("stance registry off allows any stanceTarget string", async () => {
  const { server } = createLedgerServer({ stanceTargets: null });
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const body = JSON.stringify({
    id: "bbbbbbbb-cccc-4ddd-eeee-ffffffffffff",
    stanceTarget: "arbitrary_freeform_stance",
    baseIntensity: 0.5,
    decayRate: 0.2,
  });
  const res = await post(`${base}/pheromones`, body);
  assert.equal(res.statusCode, 201);
  server.closeAllConnections?.();
  server.close();
  await once(server, "close");
});

function post(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: { "Content-Length": Buffer.byteLength(body) },
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
    res.on("end", () => resolve(Buffer.concat(chunks)));
    res.on("error", reject);
  });
}

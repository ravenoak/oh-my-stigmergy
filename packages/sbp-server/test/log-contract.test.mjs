import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createLedgerServer } from "../server.mjs";

test("structured NDJSON log lines include ts and event", async () => {
  const logf = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "sbp-log-")), "out.ndjson");
  process.env.SBP_LOG_FILE = logf;
  process.env.SBP_LOG_STDERR = "1";
  const { server } = createLedgerServer();
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  await drain(await get(`${base}/pheromones`));
  const pid = "33333333-4444-4555-8666-777777777777";
  const body = JSON.stringify({
    id: pid,
    stanceTarget: "log",
    baseIntensity: 1,
    decayRate: 0,
  });
  await drain(await post(`${base}/pheromones`, body));
  await drain(await post(`${base}/pheromones/${pid}/claim`, ""));
  await drain(await post(`${base}/pheromones/${pid}/inflate`, ""));
  await drain(await get(`${base}/not-here`));

  server.closeAllConnections?.();
  server.close();
  await once(server, "close");

  const lines = fs.readFileSync(logf, "utf8").trim().split("\n").filter(Boolean);
  assert.ok(lines.length >= 4);
  for (const ln of lines) {
    const o = JSON.parse(ln);
    assert.ok(typeof o.ts === "number");
    assert.ok(typeof o.event === "string");
  }
  delete process.env.SBP_LOG_FILE;
  delete process.env.SBP_LOG_STDERR;
});

function get(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: "GET" }, resolve);
    req.on("error", reject);
    req.end();
  });
}

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

function drain(res) {
  return new Promise((resolve, reject) => {
    res.on("data", () => {});
    res.on("end", resolve);
    res.on("error", reject);
  });
}

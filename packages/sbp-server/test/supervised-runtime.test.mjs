import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { once } from "node:events";

test("supervised PORT=0 writes runtime.json sqlite ledger and healthz", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sbp-sup-"));
  const runtimeFile = path.join(dir, ".stigmergy", "runtime.json");
  const serverPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "server.mjs");
  const child = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      PORT: "0",
      SBP_SUPERVISED: "1",
      STIGMERGY_WORKTREE: dir,
      SBP_RUNTIME_FILE: runtimeFile,
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  try {
    await waitForFile(runtimeFile, 15000);
    const rt = JSON.parse(fs.readFileSync(runtimeFile, "utf8"));
    assert.ok(rt.url.startsWith("http://127.0.0.1:"));
    assert.ok(Number.isInteger(rt.port) && rt.port > 0);
    assert.equal(rt.pid, child.pid);
    assert.ok(typeof rt.startedAt === "string");
    const hz = await httpGet(`${rt.url}/healthz`);
    assert.equal(hz.statusCode, 200);
    const j = JSON.parse(hz.body);
    assert.equal(j.ok, true);
    assert.equal(j.store, "sqlite");
    const dbPath = path.join(dir, ".stigmergy", "ledger.db");
    assert.ok(fs.existsSync(dbPath));
  } finally {
    try {
      child.kill("SIGTERM");
      await Promise.race([
        once(child, "exit"),
        new Promise((r) => setTimeout(r, 2000)),
      ]);
    } finally {
      if (child.exitCode === null) {
        try {
          child.kill("SIGKILL");
        } catch {
          /* ignore */
        }
        await once(child, "close").catch(() => {});
      }
    }
  }
});

/**
 * @param {string} p
 * @param {number} ms
 */
async function waitForFile(p, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      if (fs.existsSync(p)) return;
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`timeout waiting for ${p}`);
}

/**
 * @param {string} url
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    http
      .get({ hostname: u.hostname, port: u.port, path: u.pathname }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      })
      .on("error", reject);
  });
}

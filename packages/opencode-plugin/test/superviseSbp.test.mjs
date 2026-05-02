import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathsForWorktree, resolveSbpBaseUrl } from "../src/superviseSbp.mjs";

test("pathsForWorktree lays out .stigmergy paths", () => {
  const p = pathsForWorktree("/foo/bar");
  assert.equal(p.root, path.resolve("/foo/bar"));
  assert.equal(p.stDir, path.join(p.root, ".stigmergy"));
  assert.equal(p.runtimePath, path.join(p.stDir, "runtime.json"));
  assert.equal(p.lockPath, path.join(p.stDir, "spawn.lock"));
});

test("explicit SBP_URL skips supervision", async () => {
  const prev = process.env.SBP_URL;
  process.env.SBP_URL = "http://127.0.0.1:55555";
  delete process.env.STIGMERGY_SUPERVISE;
  try {
    const u = await resolveSbpBaseUrl({ repoRoot: os.tmpdir() });
    assert.equal(u, "http://127.0.0.1:55555");
  } finally {
    if (prev === undefined) delete process.env.SBP_URL;
    else process.env.SBP_URL = prev;
  }
});

test("STIGMERGY_SUPERVISE=0 uses legacy default URL", async () => {
  const prevUrl = process.env.SBP_URL;
  const prevSup = process.env.STIGMERGY_SUPERVISE;
  delete process.env.SBP_URL;
  process.env.STIGMERGY_SUPERVISE = "0";
  try {
    const u = await resolveSbpBaseUrl({ repoRoot: os.tmpdir() });
    assert.equal(u, "http://127.0.0.1:3847");
  } finally {
    if (prevUrl === undefined) delete process.env.SBP_URL;
    else process.env.SBP_URL = prevUrl;
    if (prevSup === undefined) delete process.env.STIGMERGY_SUPERVISE;
    else process.env.STIGMERGY_SUPERVISE = prevSup;
  }
});

test("attach when runtime.json exists and healthz succeeds", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sup-"));
  const prevUrl = process.env.SBP_URL;
  const prevSup = process.env.STIGMERGY_SUPERVISE;
  delete process.env.SBP_URL;
  delete process.env.STIGMERGY_SUPERVISE;

  const server = http.createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200);
      res.end("ok");
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const base = `http://127.0.0.1:${port}`;

  fs.mkdirSync(path.join(dir, ".stigmergy"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".stigmergy", "runtime.json"),
    JSON.stringify({
      url: base,
      port,
      pid: process.pid,
      startedAt: new Date().toISOString(),
    }),
    "utf8",
  );

  try {
    const u = await resolveSbpBaseUrl({ repoRoot: dir });
    assert.equal(u, base);
  } finally {
    server.close();
    await new Promise((r) => server.once("close", r));
    fs.rmSync(dir, { recursive: true, force: true });
    if (prevUrl === undefined) delete process.env.SBP_URL;
    else process.env.SBP_URL = prevUrl;
    if (prevSup === undefined) delete process.env.STIGMERGY_SUPERVISE;
    else process.env.STIGMERGY_SUPERVISE = prevSup;
  }
});

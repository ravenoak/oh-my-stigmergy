import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { appendAudit } from "./auditLog.mjs";

const require = createRequire(import.meta.url);

const DEFAULT_SBP = "http://127.0.0.1:3847";

/** @param {string} repoRoot */
export function pathsForWorktree(repoRoot) {
  const root = path.resolve(repoRoot);
  const st = path.join(root, ".stigmergy");
  return {
    root,
    stDir: st,
    runtimePath: path.join(st, "runtime.json"),
    lockPath: path.join(st, "spawn.lock"),
  };
}

/**
 * @param {string} baseUrl
 */
async function fetchHealthOk(baseUrl) {
  try {
    const u = `${String(baseUrl).replace(/\/$/, "")}/healthz`;
    const ac = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined;
    const res = await fetch(u, ac ? { signal: ac } : {});
    return res.ok;
  } catch {
    return false;
  }
}

/** @param {number} pid */
function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Resolve SBP base URL: explicit `SBP_URL`, supervised attach/spawn when unset, or legacy default.
 * @param {{ repoRoot: string }} opts
 * @returns {Promise<string>}
 */
export async function resolveSbpBaseUrl(opts) {
  const explicit = (process.env.SBP_URL || "").trim();
  if (explicit) {
    appendAudit({ event: "supervision_skipped", reason: "SBP_URL_set", baseUrl: explicit });
    return explicit;
  }

  const disable = (process.env.STIGMERGY_SUPERVISE || "").trim();
  if (disable === "0" || disable.toLowerCase() === "false") {
    appendAudit({ event: "supervision_disabled", baseUrl: DEFAULT_SBP });
    return DEFAULT_SBP;
  }

  const repoRoot = path.resolve(opts.repoRoot || process.cwd());
  const { runtimePath, lockPath, stDir } = pathsForWorktree(repoRoot);

  if (fs.existsSync(runtimePath)) {
    try {
      const raw = fs.readFileSync(runtimePath, "utf8");
      const rt = JSON.parse(raw);
      const url = typeof rt.url === "string" ? rt.url : "";
      const pid = typeof rt.pid === "number" ? rt.pid : 0;
      if (url && (await fetchHealthOk(url))) {
        appendAudit({ event: "supervision_attached", baseUrl: url, pid });
        return url;
      }
      if (!isPidAlive(pid)) {
        try {
          fs.unlinkSync(runtimePath);
        } catch {
          /* ignore */
        }
        appendAudit({ event: "supervision_stale_runtime_removed", url, pid });
      } else if (url) {
        appendAudit({
          event: "supervision_health_failed_pid_alive",
          baseUrl: url,
          pid,
        });
        return DEFAULT_SBP;
      }
    } catch {
      try {
        fs.unlinkSync(runtimePath);
      } catch {
        /* ignore */
      }
    }
  }

  fs.mkdirSync(stDir, { recursive: true });

  const outerDeadline = Date.now() + 45000;
  while (Date.now() < outerDeadline) {
    try {
      fs.writeFileSync(lockPath, `${process.pid}\n`, { flag: "wx" });
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code !== "EEXIST") throw e;
      await sleep(120);
      if (fs.existsSync(runtimePath)) {
        try {
          const raw = fs.readFileSync(runtimePath, "utf8");
          const rt = JSON.parse(raw);
          const url = typeof rt.url === "string" ? rt.url : "";
          if (url && (await fetchHealthOk(url))) {
            appendAudit({ event: "supervision_attached_after_wait", baseUrl: url });
            return url;
          }
        } catch {
          /* ignore */
        }
      }
      continue;
    }

    try {
      let pkgDir;
      try {
        const pkgJsonPath = require.resolve("@oh-my-stigmergy/sbp-server/package.json");
        pkgDir = path.dirname(pkgJsonPath);
      } catch {
        appendAudit({ event: "supervision_resolve_failed", message: "cannot_resolve_sbp_package" });
        try {
          fs.unlinkSync(lockPath);
        } catch {
          /* ignore */
        }
        return DEFAULT_SBP;
      }
      const serverPath = path.join(pkgDir, "server.mjs");
      const nodeBin = (process.env.STIGMERGY_NODE || "node").trim() || "node";
      const env = {
        ...process.env,
        PORT: "0",
        SBP_SUPERVISED: "1",
        STIGMERGY_WORKTREE: repoRoot,
        SBP_RUNTIME_FILE: runtimePath,
      };
      let child;
      try {
        child = spawn(nodeBin, [serverPath], {
          env,
          stdio: "ignore",
          detached: true,
        });
      } catch (err) {
        appendAudit({
          event: "supervision_spawn_throw",
          message: String(err && /** @type {Error} */ (err).message ? /** @type {Error} */ (err).message : err),
        });
        try {
          fs.unlinkSync(lockPath);
        } catch {
          /* ignore */
        }
        return DEFAULT_SBP;
      }
      child.unref();

      const spawnDeadline = Date.now() + 30000;
      while (Date.now() < spawnDeadline) {
        if (fs.existsSync(runtimePath)) {
          try {
            const raw = fs.readFileSync(runtimePath, "utf8");
            const rt = JSON.parse(raw);
            const url = typeof rt.url === "string" ? rt.url : "";
            if (url && (await fetchHealthOk(url))) {
              appendAudit({
                event: "supervision_spawned",
                baseUrl: url,
                pid: rt.pid,
              });
              try {
                fs.unlinkSync(lockPath);
              } catch {
                /* ignore */
              }
              return url;
            }
          } catch {
            /* ignore */
          }
        }
        await sleep(40);
      }

      appendAudit({ event: "supervision_spawn_timeout" });
      try {
        fs.unlinkSync(lockPath);
      } catch {
        /* ignore */
      }
      try {
        if (child && child.pid) process.kill(child.pid, "SIGKILL");
      } catch {
        /* ignore */
      }
      return DEFAULT_SBP;
    } catch (err) {
      appendAudit({
        event: "supervision_error",
        message: String(err && /** @type {Error} */ (err).message ? /** @type {Error} */ (err).message : err),
      });
      try {
        fs.unlinkSync(lockPath);
      } catch {
        /* ignore */
      }
      return DEFAULT_SBP;
    }
  }

  appendAudit({ event: "supervision_outer_timeout", baseUrl: DEFAULT_SBP });
  return DEFAULT_SBP;
}

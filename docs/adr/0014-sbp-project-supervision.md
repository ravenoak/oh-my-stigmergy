# ADR-0014: Project-local SBP supervision from the OpenCode plugin

## Status

Accepted

## Context

Operators running OpenCode with [`@oh-my-stigmergy/opencode-plugin`](../../packages/opencode-plugin/) previously had to **start [`packages/sbp-server`](../../packages/sbp-server/) manually**, align **`PORT`** with **`SBP_URL`**, and avoid port collisions. Solo developers expect **one coordination space per project** and **no extra terminal steps** before coding.

[ADR-0012](0012-opencode-plugin-architecture.md) rejects **in-process** SBP inside the Bun-hosted plugin (SQLite native bindings, ledger locking). That does **not** forbid **spawning the existing Node `server.mjs`** as a **sibling process** with a stable HTTP contract.

## Decision

1. **When `SBP_URL` is unset**, the plugin **resolves** the ledger URL by **attach-or-spawn** under the OpenCode **`worktree`** (fallback **`directory`**, then **`cwd`**):
   - If **`$worktree/.stigmergy/runtime.json`** exists and **`GET …/healthz`** succeeds → **attach** to that URL.
   - If the file exists but the process is **dead** (pid check + failed health) → remove stale **`runtime.json`** and **spawn**.
   - Otherwise **spawn** Node running **`@oh-my-stigmergy/sbp-server`** (`server.mjs`) with **`PORT=0`**, **`SBP_SUPERVISED=1`**, **`STIGMERGY_WORKTREE`**, **`SBP_RUNTIME_FILE`** pointing at **`$worktree/.stigmergy/runtime.json`**, and **`stdio` discarded**. The server binds **`127.0.0.1`** only and writes the **actual** ephemeral port to **`runtime.json`** after **`listening`**.
2. **When `SBP_URL` is set**, the plugin **never spawns**; it uses that URL (existing operator and CI behaviour).
3. **Escape hatch:** **`STIGMERGY_SUPERVISE=0`** (or **`false`**) disables spawn and falls back to the legacy default **`http://127.0.0.1:3847`** without supervision (tests and minimal environments).
4. **Spawn executable:** **`node`** on `PATH`, overridable by **`STIGMERGY_NODE`**. The host may be Bun; the **child must be Node** because **`better-sqlite3`** is a Node native addon.
5. **Concurrency:** an exclusive **`$worktree/.stigmergy/spawn.lock`** (atomic **`wx`**) prevents duplicate spawns; waiters poll **`runtime.json`** + health after losing the lock race.
6. **Lifecycle:** the plugin **does not** terminate SBP on OpenCode exit (ledger survives IDE restarts). Operators may **`npm run stop`** in **`@oh-my-stigmergy/sbp-server`** or send **SIGTERM** to **`pid`** from **`runtime.json`**.
7. **Packaging:** **`@oh-my-stigmergy/sbp-server`** is **`private: false`**, versioned, and listed as a **dependency** of **`@oh-my-stigmergy/opencode-plugin`** so **`npm install`** resolves **`server.mjs`** without a monorepo path.

## Non-goals

- Replacing HTTP with an in-plugin Bun ledger (still ADR-0012).
- Remote/shared **`SBP_URL`** remains valid when explicitly set; it is **not** the default solo path.
- Automatic cluster replication or horizontal SBP.

## Consequences

- New FR row **FR-5.5** and deterministic tests under **`packages/opencode-plugin`** + **`packages/sbp-server`**.
- Golden path and troubleshooting docs centre on **`SBP_URL` unset** for solo development.

## Verification

- `cd packages/sbp-server && npm test` (including **`supervised-runtime.test.mjs`**).
- `cd packages/opencode-plugin && npm test` (including supervision unit tests).
- `bash scripts/verify-opencode-plugin-contract.sh`, `bash scripts/verify-stigmergy-sbp-supervision-doc.sh`.
- `bash scripts/verify-requirement-traceability.sh` after RTM/FR updates.

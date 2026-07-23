# OpenCode + stigmergy troubleshooting (operators)

Use this when the [golden path](../guides/opencode-stigmergy-golden-path.md) loop fails: SBP down, graph CLI errors, plugin prefixes like `sbp_error:` / `graph_error:`, or orchestration policy problems. **Honesty:** this doc does not diagnose arbitrary application bugs—only the **reference bridge** (HTTP SBP, `uv` graph CLIs, plugin tools). Verification boundaries: [ADR-0004](../adr/0004-verification-stack-layering.md).

## SBP unreachable or wrong URL or port

- **`SBP_URL`** must match where the SBP server listens (default in golden path: `http://127.0.0.1:3847`). Wrong host/port yields connection failures or timeouts from curl and from plugin tools.
- **Sanity check** (SBP running):

  ```bash
  curl -sSf "${SBP_URL:-http://127.0.0.1:3847}/pheromones"
  ```

- If the process is not listening: start from `packages/sbp-server` per the golden path; see [sbp-operator-runbook.md](sbp-operator-runbook.md) and load/decay expectations in [sbp-slo.md](sbp-slo.md).
- **Port already in use (`EADDRINUSE` on 3847):** another SBP (or other process) is bound to that port. Either stop the other listener (e.g. `lsof -nP -iTCP:3847 -sTCP:LISTEN`) or start SBP on a different port and set **`SBP_URL`** to match (e.g. `PORT=3848` and `export SBP_URL=http://127.0.0.1:3848`). With **`SBP_URL` unset**, supervision uses an **ephemeral** port (`listen(0)`), not fixed ranges — see [ADR-0014](../adr/0014-sbp-project-supervision.md).
- **`SBP_LOG_FILE`** — enable NDJSON server logs when diagnosing publish/stream behaviour ([golden path](../guides/opencode-stigmergy-golden-path.md) §6).

## Project-local SBP supervision

When **`SBP_URL` is unset**, the OpenCode plugin **attaches or spawns** project-local [`@oh-my-stigmergy/sbp-server`](../../packages/sbp-server) per [ADR-0014](../adr/0014-sbp-project-supervision.md). **`SBP_URL` set** means **attach only** — no second listener.

- **Stale `runtime.json`** — if **`<worktree>/.stigmergy/runtime.json`** exists but **`GET …/healthz`** fails and the recorded **`pid`** is dead, the plugin removes the file and may spawn a fresh server. If **`healthz`** fails but the **`pid`** is alive, the plugin does not kill it; fix the process or set **`SBP_URL`** explicitly.
- **`STIGMERGY_NODE`** — must be a working **Node** binary on the host (`better-sqlite3` is a native addon; do not point this at Bun for the child server).
- **`.stigmergy/` permissions** — the plugin creates **`.stigmergy/`** under the OpenCode worktree; ensure the user running OpenCode can write there.
- **SQLite ledger lock (`ELEDGERLOCKED`, exit code 75)** — two processes opened the same SQLite ledger file; only one writer is allowed ([`packages/sbp-server/server.mjs`](../../packages/sbp-server/server.mjs)). Ensure you are not mixing supervision with a second manual **`npm start`** against the same **`ledger.db`** path.

## Plugin bridge errors (sbp_error and graph_error)

Plugin tools return **structured prefixes** instead of crashing OpenCode when dependencies fail:

- **`sbp_error:`** — HTTP client could not complete an SBP request (wrong URL, server down, network). Fix **SBP_URL** and ensure the server is running.
- **`graph_error:`** — `uv run python -m graph.load_node` (or aspect) failed—often **`uv` / Python**, wrong repo root for `cwd`, or missing `uv sync`. See the next section.

Cross-read [golden path §5](../guides/opencode-stigmergy-golden-path.md) (“Verify inside OpenCode”).

## Auth errors (auth_error and kind_unregistered)

Only relevant when the SBP server is running with **`SBP_AUTH_TOKENS_FILE`** set (identity mode —
[ADR-0016](../adr/0016-sbp-ledger-identity-and-kind.md)). Absent that env var the server is in
**open mode** and none of this applies; a plugin without a matching token simply gets these errors
back unwrapped (not double-prefixed with `sbp_error:`):

- **`auth_error:401:missing_token`** — no (or malformed) `Authorization: Bearer <token>` header was
  sent. Set **`STIGMERGY_AGENT_TOKEN`** in the OpenCode plugin's environment to a token present in
  the server's `SBP_AUTH_TOKENS_FILE`.
- **`auth_error:403:unknown_token`** — the token was sent but is not in the server's registry. Check
  for a typo, or that the plugin and server point at the same `SBP_AUTH_TOKENS_FILE` generation.
- **`auth_error:403:kind_privileged`** — the identity's class (`worker`) is not in the `publishableBy`
  list for the pheromone's `kind` in **`SBP_KIND_REGISTRY_FILE`**. Only relevant once a kind
  restricted to `privileged` is registered — the baseline registry ships `signal` open to both
  classes.
- **`kind_unregistered`** (bare, not `auth_error:`-prefixed) — `SBP_KIND_REGISTRY_FILE` is set and the
  pheromone's `kind` (defaults to `"signal"` if omitted) is not in it. Register the kind, or omit it
  to fall back to `signal`.
- **`auth_error:429:inflate_budget`** — the identity exceeded **`SBP_INFLATE_MAX_PER_WINDOW`** within
  **`SBP_INFLATE_WINDOW_SECONDS`**; wait for the window to elapse or raise the budget.

## uv and Python 3.13

- Run [`scripts/bootstrap-opencode-stigmergy-stack.sh`](../../scripts/bootstrap-opencode-stigmergy-stack.sh) from the repo root to install **graph** and **Node** package deps (`uv sync`, `npm ci` in `packages/sbp-server` and `packages/opencode-plugin`).
- **Python 3.13** is the documented interpreter for graph CLIs ([CONTRIBUTING.md](../../CONTRIBUTING.md)). If `uv run python -m graph.load_node` fails, verify `python3.13` and re-run `uv sync`.
- From repo root, reproduce without OpenCode (same `repo` + node id shape as **`graph_load_node`** when the worktree is the monorepo):

  ```bash
  uv run python -m graph.load_node "$PWD" "tests/fixtures/graph-corpus/sample.py#1"
  ```

  Equivalent, using the tiny fixture tree as the repo root:

  ```bash
  uv run python -m graph.load_node "$PWD/tests/fixtures/graph-corpus" "sample.py#1"
  ```

  Mixing **`tests/fixtures/graph-corpus`** as `repo` with a **`tests/fixtures/...` node id** fails lookup (“missing node”) because paths must be consistent with the chosen repo root.

### Plugin audit log (`STIGMERGY_AUDIT_LOG_FILE`)

- If **`STIGMERGY_AUDIT_LOG_FILE`** is set but **no file appears**, confirm the variable is in the **environment of the OpenCode host process** (global shell profile, launchd, IDE terminal, or wrapper script)—not only in a subshell used for one-off commands.
- **`opencode debug startup`** may not exercise the same code paths as an interactive session; if audit lines never appear, validate with a normal **`opencode run`** / TUI session while **`STIGMERGY_AUDIT_LOG_STDERR=1`** for immediate feedback, then use **`npm run metrics`** in [`packages/opencode-plugin`](../../packages/opencode-plugin/) on the captured NDJSON ([golden path](../guides/opencode-stigmergy-golden-path.md) §6).

## STIGMERGY_ORCHESTRATION_CONFIG and orchestration policy

- **`STIGMERGY_ORCHESTRATION_CONFIG`** must point to a JSON file that validates against [`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json). Invalid JSON or schema mismatch surfaces at plugin load or tool invocation—validate locally with the playbook examples in [opencode-model-routing-playbook.md](../guides/opencode-model-routing-playbook.md).
- **Orchestration semantics** follow [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md); **plugin packaging** follows [ADR-0012](../adr/0012-opencode-plugin-architecture.md). Multi-session / named sub-agent rosters remain **upstream-deferred** ([BACKLOG.md](../BACKLOG.md)).

## References

- [opencode-stigmergy-golden-path.md](../guides/opencode-stigmergy-golden-path.md)
- [bootstrap-opencode-stigmergy-stack.sh](../../scripts/bootstrap-opencode-stigmergy-stack.sh)
- [ADR-0012](../adr/0012-opencode-plugin-architecture.md), [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md), [ADR-0014](../adr/0014-sbp-project-supervision.md)

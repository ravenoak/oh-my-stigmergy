# OpenCode + stigmergy golden path (operator)

This guide is the **single end-to-end path** from a fresh clone to a working **OpenCode plugin → SBP → graph** loop. **Default solo path:** leave **`SBP_URL` unset** so the plugin **supervises** a project-local [`@oh-my-stigmergy/sbp-server`](../../packages/sbp-server) per [ADR-0014](../adr/0014-sbp-project-supervision.md); explicit **`SBP_URL`** means attach-only (manual or shared listener). The guide complements (does not replace) the shared-medium pillars in [PRD.md](../PRD.md): intent (Allium), graph ([`packages/graph`](../../packages/graph)), SBP ([`packages/sbp-server`](../../packages/sbp-server)), crucible ([`packages/crucible`](../../packages/crucible)). For **normative boundaries** (multi-agent meaning, verification scope) see [project-positioning-and-boundaries.md](project-positioning-and-boundaries.md). For **SDLC patterns** (pheromone trails, spec gates, release discipline) see [stigmergic-sdlc-workflows.md](stigmergic-sdlc-workflows.md).

## When something fails

See **[opencode-stigmergy-troubleshooting.md](../operations/opencode-stigmergy-troubleshooting.md)** for **SBP** connectivity, **`sbp_error:`** / **`graph_error:`** return prefixes, **`uv` / Python 3.13**, and **`STIGMERGY_ORCHESTRATION_CONFIG`** / JSON schema issues.

## Prerequisites

- **This repository** cloned locally (`OH_MY` below is the repo root).
- **Node.js** (for `packages/sbp-server`; matches CI usage on Node for tests).
- **`uv`** and **Python 3.13** for graph CLIs ([CONTRIBUTING.md](../../CONTRIBUTING.md)).
- **OpenCode** installed and able to load plugins per [OpenCode plugins](https://opencode.ai/docs/plugins/).
- **One terminal** is enough when **`SBP_URL` is unset** (plugin supervises SBP). Use a **second** terminal only if you run **manual** SBP on a fixed port for debugging ([§2](#2-sbp-coordination-layer)).

## 1) Python workspace (graph tools)

From the repo root:

```bash
cd "$OH_MY"
uv sync -U --all-extras --all-groups -p "$(which python3.13)"
```

Verify graph CLI from `$OH_MY` (matches how **`graph_load_node`** uses the monorepo root as `repo`):

```bash
uv run python -m graph.load_node "$OH_MY" "tests/fixtures/graph-corpus/sample.py#1"
```

Equivalent check using the tiny fixture tree itself as the repo root:

```bash
uv run python -m graph.load_node "$OH_MY/tests/fixtures/graph-corpus" "sample.py#1"
```

You should see byte-card output for line 1 of `sample.py`. If this fails, fix `uv` / Python / path before involving OpenCode.

## 2) SBP (coordination layer)

### Default (solo): supervision — leave `SBP_URL` unset

When the OpenCode plugin loads with **`SBP_URL` unset**, it **attaches or spawns** [`@oh-my-stigmergy/sbp-server`](../../packages/sbp-server) for the OpenCode **worktree**, listens on an **ephemeral** TCP port (`PORT=0`), and writes **`$worktree/.stigmergy/runtime.json`** with the effective **`url`**. You **do not** need `npm start` in another shell for everyday use. Normative detail: [ADR-0014](../adr/0014-sbp-project-supervision.md).

- **`STIGMERGY_SUPERVISE=0`** (or `false`) disables supervision and restores the legacy base URL **`http://127.0.0.1:3847`** — you must start SBP yourself on that port if you use ledger tools.
- **`STIGMERGY_NODE`** selects the **`node`** binary used to spawn the server (default: `node` on `PATH`).
- The supervised child process is **not** stopped when OpenCode exits; stop explicitly if needed (`SIGTERM` to **`runtime.json` `pid`**, or `npm run stop` from [`packages/sbp-server`](../../packages/sbp-server) when documented there).

### Manual / debugging: fixed port + explicit URL

To drive SBP yourself (HTTP traces, comparisons with older flows), start it in a **separate** shell and point the plugin at it:

```bash
cd "$OH_MY/packages/sbp-server"
npm install
PORT=3847 npm start
```

Set **`export SBP_URL=http://127.0.0.1:3847`** (matching **`PORT`**) so the plugin **never spawns** a second server ([ADR-0014](../adr/0014-sbp-project-supervision.md)). Without **`SBP_URL`**, supervision would try to bind another listener — avoid double stacks.

Optional structured server log (matches [sbp-slo.md](../operations/sbp-slo.md)):

```bash
SBP_LOG_FILE=/tmp/sbp.ndjson SBP_LOG_STDERR=1 PORT=3847 npm start
```

Health check (manual fixed port):

```bash
curl -sSf "${SBP_URL:-http://127.0.0.1:3847}/healthz"
```

With **supervision**, after the plugin has started SBP at least once, read **`url`** from **`$OH_MY/.stigmergy/runtime.json`** (your OpenCode worktree may differ) and **`curl "$url/healthz"`**.

## 3) Install the in-tree OpenCode plugin

Do **not** rely on npm registry until [ADR-0012](../adr/0012-opencode-plugin-architecture.md) publish criteria are met; use a **local path** to [`packages/opencode-plugin`](../../packages/opencode-plugin).

In your OpenCode project configuration (see upstream docs for `opencode.json` / plugin array), add the plugin package path pointing at `$OH_MY/packages/opencode-plugin`.

Environment variables the plugin reads ([packages/opencode-plugin/README.md](../../packages/opencode-plugin/README.md)):

| Variable | Purpose |
|----------|---------|
| `SBP_URL` | When **set**, ledger base URL — plugin **attaches only** (no spawn). When **unset**, project-local supervision applies ([ADR-0014](../adr/0014-sbp-project-supervision.md)). |
| `STIGMERGY_SUPERVISE` | Set to **`0`** or **`false`** to skip supervision and use **`http://127.0.0.1:3847`** without spawning (you run SBP yourself). |
| `STIGMERGY_NODE` | Node binary for spawning **`@oh-my-stigmergy/sbp-server`** (default **`node`**). |
| `STIGMERGY_DEFAULT_STANCE` | Optional; default `feature_implementation`. |
| `STIGMERGY_AUDIT_LOG_FILE` | Optional NDJSON audit log for plugin bootstrap, events, and tool executions. |
| `STIGMERGY_AUDIT_LOG_STDERR` | Set to `1` to mirror audit lines to stderr. |

Example audit setup:

```bash
export STIGMERGY_AUDIT_LOG_FILE=/tmp/stigmergy-plugin.ndjson
```

Restart OpenCode after changing plugin env vars.

## 4) Minimal functional checks (without OpenCode UI)

Pick a base URL:

- **Manual SBP:** `export SBP_URL=http://127.0.0.1:3847` (or your **`PORT`**).
- **Supervision:** after OpenCode has loaded the plugin once, read **`url`** from **`<worktree>/.stigmergy/runtime.json`** (often **`$OH_MY/.stigmergy/runtime.json`** when the worktree is the repo root) and `export SBP_URL='<that url>'`, then run:

```bash
curl -sSf -X POST "$SBP_URL/pheromones" \
  -H 'Content-Type: application/json' \
  -d '{"id":"00000000-0000-4000-8000-000000000001","stanceTarget":"golden_path","baseIntensity":1,"decayRate":0.01}'
curl -sSf "$SBP_URL/pheromones" | head -c 500 && echo
```

## 5) Verify inside OpenCode (tools)

Once the plugin loads (`StigmergyPlugin` — see [ADR-0012](../adr/0012-opencode-plugin-architecture.md)):

- Use **`stigmergy_publish`** with a new UUID, valid `stanceTarget`, `baseIntensity`, `decayRate`.
- Use **`graph_load_node`** with `node_id` **`tests/fixtures/graph-corpus/sample.py#1`** and `repo` / cwd set to **`$OH_MY`** (the plugin passes the OpenCode worktree / configured repo root to `uv run python -m graph.load_node`).

Return strings starting with `sbp_error:` or `graph_error:` mean the bridge ran but the dependency failed (SBP down, `uv` missing, wrong repo root); they are **not** OpenCode crashes.

- **Orchestration (FR-6.x):** use **`stigmergy_actionable`** with `olfactory_threshold` (0–1) to list high-intensity pheromones from the ledger; use **`stigmergy_resolve_model`** with a `stance_target` to read the configured OpenCode model id (override policy via `STIGMERGY_ORCHESTRATION_CONFIG`). See [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md). Moving from oh-my-openagent: [migration-from-oh-my-openagent.md](migration-from-oh-my-openagent.md).

## 6) Observability (cross-read logs)

| Surface | Env | Summarize |
|---------|-----|-----------|
| SBP HTTP lifecycle | `SBP_LOG_FILE` | `cd packages/sbp-server && npm run metrics -- /tmp/sbp.ndjson` |
| Plugin audit | `STIGMERGY_AUDIT_LOG_FILE` | `cd packages/opencode-plugin && npm run metrics -- /tmp/stigmergy-plugin.ndjson` |

These logs are **orthogonal**: SBP records server-side HTTP events; the plugin records client-side tool/event audit lines. Neither replaces the other. Neither constitutes proof that arbitrary application code satisfies Allium specs ([ADR-0004](../adr/0004-verification-stack-layering.md)).

## 7) Non-goals (stay honest)

- **No automatic command blocking** in the plugin without a successor to [ADR-0005](../adr/0005-conflict-resolution-governance.md) ([ADR-0012](../adr/0012-opencode-plugin-architecture.md)).
- **No Z3/crucible tool** inside the plugin session path (latency + honesty — crucible remains CI).
- **Org-wide PATH / OPA** and essay-scale ContextCov parity remain **not pursued** per [BACKLOG.md](../BACKLOG.md) and [ADR-0004](../adr/0004-verification-stack-layering.md).

## References

- [packages/opencode-plugin/README.md](../../packages/opencode-plugin/README.md)
- [packages/sbp-server/README.md](../../packages/sbp-server/README.md)
- [docs/operations/sbp-slo.md](../operations/sbp-slo.md)
- [ADR-0012](../adr/0012-opencode-plugin-architecture.md)
- [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md)
- [ADR-0014](../adr/0014-sbp-project-supervision.md)
- [migration-from-oh-my-openagent.md](migration-from-oh-my-openagent.md)

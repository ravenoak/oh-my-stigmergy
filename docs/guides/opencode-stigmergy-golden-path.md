# OpenCode + stigmergy golden path (operator)

This guide is the **single end-to-end path** from a fresh clone to a working **OpenCode plugin → SBP → graph** loop. It complements (does not replace) the shared-medium pillars in [PRD.md](../PRD.md): intent (Allium), graph ([`packages/graph`](../../packages/graph)), SBP ([`packages/sbp-server`](../../packages/sbp-server)), crucible ([`packages/crucible`](../../packages/crucible)).

## Prerequisites

- **This repository** cloned locally (`OH_MY` below is the repo root).
- **Node.js** (for `packages/sbp-server`; matches CI usage on Node for tests).
- **`uv`** and **Python 3.13** for graph CLIs ([CONTRIBUTING.md](../../CONTRIBUTING.md)).
- **OpenCode** installed and able to load plugins per [OpenCode plugins](https://opencode.ai/docs/plugins/).
- Two terminals (or background process): one for SBP, one for OpenCode / manual checks.

## 1) Python workspace (graph tools)

From the repo root:

```bash
cd "$OH_MY"
uv sync -U --all-extras --all-groups -p "$(which python3.13)"
```

Verify graph CLI from root:

```bash
uv run python -m graph.load_node "$OH_MY/tests/fixtures/graph-corpus" "tests/fixtures/graph-corpus/sample.py#1"
```

You should see byte-card output for line 1 of `sample.py`. If this fails, fix `uv` / Python / path before involving OpenCode.

## 2) Start SBP (coordination layer)

In a **separate** shell:

```bash
cd "$OH_MY/packages/sbp-server"
npm install
PORT=3847 npm start
```

Default bind matches the plugin’s default `SBP_URL` (`http://127.0.0.1:3847`). Keep this process running.

Optional structured server log (matches [sbp-slo.md](../operations/sbp-slo.md)):

```bash
SBP_LOG_FILE=/tmp/sbp.ndjson SBP_LOG_STDERR=1 PORT=3847 npm start
```

Health check:

```bash
curl -sSf "http://127.0.0.1:3847/healthz"
```

## 3) Install the in-tree OpenCode plugin

Do **not** rely on npm registry until [ADR-0012](../adr/0012-opencode-plugin-architecture.md) publish criteria are met; use a **local path** to [`packages/opencode-plugin`](../../packages/opencode-plugin).

In your OpenCode project configuration (see upstream docs for `opencode.json` / plugin array), add the plugin package path pointing at `$OH_MY/packages/opencode-plugin`.

Environment variables the plugin reads ([packages/opencode-plugin/README.md](../../packages/opencode-plugin/README.md)):

| Variable | Purpose |
|----------|---------|
| `SBP_URL` | Ledger base URL (default matches step 2). |
| `STIGMERGY_DEFAULT_STANCE` | Optional; default `feature_implementation`. |
| `STIGMERGY_AUDIT_LOG_FILE` | Optional NDJSON audit log for plugin bootstrap, events, and tool executions. |
| `STIGMERGY_AUDIT_LOG_STDERR` | Set to `1` to mirror audit lines to stderr. |

Example audit setup:

```bash
export STIGMERGY_AUDIT_LOG_FILE=/tmp/stigmergy-plugin.ndjson
```

Restart OpenCode after changing plugin env vars.

## 4) Minimal functional checks (without OpenCode UI)

With SBP running on port 3847:

```bash
export SBP_URL="http://127.0.0.1:3847"
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
- [migration-from-oh-my-openagent.md](migration-from-oh-my-openagent.md)

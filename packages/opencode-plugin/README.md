# @oh-my-stigmergy/opencode-plugin

OpenCode plugin that bridges the **cognitive layer** (OpenCode agents) to this repo’s **coordination** and **epistemic** layers: [SBP](../../packages/sbp-server) over HTTP and [graph](../../packages/graph) CLIs via the OpenCode shell (`$`), with **stigmergic orchestration** helpers ([ADR-0013](../../docs/adr/0013-stigmergic-opencode-orchestration.md)).

**Requirements:** **FR-5.x**, **FR-6.x**, **NFR-C3** | **ADR:** [ADR-0012](../../docs/adr/0012-opencode-plugin-architecture.md), [ADR-0013](../../docs/adr/0013-stigmergic-opencode-orchestration.md) | **Roadmap:** [Phase 13–15](../../docs/ROADMAP.md).

**Operator docs:** [Model routing playbook](../../docs/guides/opencode-model-routing-playbook.md) · [Compatibility matrix](../../docs/operations/opencode-compatibility.md) · [npm release runbook](../../docs/operations/opencode-plugin-release.md)

## Scope boundaries

- **In scope:** SBP HTTP tools, graph shell tools, event hooks, **ledger-first orchestration** (`stigmergy_actionable`, `stigmergy_resolve_model`), declarative stance→model policy ([`schema/orchestration.schema.json`](schema/orchestration.schema.json)).
- **Out of scope:** Vendoring [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent); automatic `permission.asked` / `tool.execute.before` blocking without a successor to [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md); Z3/crucible tools inside the session (crucible remains CI per [ADR-0006](../../docs/adr/0006-p4-crucible-execution.md)).

## Configuration

| Variable | Purpose |
|----------|---------|
| `SBP_URL` | Ledger base URL (default `http://127.0.0.1:3847`). Start SBP separately: `cd packages/sbp-server && npm start`. |
| `STIGMERGY_DEFAULT_STANCE` | Default `stanceTarget` for event-sourced pheromones (default `feature_implementation`). |
| `STIGMERGY_ORCHESTRATION_CONFIG` | Optional path to JSON matching [`schema/orchestration.schema.json`](schema/orchestration.schema.json): `defaultModel`, `stanceModels`, `localPreferredStances`, optional **`defaultOlfactoryThreshold`**, **`defaultActionableLimit`**, **`maxActionable`** (bounded fan-out). Defaults ship in [`src/orchestration.mjs`](src/orchestration.mjs) **as examples only**—set real OpenCode provider/model ids for your environment. |
| `STIGMERGY_AUDIT_LOG_FILE` | Append-only **NDJSON** audit log (`{ ts, event, ... }`) for plugin bootstrap, OpenCode event hooks, and tool executions. Offline analysis only; not a substitute for SBP server logs (`SBP_LOG_FILE`). |
| `STIGMERGY_AUDIT_LOG_STDERR` | Set to `1` to mirror each audit line to stderr (same pattern as `SBP_LOG_STDERR` on the ledger). |
| `STIGMERGY_PLUGIN_AUDIT_LOG_FILE` | **Deprecated:** alias for `STIGMERGY_AUDIT_LOG_FILE` when the canonical variable is unset. |

## Tools

| Tool | Purpose |
|------|---------|
| `stigmergy_publish` | `POST /pheromones` with Zod-validated body; optional `payloadJson` string. |
| `stigmergy_pheromones` | `GET /pheromones` (raw JSON text). |
| `stigmergy_claim` | `POST /pheromones/:id/claim` (returns `claimed_conflict:409` on duplicate). |
| `stigmergy_inflate` | `POST /pheromones/:id/inflate`. |
| `stigmergy_actionable` | Fetch `GET /pheromones`, return JSON subset with `intensity >= olfactory_threshold`, optional `stance_target` filter, sorted by intensity. Args optional: omit `olfactory_threshold` / `limit` to use policy defaults (`defaultOlfactoryThreshold`, `defaultActionableLimit`, capped by `maxActionable`). |
| `stigmergy_resolve_model` | Resolve OpenCode model id for a `stance_target` using orchestration policy; returns `model:…` and `local_preferred:true|false`. |
| `graph_load_node` | `uv run python -m graph.load_node <repo> <node_id>` with optional `--depth` / `--edge-kind`. |
| `graph_aspect` | `uv run python -m graph.aspect <repo>` with optional `--kind`. |

Invalid arguments return `validation_error:…`. SBP / network failures return `sbp_error:…` or `graph_error:…` (no thrown errors to the host).

## Events

- `session.idle` — publishes a low-intensity pheromone (fail-soft).
- `file.edited` — publishes a pheromone with `path` when the event carries one.

## Install

Per [OpenCode plugins](https://opencode.ai/docs/plugins/):

1. **npm:** add `"@oh-my-stigmergy/opencode-plugin"` to the `plugin` array in `opencode.json` (package is **`private: false`** in this monorepo—publish to npm per maintainer release, or use **local path** below).
2. From a **git checkout** of oh-my-stigmergy: point OpenCode at `packages/opencode-plugin` (same repo root where `uv run python -m graph…` resolves).

Ensure **`uv`** and repo **`packages/graph`** are usable from the OpenCode process cwd (`graph_*` tools).

## Develop

```bash
cd packages/opencode-plugin && npm ci && npm test
```

## Metrics (audit log summary)

With `STIGMERGY_AUDIT_LOG_FILE` set during sessions, summarize a captured file:

```bash
npm run metrics -- /path/to/audit.ndjson
```

Stdout is a single JSON object (event counts, tool/class breakdown, publish hook aggregates). This measures **plugin-emitted** audit lines only.

CI runs the same via `allium-specs` **specs-and-packages** and [`scripts/verify-opencode-plugin-contract.sh`](../../scripts/verify-opencode-plugin-contract.sh) in **governance**.

# @oh-my-stigmergy/opencode-plugin

OpenCode plugin that bridges the **cognitive layer** (OpenCode agents) to this repo’s **coordination** and **epistemic** layers: [SBP](../../packages/sbp-server) over HTTP and [graph](../../packages/graph) CLIs via the OpenCode shell (`$`), with **stigmergic orchestration** helpers ([ADR-0013](../../docs/adr/0013-stigmergic-opencode-orchestration.md)).

**Requirements:** **FR-5.x**, **FR-6.x**, **NFR-C3** | **ADR:** [ADR-0012](../../docs/adr/0012-opencode-plugin-architecture.md), [ADR-0013](../../docs/adr/0013-stigmergic-opencode-orchestration.md) | **Roadmap:** [Phase 13+](../../docs/ROADMAP.md).

## Who should read this

| Audience | Start here | Why |
|----------|--------------|-----|
| **Humans** (operators, maintainers) | This README + [golden path](../../docs/guides/opencode-stigmergy-golden-path.md) | End-to-end clone → SBP → OpenCode → graph; then come back for configuration details. |
| **Coding agents** (Cursor, OpenCode, others) | This README + [AGENTS.md](../../AGENTS.md) | Same facts as humans: capabilities, limits, env vars, tools—plus repo-wide rules (RTM, no invented enforcement). |

**Operator docs (maintainers):** [Model routing playbook](../../docs/guides/opencode-model-routing-playbook.md) · [Compatibility matrix](../../docs/operations/opencode-compatibility.md) · [npm release runbook](../../docs/operations/opencode-plugin-release.md)

**When something breaks:** [OpenCode + stigmergy troubleshooting](../../docs/operations/opencode-stigmergy-troubleshooting.md) (SBP down, `sbp_error` / `graph_error`, `uv`, orchestration JSON).

## Capabilities

The plugin exposes **deterministic HTTP tools** to the SBP ledger and **shell-backed graph tools** that run this repo’s Python `graph` package. It also wires **OpenCode event hooks** for lightweight pheromone trails.

- **Ledger (SBP):** publish, list, claim, inflate pheromones; fetch **actionable** items with intensity and stance filters per orchestration policy.
- **Orchestration:** `stigmergy_resolve_model` applies stance→model policy from optional JSON ([`schema/orchestration.schema.json`](schema/orchestration.schema.json)); defaults in [`src/orchestration.mjs`](src/orchestration.mjs) are examples—set real provider/model ids for your environment.
- **Graph:** load nodes and aspects via `uv run python -m graph…` from the working directory you run OpenCode against (typically the repo root).
- **Events:** `session.idle` and `file.edited` publish low-signal pheromones (fail-soft).
- **Audit:** optional NDJSON audit log for bootstrap, hooks, and tool calls (`STIGMERGY_AUDIT_LOG_FILE`); offline analysis; not a substitute for SBP server logs.

## Limitations

These boundaries avoid confusion with other harnesses and with CI-only verification.

- **No vendoring of [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent):** this stack is stigmergy-first (SBP + graph + orchestration), not the OMO hierarchy.
- **No automatic governance blocking** on `permission.asked` / `tool.execute.before` without a successor to [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md).
- **No Z3 or crucible inside the agent session:** crucible remains a **CI** concern per [ADR-0006](../../docs/adr/0006-p4-crucible-execution.md). Do not tell users the plugin “runs” solvers at chat time.
- **Graph tools require `uv` and repo layout:** `graph_*` spawn subprocesses; if `uv` or `packages/graph` are wrong from the process cwd, you get `graph_error:…` (see troubleshooting).
- **SBP must be running** for ledger tools; wrong URL or down server yields `sbp_error:…`. Tools return structured errors instead of throwing into the host.
- **Policy defaults are not universal truth:** orchestration JSON and env defaults must match **your** OpenCode provider’s model ids and your stance taxonomy.

For **repository-wide** verification claims (Allium, RTM, what is actually enforced), follow [docs/traceability/RTM.md](../../docs/traceability/RTM.md) and [ADR-0004](../../docs/adr/0004-verification-stack-layering.md).

## Prerequisites

- **Node.js** and **npm** (OpenCode and this plugin are npm packages).
- **`uv`** and a synced Python env for this repo’s **`packages/graph`** (see [CONTRIBUTING.md](../../CONTRIBUTING.md) `uv sync …`).
- **SBP** available at `SBP_URL` (default `http://127.0.0.1:3847`) when using ledger tools—start it separately from [`packages/sbp-server`](../../packages/sbp-server).

## Install

Per [OpenCode plugins](https://opencode.ai/docs/plugins/), register this package in your OpenCode config (commonly `opencode.json`).

### From npm

When published to npm as **`@oh-my-stigmergy/opencode-plugin`** (`private: false` in this monorepo), add the package to the `plugins` (or `plugin`—follow your OpenCode version’s schema) array:

```json
{
  "plugins": ["@oh-my-stigmergy/opencode-plugin"]
}
```

Maintainers: publish per [npm release runbook](../../docs/operations/opencode-plugin-release.md).

### From a git checkout (local path)

If you are developing or consuming from the monorepo clone, point OpenCode at **`packages/opencode-plugin`** (relative to repo root), per OpenCode’s docs for local plugins. Example pattern:

```json
{
  "plugins": ["./packages/opencode-plugin"]
}
```

Adjust the path so it resolves from **where OpenCode loads config** (often the repo root).

### After install

1. Start SBP if you need ledger tools: `cd packages/sbp-server && npm start` (or your deployment).
2. Ensure OpenCode’s **current working directory** is the repo root so `graph_load_node` / `graph_aspect` can run `uv run python -m graph…` successfully.
3. Set env vars (below) or rely on defaults for local dev.

**Full operator walkthrough:** [docs/guides/opencode-stigmergy-golden-path.md](../../docs/guides/opencode-stigmergy-golden-path.md).

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

## How to use (typical flows)

**Operators**

1. Follow the [golden path](../../docs/guides/opencode-stigmergy-golden-path.md) once per machine/workspace.
2. Set `STIGMERGY_ORCHESTRATION_CONFIG` if you use non-default stance→model routing ([playbook](../../docs/guides/opencode-model-routing-playbook.md)).
3. Use ledger tools to observe or advance coordination; use graph tools to inspect traceability graph data for the repo path you pass.

**Coding agents**

1. Read this README and [AGENTS.md](../../AGENTS.md). Do not claim Z3, OPA, or Allium→SMT **enforcement** unless [RTM](../../docs/traceability/RTM.md) says `implemented`.
2. Prefer **`stigmergy_actionable`** / **`stigmergy_resolve_model`** when choosing what to work on and which model id fits the stance.
3. On **`sbp_error`** / **`graph_error`**, check [troubleshooting](../../docs/operations/opencode-stigmergy-troubleshooting.md) (SBP up, `SBP_URL`, `uv`, cwd).

**Session analytics**

With `STIGMERGY_AUDIT_LOG_FILE` set during sessions, summarize a captured file:

```bash
npm run metrics -- /path/to/audit.ndjson
```

Stdout is a single JSON object (event counts, tool/class breakdown, publish hook aggregates). This measures **plugin-emitted** audit lines only.

## Develop

```bash
cd packages/opencode-plugin && npm ci && npm test
```

CI runs contract checks via `allium-specs` **specs-and-packages** and [`scripts/verify-opencode-plugin-contract.sh`](../../scripts/verify-opencode-plugin-contract.sh) in **governance**.

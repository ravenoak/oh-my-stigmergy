# @oh-my-stigmergy/opencode-plugin

OpenCode plugin that bridges the **cognitive layer** (OpenCode agents) to this repo’s **coordination** and **epistemic** layers: [SBP](../../packages/sbp-server) over HTTP and [graph](../../packages/graph) CLIs via the OpenCode shell (`$`).

**Requirements:** **FR-5.1–FR-5.3** | **ADR:** [ADR-0012](../../docs/adr/0012-opencode-plugin-architecture.md) (**Accepted**) | **Roadmap:** [Phase 11](../../docs/ROADMAP.md) (**complete**).

## Non-goals

- Not a replacement for [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (Sisyphus / orchestration).
- No automatic `permission.asked` / `tool.execute.before` blocking without a successor to [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md).

## Configuration

| Variable | Purpose |
|----------|---------|
| `SBP_URL` | Ledger base URL (default `http://127.0.0.1:3847`). Start SBP separately: `cd packages/sbp-server && npm start`. |
| `STIGMERGY_DEFAULT_STANCE` | Default `stanceTarget` for event-sourced pheromones (default `feature_implementation`). |

## Tools

| Tool | Purpose |
|------|---------|
| `stigmergy_publish` | `POST /pheromones` with Zod-validated body; optional `payloadJson` string. |
| `stigmergy_pheromones` | `GET /pheromones` (raw JSON text). |
| `stigmergy_claim` | `POST /pheromones/:id/claim` (returns `claimed_conflict:409` on duplicate). |
| `stigmergy_inflate` | `POST /pheromones/:id/inflate`. |
| `graph_load_node` | `uv run python -m graph.load_node <repo> <node_id>` with optional `--depth` / `--edge-kind`. |
| `graph_aspect` | `uv run python -m graph.aspect <repo>` with optional `--kind`. |

Invalid arguments return `validation_error:…`. SBP / network failures return `sbp_error:…` or `graph_error:…` (no thrown errors to the host).

## Events

- `session.idle` — publishes a low-intensity pheromone (fail-soft).
- `file.edited` — publishes a pheromone with `path` when the event carries one.

## Install

Per [OpenCode plugins](https://opencode.ai/docs/plugins/):

1. **npm (recommended):** add `"@oh-my-stigmergy/opencode-plugin"` to the `plugin` array in `opencode.json` (publish path TBD while `private: true`; for now use **local path** or copy this folder into `.opencode/plugins/` / `~/.config/opencode/plugins/`).
2. From a **git checkout** of oh-my-stigmergy: point OpenCode at `packages/opencode-plugin` (same repo root where `uv run python -m graph…` resolves).

Ensure **`uv`** and repo **`packages/graph`** are usable from the OpenCode process cwd (`graph_*` tools).

## Develop

```bash
cd packages/opencode-plugin && npm ci && npm test
```

CI runs the same via `allium-specs` **specs-and-packages** and [`scripts/verify-opencode-plugin-contract.sh`](../../scripts/verify-opencode-plugin-contract.sh) in **governance**.

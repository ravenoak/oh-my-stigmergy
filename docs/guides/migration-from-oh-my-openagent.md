# Migration from oh-my-openagent (OMO)

**Stance:** [oh-my-stigmergy](https://github.com/ravenoak/oh-my-stigmergy) is the **recommended** way to combine OpenCode with **stigmergic** coordination in this project. [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md) records the architecture; [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) is a **hierarchical** harness (Sisyphus, parallel sub-agents) and is **not** a supported dependency for the operator path documented here.

## What you gain

- **Blackboard coordination** — work and signals live on the SBP ledger (HTTP) with first-class pheromone semantics (FR-3.x).
- **Graph-grounded context** — `graph_load_node` / `graph_aspect` via the plugin’s shell tools (relation-first retrieval).
- **Orchestration helpers** — `stigmergy_actionable` (threshold + stance filter over ledger intensities) and `stigmergy_resolve_model` (stance → OpenCode model id per JSON policy and [`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json)).
- **Deterministic CI** — plugin contract + tests against the same commit as SBP and graph.

## What you do not get automatically

OMO ships a large **orchestration product** (named agents, ultrawork flows, curated MCPs, Claude Code compatibility layer). **Pixel parity is not a goal** for oh-my-stigmergy; gaps are tracked in [BACKLOG.md](../BACKLOG.md) under **OMO feature parity** with phased FR targets.

## Migration steps (conceptual)

1. **Remove** the `oh-my-openagent` / legacy `oh-my-opencode` plugin entry from `opencode.json` when you want the **stigmergy-only** path.
2. **Add** `@oh-my-stigmergy/opencode-plugin` per [OpenCode plugins](https://opencode.ai/docs/plugins/) (npm or path to `packages/opencode-plugin`).
3. **Run SBP** (`packages/sbp-server`) and set `SBP_URL` for the plugin (see [opencode-stigmergy-golden-path.md](opencode-stigmergy-golden-path.md)).
4. **Configure orchestration policy** — optional file path in `STIGMERGY_ORCHESTRATION_CONFIG` pointing at JSON matching `orchestration.schema.json` (defaults ship in the plugin for examples only).
5. **Map models** — replace OMO’s in-harness model tables with **OpenCode provider/model ids** in your policy (`stanceModels`, `defaultModel`). Align with your actual OpenCode provider configuration for local vs cloud models.

## Honesty

Multi-session parallelism and automatic model switching depend on the **OpenCode host** and your provider setup. The plugin exposes **policy and ledger tools**; it does not duplicate OMO’s runtime agent roster.

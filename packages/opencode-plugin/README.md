# @oh-my-stigmergy/opencode-plugin

OpenCode plugin that bridges the **cognitive layer** (OpenCode agents) to this repo’s **coordination** and **epistemic** layers: [SBP](../../packages/sbp-server) over HTTP and [graph](../../packages/graph) CLIs via subprocess.

**Maturity:** [Phase 11](../../docs/ROADMAP.md) — **P11-a** lands the npm package scaffold + CI contract; **P11-b** lands `src/`, Zod tools, event hooks, and `npm test`.

## Non-goals

- Not a replacement for [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (Sisyphus / orchestration).
- No automatic `permission.asked` / `tool.execute.before` blocking without a successor to [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md).

## Configuration (P11-b)

- **`SBP_URL`** — base URL for the ledger (default `http://127.0.0.1:3847`). Start SBP separately (`packages/sbp-server`).
- **`STIGMERGY_DEFAULT_STANCE`** — default `stanceTarget` for event-sourced pheromones.

## Install (after P11-b)

Per [OpenCode plugins](https://opencode.ai/docs/plugins/): add `@oh-my-stigmergy/opencode-plugin` to `opencode.json`, or copy/link this package under `.opencode/plugins/`.

See [ADR-0012](../../docs/adr/0012-opencode-plugin-architecture.md) and **FR-5.1–FR-5.3** in [FR.md](../../docs/requirements/FR.md).

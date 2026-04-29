# ADR-0012: OpenCode plugin — cognitive layer bridge to SBP and graph

## Status

Accepted

## Context

The inspiration essay’s TDD ([oh-my-stigmergy_inspiration.md](../../oh-my-stigmergy_inspiration.md) §9.1) places **stance-driven agents** on the **OpenCode framework** while the **coordination layer** is the SBP bus. The repository already ships [`packages/sbp-server`](../../packages/sbp-server/) (HTTP + SSE) and [`packages/graph`](../../packages/graph/) (`load_node`, `graph.aspect`). Until now there was no **installable OpenCode plugin** that wires those artefacts into OpenCode sessions.

Alternatives considered:

1. **Fold into [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)** — rejected: OMO is a hierarchical orchestration product; stigmergy is a **different coordination philosophy** ([ADR-0003](0003-stigmergy-vs-orchestrator.md)); bundling would blur product boundaries and risk subordinating the ledger to Sisyphus-style routing.
2. **Separate repository** — rejected: splits FR/RTM/ADR traceability and prevents a single CI merge gate from attesting the plugin against the same commit as SBP/graph.
3. **MCP-only, no plugin** — rejected: OpenCode’s first-class extension surface for session hooks and custom tools is the **plugin API** ([OpenCode plugins](https://opencode.ai/docs/plugins/)); MCP can be added later without replacing this decision.
4. **In-process SBP inside the plugin (Bun)** — rejected: `better-sqlite3` native bindings and ledger locking semantics belong in the existing Node SBP server ([ADR-0011](0011-sbp-sqlite-store.md)); the plugin talks **HTTP** to a running server.

## Decision

- Ship an **in-tree** npm package at [`packages/opencode-plugin`](../../packages/opencode-plugin/) named **`@oh-my-stigmergy/opencode-plugin`**, loadable from OpenCode’s `plugin` config or copied to `.opencode/plugins/` per upstream docs.
- The plugin is a **bridge**: custom tools + event hooks that **read/write the shared medium** (SBP HTTP API, `uv run` graph CLIs), **not** a replacement for oh-my-openagent’s orchestrators.
- **Transport:** configurable `SBP_URL` (default `http://127.0.0.1:3847` / `http://localhost:3847`), fail-soft when the server is unreachable (log + no session crash).
- **Non-goals:** no `tool.execute.before` / `permission.asked` auto-blocking without a successor to [ADR-0005](0005-conflict-resolution-governance.md); no Z3/crucible tool inside the plugin (latency + honesty — crucible remains CI per [ADR-0006](0006-p4-crucible-execution.md)).

## Consequences

- New FR epic **FR-5.x** (cognitive layer integration) and RTM verification rows.
- CI gains `scripts/verify-opencode-plugin-contract.sh` and `npm test` under `packages/opencode-plugin` once implementation lands.
- Maintainers may publish the package to npm under the `@oh-my-stigmergy` scope when ready; versioning is independent of the monorepo’s other packages.

## Verification

- `bash scripts/verify-opencode-plugin-contract.sh` on every `allium-specs` governance job (manifest + `src/**` + `StigmergyPlugin` export smoke).
- `cd packages/opencode-plugin && npm ci && npm test` in `allium-specs` **specs-and-packages** (`plugin.test.mjs`, `events.test.mjs`, `tools-schema.test.mjs`).
- Crucible goldens `tests/fixtures/crucible/opencode_plugin*.model.json` exercise governance-aligned model slices (`verify-crucible-compile.sh`, `verify-smt-golden.sh`).

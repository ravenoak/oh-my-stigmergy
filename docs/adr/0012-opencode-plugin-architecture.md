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

**Sibling-process supervision:** spawning **`node …/server.mjs`** for **`@oh-my-stigmergy/sbp-server`** when **`SBP_URL`** is unset is **not** the same as in-process Bun; see [ADR-0014](0014-sbp-project-supervision.md).

## Decision

- Ship an **in-tree** npm package at [`packages/opencode-plugin`](../../packages/opencode-plugin/) named **`@oh-my-stigmergy/opencode-plugin`**, loadable from OpenCode’s `plugin` config or copied to `.opencode/plugins/` per upstream docs.
- The plugin is the **primary cognitive bridge** for this repository: custom tools + event hooks that **read/write the shared medium** (SBP HTTP API, `uv run` graph CLIs). **Stigmergic orchestration** (actionable queue helpers, stance→model policy) is **in scope** per [ADR-0013](0013-stigmergic-opencode-orchestration.md). We do **not** bundle [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent); operators choose OpenCode + this plugin + SBP without a separate harness for the **recommended** path.
- **Transport:** configurable `SBP_URL`; when unset, **project-local supervision** attaches or spawns **`@oh-my-stigmergy/sbp-server`** per [ADR-0014](0014-sbp-project-supervision.md); when unset and supervision is disabled (`STIGMERGY_SUPERVISE=0`), legacy default `http://127.0.0.1:3847`. Fail-soft when the server is unreachable (log + no session crash).
- **Non-goals:** no `tool.execute.before` / `permission.asked` auto-blocking without a successor to [ADR-0005](0005-conflict-resolution-governance.md); no Z3/crucible tool inside the plugin (latency + honesty — crucible remains CI per [ADR-0006](0006-p4-crucible-execution.md)); no vendoring of oh-my-openagent source.

## Consequences

- New FR epic **FR-5.x** (cognitive layer integration) and RTM verification rows.
- CI gains `scripts/verify-opencode-plugin-contract.sh` and `npm test` under `packages/opencode-plugin` once implementation lands.
- **Publish (npm):** `@oh-my-stigmergy/opencode-plugin` is **`private: false`** when published; **semver** is independent of other monorepo packages (tag releases `opencode-plugin-v*` optional). **LICENSE** at repo root matches **`license`** in `package.json` (MIT). [`scripts/verify-opencode-plugin-contract.sh`](../../scripts/verify-opencode-plugin-contract.sh) requires **`npm pack`** smoke (tarball contains entry export). **Peer expectation:** OpenCode plugin API per `@opencode-ai/plugin` pin in `package-lock.json`; consumers follow [OpenCode plugins](https://opencode.ai/docs/plugins/) install rules.

## Verification

- `bash scripts/verify-opencode-plugin-contract.sh` on every `allium-specs` governance job (manifest + `src/**` + `bin/metrics.mjs` + `StigmergyPlugin` export smoke).
- `cd packages/opencode-plugin && npm ci && npm test` in `allium-specs` **specs-and-packages** (`plugin.test.mjs`, `events.test.mjs`, `tools-schema.test.mjs`, `metrics.test.mjs`).
- **Operational signal:** optional append-only NDJSON audit log via `STIGMERGY_AUDIT_LOG_FILE` (`src/auditLog.mjs`); offline summary via `npm run metrics -- <file>` — same honesty boundary as SBP: host `client.app.log` remains best-effort; audit file is explicit and machine-summarizable.
- Crucible goldens `tests/fixtures/crucible/opencode_plugin*.model.json` exercise governance-aligned model slices (`verify-crucible-compile.sh`, `verify-smt-golden.sh`).
- **Phase 12 (adoption):** `bash scripts/verify-opencode-golden-path.sh` — golden-path guide exists and root docs link to it ([FR-5.4](../../requirements/FR.md)).

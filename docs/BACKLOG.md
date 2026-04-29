# Backlog

Items here are **not** execution-ready: they lack one or more of promotion ID, phase, FR/NFR targets, RTM verification language, or an ADR for architectural forks.

**Full ordered program** (phases, sequencing stances, exit criteria): [ROADMAP.md](ROADMAP.md).  
**Deferred epics** already captured as requirements: see [PRD.md](PRD.md) “Deferred program of record” and [traceability/RTM.md](traceability/RTM.md) `planned` rows.

## Promotion gate (mandatory)

Before moving a row into an FR/NFR/RTM change set:

1. **Problem** — one paragraph, falsifiable symptom or missing capability.  
2. **Phase** — P0–P4 consistent with [README.md](README.md).  
3. **IDs** — existing FR/NFR row updated, or new ID minted with PRD/RTM co-touch.  
4. **Verification** — deterministic script name, test suite, or operational procedure cited in RTM.  
5. **ADR** — required when the decision conflicts with an accepted ADR or picks a new runtime (graph engine, ledger store, solver, shims).

## Parked epics (reference design only)

Execution order follows [ROADMAP.md](ROADMAP.md). Reference slices for FR-2.x / FR-3.x / partial P4 are **in tree**; rows below are **next-scale** work, not duplicate FR IDs.

| Item | Phase | Dependency | Next unblocker |
|------|-------|------------|----------------|
| Graph — deeper grammars / NetworkX (beyond Python+TS+shell **CALLS** slice) | P2+ | [ADR-0002](adr/0002-relation-first-retrieval.md) revision | **Not pursued in Phase 10** (2026-04-28): current CI + `NFR-P1` budget targets the shipped Python/TS/shell slice; expanding languages or NetworkX needs a scoped ADR + RTM verification before implementation ([ROADMAP.md](ROADMAP.md) Phase 10). |
| SBP — Redis persistence + sub-ms SLO | — | **Not pursued** | Default scale path is **SQLite** + `better-sqlite3` per [ADR-0011](adr/0011-sbp-sqlite-store.md); avoids external service in the default path (`NFR-D2`). |
| Crucible — integer ranges / collection cardinality (Phase 6+ invariant subset) | P4 | **Closed (2026-04-28)** | Shipped as [ROADMAP.md](ROADMAP.md) Phase 9: [ADR-0006](adr/0006-p4-crucible-execution.md) decision (5); fixtures `int_ranges*`, `collections*` under `tests/fixtures/crucible/`; FR-4.2/4.3 + RTM updated. **Not pursued:** per-element list reasoning (ADR-0006). |
| Essay-scale ContextCov / Hashline AST parity inside agents | — | **Not pursued** | Outside Phase 7 honesty scope; would require new FR rows + ADR-0004 maturity discipline beyond maintainer shim ([ADR-0004](adr/0004-verification-stack-layering.md)) |
| FR-4.1 — org-wide PATH / OPA parity | — | **Not pursued** | Would invent org-wide enforcement semantics and drift from [ADR-0004](adr/0004-verification-stack-layering.md) / fork-friendly model; use maintainer shim + [`verify-shim-policy-diff.sh`](../scripts/verify-shim-policy-diff.sh) instead ([ADR-0006](adr/0006-p4-crucible-execution.md)). |
| OpenCode / IDE bridge — MCP or plugin that publishes SBP pheromones and pulls graph/`load_node` context into agent sessions | P3+ | [ADR-0012](adr/0012-opencode-plugin-architecture.md); FR-5.1–FR-5.3 | **Closed (promoted to Phase 11):** in-tree [`packages/opencode-plugin`](../../packages/opencode-plugin/) + HTTP SBP + graph CLI per ADR-0012; BACKLOG row superseded by [ROADMAP.md](ROADMAP.md) Phase 11. **Not pursued here:** separate MCP server (future ADR if needed). |

## oh-my-openagent (OMO) feature parity (explicit gaps)

Not shipped in Phase 14; promote rows individually with FR IDs + verification.

| Item | Phase | Target FR | Next unblocker |
|------|-------|-----------|----------------|
| Sisyphus-style named sub-agent roster inside OpenCode | P3+ | TBD | Requires OpenCode multi-session API guarantees + ADR; not a mega-prompt in-tree ([ADR-0003](adr/0003-stigmergy-vs-orchestrator.md)). |
| `ultrawork` / branded one-shot multi-agent flows | — | — | Product UX outside stigmergy medium; **won’t fix** unless chartered separately. |
| Curated MCP bundle parity (Exa, Context7, etc.) | P3+ | TBD | Optional MCP ADR; separate from [`packages/opencode-plugin`](../../packages/opencode-plugin). |
| Claude Code compatibility shim layer | — | — | Upstream OMO scope; **not pursued** in-repo ([ADR-0013](adr/0013-stigmergic-opencode-orchestration.md)). |

## Ad hoc ideas

Add new rows below with the same columns when brainstorming; **do not** implement from this section without promotion.

| Item | Phase | Dependency | Next unblocker |
|------|-------|------------|----------------|
| — | — | — | — |

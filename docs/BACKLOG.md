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
| Graph — deeper grammars / NetworkX (beyond Python+TS+shell **CALLS** slice) | P2+ | [ADR-0002](adr/0002-relation-first-retrieval.md) revision | New ADR if expanding languages or global resolution |
| SBP — Redis persistence + sub-ms SLO | — | **Not pursued** | Default scale path is **SQLite** + `better-sqlite3` per [ADR-0011](adr/0011-sbp-sqlite-store.md); avoids external service in the default path (`NFR-D2`). |
| Crucible — integer ranges / collection encoders (beyond Phase 6 invariant subset) | P4 | **Promoted to [ROADMAP.md](ROADMAP.md) Phase 9** | Implementation opens only after ADR-0006 amendment + FR-4.2/4.3 RTM verification language; targets [`packages/crucible`](../../packages/crucible/) + new `tests/fixtures/crucible/` goldens |
| Essay-scale ContextCov / Hashline AST parity inside agents | — | **Not pursued** | Outside Phase 7 honesty scope; would require new FR rows + ADR-0004 maturity discipline beyond maintainer shim ([ADR-0004](adr/0004-verification-stack-layering.md)) |
| FR-4.1 — org-wide PATH / OPA parity | — | **Not pursued** | Would invent org-wide enforcement semantics and drift from [ADR-0004](adr/0004-verification-stack-layering.md) / fork-friendly model; use maintainer shim + [`verify-shim-policy-diff.sh`](../scripts/verify-shim-policy-diff.sh) instead ([ADR-0006](adr/0006-p4-crucible-execution.md)). |

## Ad hoc ideas

Add new rows below with the same columns when brainstorming; **do not** implement from this section without promotion.

| Item | Phase | Dependency | Next unblocker |
|------|-------|------------|----------------|
| — | — | — | — |

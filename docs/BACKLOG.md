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
| Graph — SQLite + Tree-sitter multi-language cards | P2+ | [ADR-0002](adr/0002-relation-first-retrieval.md) revision | ADR amendment + ingestion pipeline PR |
| SBP — Redis persistence + sub-ms SLO | P3+ | Production hardening ADR | Load tests + operator runbook |
| Crucible — extend Allium→SMT compiler beyond transition graphs | P4 | [ADR-0006](adr/0006-p4-crucible-execution.md) | Additional AST/model encoders + goldens as features grow |
| FR-4.1 — org-wide PATH / OPA parity | P4 | Policy review + NFR-S1 | Beyond maintainer prototype shim |

## Ad hoc ideas

Add new rows below with the same columns when brainstorming; **do not** implement from this section without promotion.

| Item | Phase | Dependency | Next unblocker |
|------|-------|------------|----------------|
| — | — | — | — |

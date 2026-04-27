# Product requirements document

**Name:** Sublate Plurality SDLC (reference design)  
**Source essay:** [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md) sections 8–9, expanded into [FR.md](requirements/FR.md) and [NFR.md](requirements/NFR.md).  
**Status:** Living document. Requirements carry their own **phase** and **maturity** in the requirements tables.

## Problem statement

Autonomous agents default to **pattern-matching the as-built** and to **self-referential completion** as context grows. Vector retrieval can flood context with plausible-but-wrong neighbourhoods. Purely hierarchical orchestration can produce **token furnaces** and **meaning drift**. The project needs durable **behavioural intent**, **relation-grounded navigation**, **stigmergic coordination**, and **deterministic verification**—implemented incrementally with honest maturity labels.

## Vision

A decentralized, verification-aware software development environment where multi-agent work coordinates through **environmental signals** where appropriate, and where mutations are checked against **formalized intent**—first via Allium and its tooling, later via additional mechanical gates **only when implemented**.

## Scope

### In scope (evolving)

- Maintaining Allium specs under `spec/` with CLI validation.
- Documentation and traceability (PRD, TDD, FR/NFR, RTM, ADRs).
- Skills and IDE rules that route agents to specs without duplicating large prompts.

### Three architectural pillars (reference)

1. **Intent formalization** — Allium-centric elicitation, distillation, propagation, tending, weeding (via JUXT skills + CLI).
2. **Stigmergic Blackboard Protocol (SBP)** — shared ledger and digital pheromones for indirect coordination.
3. **Sublation / verification bridge** — deterministic checks beyond raw LLM judgment; **Z3/OPA/shims are roadmap unless ADR says otherwise.**

### Out of scope (for this repository’s current maturity)

- Claiming production-grade Z3 or ContextCov enforcement without code and RTM proof.
- Mandating a specific commercial orchestrator or model vendor.

## Actors

| Actor | Role |
|-------|------|
| **Human architect** | Owns boundaries, reviews spec contradictions and unsat-style rejections when those tools exist. |
| **Stance-driven agents** | Consume environmental signals; propose changes under budgets and policies. |
| **Sublation / verification layer** | Deterministic tooling; **today** centred on Allium CLI; future layers per ADR-0004. |

## Phased roadmap

| Phase | Goal | Success signal (examples) |
|-------|------|---------------------------|
| **P0** | Governance and specs in-repo | `allium check` clean on `spec/`; FR/NFR/RTM coherent; CI workflow `allium-specs` exercises the same gate on push/PR ([FR-0.2](requirements/FR.md)) |
| **P1** | Intent workflows operational | Teams use `/allium:*` skills; distill vs elicit gaps triaged |
| **P2** | Relation-first navigation | Graph or card index; `load_node`-style retrieval for agents **if implemented** |
| **P3** | SBP runtime | Ledger + pheromone schema deployed; decay and idempotency tested |
| **P4** | Extended crucible | Deterministic translation to SMT or OPA-backed gates **only with ADR + code** |

## References

Canonical requirement IDs: [requirements/FR.md](requirements/FR.md), [requirements/NFR.md](requirements/NFR.md).  
Trace matrix: [traceability/RTM.md](traceability/RTM.md).

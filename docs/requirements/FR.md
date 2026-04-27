# Functional requirements

**Convention:** IDs are stable. **Phase:** P0–P4 (see [docs/README.md](../README.md)). **Maturity:** `implemented` | `partial` | `planned`.

## Epic 1 — Elicitation and intent formalization (Allium)

| ID | Requirement | Phase | Maturity | Spec anchor | Notes |
|----|-------------|-------|----------|-------------|-------|
| FR-1.1 | The platform shall support bidirectional specification work in Allium (author, parse, evolve). | P1 | partial | [`spec/project.allium`](../../spec/project.allium) | JUXT skills + `allium check`; “bidirectional sync” full automation is roadmap. |
| FR-1.2 | Provide distillation path: draft specs from code structure, surfacing gaps to the human architect. | P1 | partial | — | Use `/allium:distill` per [juxt/allium](https://github.com/juxt/allium). |
| FR-1.3 | State-dependent fields and transition graphs constrain allowed state changes; violations are treated as critical at maturity. | P2 | planned | — | Requires mapping spec transitions to implementation checks. |

## Epic 2 — Topological navigation (relation-first graphs)

| ID | Requirement | Phase | Maturity | Spec anchor | Notes |
|----|-------------|-------|----------|-------------|-------|
| FR-2.1 | Ingestion chunks the repository into byte-addressed **code cards** (`char_start`/`char_end`). | P2 | planned | — | Inspired by Hound-style designs; not implemented in-repo. |
| FR-2.2 | Background or batch process maintains **aspect graphs** (e.g. auth, monetary, architecture views). | P2 | planned | — | |
| FR-2.3 | Agents can call `load_node(id)` (or equivalent) returning only incident slices, not embedding noise. | P2 | planned | — | |

## Epic 3 — Stigmergic blackboard coordination (SBP)

| ID | Requirement | Phase | Maturity | Spec anchor | Notes |
|----|-------------|-------|----------|-------------|-------|
| FR-3.1 | Central semantic ledger with atomic updates and streaming (e.g. SSE) for observers. | P3 | planned | — | Essay targets sub-ms; real SLO TBD when built. |
| FR-3.2 | Tasks and states are **digital pheromones** with UUID, stance target, intensity, decay. | P3 | planned | — | |
| FR-3.3 | UUID idempotency to prevent duplicate execution (“first claim wins”). | P3 | planned | — | |
| FR-3.4 | Pheromone floor / inflation prevents critical work from starving. | P3 | planned | — | |

## Epic 4 — Sublation crucible (verification beyond LLM)

| ID | Requirement | Phase | Maturity | Spec anchor | Notes |
|----|-------------|-------|----------|-------------|-------|
| FR-4.1 | Intercept agent shell commands (e.g. PATH shims) and evaluate against policy; block disallowed commands. | P4 | planned | — | ContextCov-class; not implemented here. |
| FR-4.2 | Deterministic compilation of `.allium` to SMT-LIB (no LLM in translation). | P4 | planned | — | **Not claimed** until shipped; contradicts live allium-tools feature set until proven. |
| FR-4.3 | Integrations must pass satisfiability checking; unsat cores become explainable traces. | P4 | planned | — | Depends on FR-4.2 and code fact extraction. |

## P0 repository governance (derived)

| ID | Requirement | Phase | Maturity | Spec anchor | Notes |
|----|-------------|-------|----------|-------------|-------|
| FR-0.1 | Behavioural changes to declared scope update Allium specs and RTM per [CONSTITUTION.md](../CONSTITUTION.md). | P0 | partial | [`spec/project.allium`](../../spec/project.allium) | Human + agent discipline. |
| FR-0.2 | Specification files validate with `allium check` before merge when CI exists. | P0 | partial | `spec/**/*.allium` | [`.github/workflows/allium-specs.yml`](../../.github/workflows/allium-specs.yml) runs `allium check spec/` on push/PR; `allium-cli` is pinned in the workflow. Require the check in branch protection for strict merge enforcement. |

See [traceability/RTM.md](../traceability/RTM.md) for verification mapping.

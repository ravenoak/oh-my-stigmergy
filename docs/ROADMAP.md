# Implementation roadmap — inspiration to evidence

This document is the **ordered program of record** for closing the gap between [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md) (essay PRD/TDD in sections **8–9**) and this repository’s **normative** [PRD.md](PRD.md), [TDD.md](TDD.md), [requirements/FR.md](requirements/FR.md), [requirements/NFR.md](requirements/NFR.md), and [traceability/RTM.md](traceability/RTM.md).

**Non-negotiable:** No requirement is marked `implemented` until [NFR-D1](requirements/NFR.md) is satisfied (RTM cites real verification). Claims about Z3, OPA, PATH shims, or Allium→SMT follow [ADR-0004](adr/0004-verification-stack-layering.md) and [CONSTITUTION.md](CONSTITUTION.md).

## North star

The essay’s target system has **four layers** (cognitive agents, SBP coordination, Hound-style graphs, sublation crucible). This repo reaches **alignment** when every FR and NFR row is `implemented` with evidence in the RTM, and the TDD marks those components **concrete** rather than conceptual—**without** relaxing honesty rules about what runs in CI today.

## Inspiration → requirements map

| Essay pillar (§8–9) | FR epic | NFR touchpoints | Current gap (summary) |
|---------------------|---------|-----------------|------------------------|
| Intent elicitation / Allium | FR-1.x | NFR-O1, NFR-C1 | FR-1.2 implemented; FR-1.3 implemented via `allium model` + `packages/transitions` |
| Hound relation-first navigation | FR-2.x | NFR-C1 | Reference graph + SQLite; Python + TypeScript + shell ingestion + optional Tree-sitter symbol/method/decorator cards; **CALLS** edges + `load_node` BFS (see ADR-0002 / ADR-0007) |
| SBP blackboard | FR-3.x | NFR-O2 | Reference ledger + SSE; JSONL [ADR-0008](adr/0008-sbp-persistence.md); SQLite [ADR-0011](adr/0011-sbp-sqlite-store.md); compaction + decay GC [ADR-0009](adr/0009-sbp-ledger-compaction-decay-gc.md); healthz + writer lock + size signal; decay + load + NDJSON log contracts ([`docs/operations/sbp-slo.md`](operations/sbp-slo.md)); **Redis not pursued** (see [BACKLOG.md](BACKLOG.md)) |
| Sublation crucible (ContextCov, SMT, Z3) | FR-4.x | NFR-S1, NFR-D2 | FR-4.2–4.3 + attested shim (args regex + audit + policy-diff co-touch); org-wide PATH/OPA **not pursued** ([BACKLOG.md](BACKLOG.md), [ADR-0004](adr/0004-verification-stack-layering.md)); ContextCov parity still out of scope per ADR-0004 |

Sections **1–7** of the essay supply **motivation and critique** (ToCS, ContextCov, OMO, liquid delegation). They inform ADRs and guides but are not duplicated as extra FR rows here.

## Chosen sequencing (rejected alternatives noted)

1. **Close P0 before scaling intent automation**  
   **Stance:** FR-0.1 must reach `implemented` before any P2+ runtime work is treated as production-ready for this org.  
   **Rejected:** Treating “docs-only” governance as sufficient while building graph or SBP services.

2. **P1 complete (FR-1.2 + supporting discipline) before graph ingestion**  
   **Stance:** Distillation and spec hygiene must be **operationally boring**—repeatable outputs, triage queues, and RTM-backed verification—so agents are not debugging spec drift while standing up Tree-sitter cards.  
   **Rejected:** Starting FR-2.1 ingestion while FR-1.2 remains a loose skill-only workflow without repo-local verification hooks.

3. **P2 (FR-2.x) before P3 (FR-3.x)**  
   **Stance:** Pheromone payloads in the essay reference `graph_node_id`; a minimal **byte-card index + incident-slice retrieval** ([ADR-0002](adr/0002-relation-first-retrieval.md)) lands before the SBP server.  
   **Rejected:** Building a Redis/SSE ledger first with stringly node references and no canonical graph.

4. **P4 verification: translation before solver, solver before shell**  
   **Stance:** Ship **FR-4.2** (deterministic Allium→SMT subset + golden tests) **before** **FR-4.3** (Z3 in CI), and add **FR-4.1** (ContextCov-class interception) only when policy packs and rollback are documented—**not** “PATH shim first.”  
   **Rejected:** PATH injection as the first P4 slice (high blast radius; hard to audit in forks).

5. **Liquid delegation / power-sensitive coordination**  
   **Stance:** Any SBP feature that resembles **IntentGate** or liquid-delegation economics must go through [ADR-0005](adr/0005-conflict-resolution-governance.md) (or a successor ADR) **before** code merges; no silent adoption of delegation graphs.

## Phased milestones (exit criteria)

Each phase **ends** only when listed criteria are met and RTM rows are updated with verification strings.

### Phase 0 — Governance and specs (complete the foundation)

| Milestone | Exit criteria |
|-----------|----------------|
| P0-a | FR-0.2 mechanical + organizational evidence: `allium-specs` green; maintainer record in [operations/github-branch-protection.md](operations/github-branch-protection.md); **required status `allium-specs / check` enforced on `main`** recorded in the enablement table (2026-04-27). **API proof:** [`scripts/verify-branch-protection-remote.sh`](../../scripts/verify-branch-protection-remote.sh) supports **classic** branch protection **and** repository **rulesets** (required contexts + merge-method sanity); paste [`scripts/print-branch-protection-summary.sh`](../../scripts/print-branch-protection-summary.sh) output into the enablement table when auditing. |
| P0-b | FR-0.1 → `implemented`: constitution scope changes reflected in `spec/` **and** RTM in the same change sets; expand deterministic governance checks beyond PR-only co-touch where gaps remain (each addition gets an RTM line) |

### Phase 1 — Intent workflows (essay Epic 1)

| Milestone | Exit criteria |
|-----------|----------------|
| P1-a | FR-1.2 → `implemented`: distillation outputs are **defined artefacts** (e.g. reported paths or checklists) with a **script or CI job** that fails when required artefacts are missing after a labelled change; playbook stays canonical |
| P1-b | FR-1.1 stays `implemented`; governance + project Allium modules grow only with clean `allium check` / `allium analyse` |
| P1-c | FR-1.3 → `implemented`: `allium model` JSON + [`packages/transitions`](../../packages/transitions/) harness documented in [TDD.md](TDD.md) §FR-1.3 |

### Phase 2 — Relation-first navigation (essay Epic 2 + §9.3.1)

| Milestone | Exit criteria |
|-----------|----------------|
| P2-ADR | [ADR-0007](adr/0007-graph-persistence.md) records SQLite + **Python / TypeScript / shell** ingestion and CI **`uv sync`** for the Python workspace (`tree-sitter` / `tree-sitter-python`); ADR-0002 revision remains optional for NetworkX / retrieval depth |
| P2-core | FR-2.1: byte-accurate code cards stored and indexed |
| P2-graph | FR-2.2: at least one aspect graph pipeline with tests |
| P2-tool | FR-2.3: `load_node` (or renamed equivalent) contract tests per ADR-0002 verification clause |

### Phase 3 — SBP runtime (essay Epic 3 + §9.2.2)

| Milestone | Exit criteria |
|-----------|----------------|
| P3-schema | Versioned JSON Schema (in-repo) for pheromone records aligned with FR-3.2; stance config schema for essay §9.2.1 (documented in TDD) |
| P3-ledger | FR-3.1: atomic publish API + observer stream (SSE or replacement); **durable JSONL** replay per [ADR-0008](adr/0008-sbp-persistence.md); optional **SQLite** per [ADR-0011](adr/0011-sbp-sqlite-store.md); load tests documented in [sbp-slo.md](operations/sbp-slo.md) |
| P3-pheromone | FR-3.2–FR-3.4: exponential decay + inflations, idempotency, floor, load p95, NDJSON log contract — see [`docs/operations/sbp-slo.md`](operations/sbp-slo.md) |

### Phase 4 — Sublation crucible (essay Epic 4 + §9.3.2)

| Milestone | Exit criteria |
|-----------|----------------|
| P4-ADR | Child ADR(s) under ADR-0004: SMT subset scope, Z3 packaging, OPA/policy surfaces, and a **maintainer-only, explicitly documented** dev-shim install path (never implied as default CI enforcement) |
| P4-translate | FR-4.2 → `implemented`: [`packages/crucible`](../../packages/crucible/) + [`scripts/verify-crucible-compile.sh`](../../scripts/verify-crucible-compile.sh) golden `diff`; no LLM in translation path |
| P4-solve | FR-4.3 → `implemented`: `crucible.cli solve spec/` + named assertions + `explain_core` (see TDD / RTM) |
| P4-shim | FR-4.1 + NFR-S1 → `implemented`: deny-by-default attested policy + contract tests (see RTM) |

### Phase 5 — Depth and operability closeout (P2–P4 hardening)

Four milestones shipped as **sequenced PRs** (verification core → graph → SBP ops → shim stance). Exit: RTM / `ci_contract` cite the new gates; no new `implemented` claims without tests ([NFR-D1](requirements/NFR.md)).

| Milestone | Exit criteria |
|-----------|----------------|
| P5-a — Crucible depth | **FR-4.2 / FR-4.3:** enum + `required`/bool encoders beyond transition graphs; goldens under `tests/fixtures/crucible/`; `verify-crucible-compile.sh` loops all `*.allium` (excluding `minimal.allium` hand pair) + `*.model.json`; ADR-0006 lists constructs; crucible unittests + Z3 goldens green. |
| P5-b — Graph depth | **FR-2.1–FR-2.3:** TypeScript symbol cards (`tree-sitter-typescript`) + `load_node --depth` (BFS `IMPORTS`/`SOURCES`); ADR-0002 + ADR-0007 aligned; graph unittests + `uv.lock` pin. |
| P5-c — SBP operability | **FR-3.1 / FR-3.2 / NFR-O2:** [ADR-0009](adr/0009-sbp-ledger-compaction-decay-gc.md) — `compactJsonlLedger`, CLI `bin/compact.mjs`, opt-in `SBP_DECAY_GC_INTERVAL_MS`, operator [runbook](operations/sbp-operator-runbook.md); no Redis; compaction + decay-GC tests in `npm test`. |
| P5-d — Shim depth + OPA stance | **FR-4.1 / NFR-S1:** optional `args_regex` per allow row; `CRUCIBLE_SHIM_AUDIT_LOG` NDJSON on deny; `verify-shim-policy-diff.sh` (policy ↔ README PR co-touch); BACKLOG row org-wide PATH/OPA **not pursued** with ADR-0004 rationale; ADR-0006 updated. |

**Phase 5 program exit:** all four rows above landed with green `allium-specs`; [BACKLOG.md](BACKLOG.md) mapping updated; this section stays canonical for the closeout scope.

### Phase 6 — Full implementation and remediation closeout

Four milestones shipped **sequentially** (Crucible invariants/defaults → stance schema + SBP registry → graph CALLS + symbol subroles → SBP SQLite + ops). **Exit:** RTM / `ci_contract` cite new fixtures, packages, env gates, and tests; [BACKLOG.md](BACKLOG.md) rows closed per plan; no `implemented` claims without evidence ([NFR-D1](requirements/NFR.md)).

| Milestone | Exit criteria |
|-----------|----------------|
| P6-a — Crucible invariants + defaults | **FR-4.2 / FR-4.3:** `defaults` / `invariants` overlay + `QF_UFLIA` goldens (`invariants*.allium` / `invariants_bad.model.json`); ADR-0006 amended; `verify-crucible-compile.sh` + `test_solve.py` unsat on `invariants_bad`. |
| P6-b — Stance schema + registry | **FR-1.4:** `packages/stance` JSON Schema + validator + `load_registry`; `SBP_STANCE_REGISTRY` in SBP; ADR-0010; TDD stance serialisation fixed; `packages/stance/tests` + `stance-registry.test.mjs`. |
| P6-c — Graph CALLS + roles | **FR-2.1–FR-2.3:** `CALLS` edges; roles `method` / `decorator`; `card_id` prefix scheme; `load_node` traverses `CALLS`; SQLite full snapshot persist; ADR-0002 / ADR-0007 amended; `test_calls_edges.py` + corpus fixtures. |
| P6-d — SBP SQLite + ops | **FR-3.1 / FR-3.2 / NFR-O2:** `SqliteLedgerStore` (`better-sqlite3`); mutual exclusive env with JSONL; JSONL writer lock + exit 75; `SBP_LEDGER_MAX_BYTES` rotation hook; `GET /healthz`; `compaction_done` logs; ADR-0011; runbook + SLO; `sqlite-store` / `healthz` / `multi-writer` tests. |

**Phase 6 program exit:** all four rows above **green in CI**; [PRD.md](PRD.md) deferred-program paragraph cites ADR-0010 / ADR-0011 and amended ADRs; Redis backlog row **closed as not pursued** (replaced by ADR-0011).

### Phase 7 — Honesty and governance closeout (spec ↔ runtime alignment)

Single tracked program to eliminate drift between behavioural intent (`spec/governance.allium`), deterministic gates (`scripts/*`), and operational docs after Phase 6 shipped runtime slices (stance registry, SQLite ledger, graph **CALLS**, crucible invariants).

| Milestone | Exit criteria |
|-----------|----------------|
| P7-a — Spec + anchors | [`spec/governance.allium`](../../spec/governance.allium) models **stance**, **ledger store**, **aspect edges**, and **code-card** slices aligned with packages; FR anchors cite `spec/` where behavioural intent applies; [`scripts/verify-fr-spec-anchors.sh`](../../scripts/verify-fr-spec-anchors.sh) + [`devtools/fr-anchor-allow.json`](../../devtools/fr-anchor-allow.json) enforce anchor hygiene; crucible governance fixtures stay golden-clean (`verify-crucible-compile`). |
| P7-b — Conflict governance | [ADR-0005](../adr/0005-conflict-resolution-governance.md) **`Accepted`** — automatic delegation remains **not pursued** until a successor ADR; branch-protection audit documents rulesets-aware verification (Phase 8 makes `BP_ADMIN_TOKEN` **required** on the canonical remote). |
| P7-c — Graph ergonomics + CI hygiene | `graph.aspect` CLI + `load_node --edge-kind`; mint **NFR-P1** (heavy-job budget script + [`devtools/ci-heavy-budget-seconds.txt`](../../devtools/ci-heavy-budget-seconds.txt)) and **NFR-S2** (PR diff secret-pattern gate + [`devtools/secret-allowlist.txt`](../../devtools/secret-allowlist.txt)); amend [ADR-0002](../adr/0002-relation-first-retrieval.md) verification clause. |
| P7-d — Docs + Actions stance | [PRD.md](PRD.md) / [TDD.md](TDD.md) / [BACKLOG.md](BACKLOG.md) honesty pass (no “Redis optional” ambiguity — replaced by SQLite path); [ROADMAP.md](ROADMAP.md) records Phase 7; workflows set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` for Node-on-Actions forward compatibility. |

**Phase 7 program exit:** RTM rows cite new gates; `tests/ci_contract.sh` locks wiring; no new `implemented` claims without verification ([NFR-D1](requirements/NFR.md)).

### Phase 8 — Operational truth and spec coverage closure

Closes residual gaps where CI or specs could stay green while **NFR-P1** / **NFR-S2** / governance intent were only weakly enforced, and extends [`spec/governance.allium`](../../spec/governance.allium) with repository-level slices (`RepositoryGovernance`, `DistillationArtefact`, `ShimAllowEntry`, `WorkflowJob`) so FR-0.1 / FR-0.2 / FR-1.2 / FR-4.1 have explicit Allium anchors.

| Milestone | Exit criteria |
|-----------|----------------|
| P8-a — NFR-P1 operational | Graph unittest step in **`allium-specs`** has **`timeout-minutes`** matching `ceil(devtools/ci-heavy-budget-seconds.txt / 60)`; [`scripts/verify-heavy-budget.sh`](../../scripts/verify-heavy-budget.sh) asserts workflow + pin + ADR alignment. |
| P8-b — No optional skip-paths | [`branch-protection-audit.yml`](../../.github/workflows/branch-protection-audit.yml) runs only on **`ravenoak/oh-my-stigmergy`** and **fails** without `BP_ADMIN_TOKEN`; [`scripts/verify-no-secrets.sh`](../../scripts/verify-no-secrets.sh) **fails loud in CI** when diff refs cannot be resolved. |
| P8-c — Spec coverage | Four new entities + defaults + invariants in `spec/governance.allium`; crucible fixture parity; [`devtools/fr-anchor-allow.json`](../../devtools/fr-anchor-allow.json) allow-list empty; FR/RTM anchors updated; `ci_contract` locks entity + overlay rows. |
| P8-d — Roadmap + Phase 9 charter | This section + Phase 9 below; [BACKLOG.md](BACKLOG.md) crucible row promoted; [PRD.md](PRD.md) cites Phase 8/9; workflow comments set **2026-12-31** review for `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`. |

**Phase 8 program exit:** `allium check spec/` clean; `verify-crucible-compile` + `ci_contract` green; honesty language in RTM for NFR-P1 / NFR-S2 matches runtime behaviour.

### Phase 9 — Crucible expressiveness (**complete**)

**Program:** extend [`packages/crucible`](../../packages/crucible/) with **integer-range** and **collection-cardinality** invariant encoders beyond the Phase 6 subset, with goldens and RTM verification in **`QF_UFLIA`**.

| Milestone | Exit criteria |
|-----------|----------------|
| P9-ADR | [ADR-0006](adr/0006-p4-crucible-execution.md) decision (5) lists constructs, solver expectations, golden policy, and **not pursued** element-level list reasoning. |
| P9-fixtures | `tests/fixtures/crucible/int_ranges{,_bad}.model.json` + `.smt2`, `collections{,_bad}.model.json` + `.smt2`; [`scripts/verify-crucible-compile.sh`](../../scripts/verify-crucible-compile.sh) coverage. |
| P9-tests | [`packages/crucible/tests`](../../packages/crucible/tests) golden + unsat-core tests for the new fixtures. |
| P9-trace | FR-4.2 / FR-4.3 + [RTM.md](traceability/RTM.md) cite the new gates ([NFR-D1](requirements/NFR.md)). |

**Phase 9 program exit (2026-04-28):** `verify-crucible-compile` + `verify-smt-golden` + `packages/crucible` unittests green; element-level collection constraints remain **not pursued** per ADR-0006.

### Phase 10 — Honesty + operational truth (**complete**)

**Program:** close ADR/TDD drift after Phase 9; make **`allium-specs`** job wall-clocks and SHA-pinned actions **merge-gate mechanical**; lift latent tests on shipped SBP / stance / crucible paths; anchor CI timeout intent in [`spec/governance.allium`](../../spec/governance.allium) (`WorkflowJob.ci_job_timeout_profile`) plus a pure JSON crucible witness (`workflow_timeouts*.model.json`); explicitly mark speculative graph scale-ups **not pursued** without a new ADR.

| Milestone | Exit criteria |
|-----------|----------------|
| P10-a — ADR + TDD honesty | [ADR-0003](adr/0003-stigmergy-vs-orchestrator.md) reflects shipped SBP; [docs/adr/README.md](adr/README.md) indexes ADR-0007–0011 with correct statuses; [docs/TDD.md](TDD.md) graph + sublation rows name shipped vs **not pursued** boundaries. |
| P10-b — CI operational truth | Mint **NFR-P2**; [`devtools/ci-job-timeouts.json`](../../devtools/ci-job-timeouts.json) + [`scripts/verify-job-timeouts.sh`](../../scripts/verify-job-timeouts.sh); job-level **`timeout-minutes`** on every `allium-specs` job; [`scripts/verify-actions-pinned.sh`](../../scripts/verify-actions-pinned.sh) runs in **`governance`**; [`tests/ci_contract.sh`](../../tests/ci_contract.sh) locks wiring. |
| P10-c — Test coverage uplift | SBP [`stream.test.mjs`](../../packages/sbp-server/test/stream.test.mjs) + [`rotation.test.mjs`](../../packages/sbp-server/test/rotation.test.mjs); crucible `test_solve.py` **sat** rows for good JSON/enum fixtures; stance CLI subprocess tests; [`packages/transitions/README.md`](../../packages/transitions/README.md). |
| P10-d — Spec + traceability coherence | `WorkflowJob` profile + invariant in [`spec/governance.allium`](../../spec/governance.allium); crucible goldens `workflow_timeouts*`; [RTM.md](traceability/RTM.md) / [FR.md](requirements/FR.md) / [PRD.md](PRD.md) / [BACKLOG.md](BACKLOG.md) updated; graph “deeper grammars / NetworkX” row **not pursued in Phase 10** (ADR-0002 amendment required to reopen). |

**Phase 10 program exit (2026-04-28):** `allium check spec/` clean; `verify-crucible-compile` + `verify-smt-golden` + `ci_contract` + `npm test` (SBP) green; RTM cites NFR-P2 and new behavioural + test artefacts.

## Backlog hygiene

Parked ideas that are **not** yet tied to FR IDs belong in [BACKLOG.md](BACKLOG.md). Promoting an item requires: problem statement, phase label, target FR/NFR IDs, RTM verification language, and an ADR if architecture forks.

## Maintenance

When phases complete, update [PRD.md](PRD.md) success signals, [TDD.md](TDD.md) component status tables, and [traceability/RTM.md](traceability/RTM.md) in the **same change set** as maturity moves (FR/NFR co-touch rules apply).

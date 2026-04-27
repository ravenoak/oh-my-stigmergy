# Implementation roadmap — inspiration to evidence

This document is the **ordered program of record** for closing the gap between [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md) (essay PRD/TDD in sections **8–9**) and this repository’s **normative** [PRD.md](PRD.md), [TDD.md](TDD.md), [requirements/FR.md](requirements/FR.md), [requirements/NFR.md](requirements/NFR.md), and [traceability/RTM.md](traceability/RTM.md).

**Non-negotiable:** No requirement is marked `implemented` until [NFR-D1](requirements/NFR.md) is satisfied (RTM cites real verification). Claims about Z3, OPA, PATH shims, or Allium→SMT follow [ADR-0004](adr/0004-verification-stack-layering.md) and [CONSTITUTION.md](CONSTITUTION.md).

## North star

The essay’s target system has **four layers** (cognitive agents, SBP coordination, Hound-style graphs, sublation crucible). This repo reaches **alignment** when every FR and NFR row is `implemented` with evidence in the RTM, and the TDD marks those components **concrete** rather than conceptual—**without** relaxing honesty rules about what runs in CI today.

## Inspiration → requirements map

| Essay pillar (§8–9) | FR epic | NFR touchpoints | Current gap (summary) |
|---------------------|---------|-----------------|------------------------|
| Intent elicitation / Allium | FR-1.x | NFR-O1, NFR-C1 | FR-1.2 implemented; FR-1.3 implemented via `allium model` + `packages/transitions` |
| Hound relation-first navigation | FR-2.x | NFR-C1 | Reference Python graph + SQLite opt-in shipped; Tree-sitter / multi-language still open |
| SBP blackboard | FR-3.x | NFR-O2 | Reference ledger + SSE shipped; durable JSONL per [ADR-0008](adr/0008-sbp-persistence.md); load tests / Redis scale still open |
| Sublation crucible (ContextCov, SMT, Z3) | FR-4.x | NFR-S1, NFR-D2 | No shim, translator, or solver integration per ADR-0004 |

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
| P0-a | FR-0.2 mechanical + organizational evidence: `allium-specs` green; maintainer record in [operations/github-branch-protection.md](operations/github-branch-protection.md); **required status `allium-specs / check` enforced on `main`** recorded in the enablement table (2026-04-27). **Classic API proof:** when GitHub exposes **classic** branch protection, [`scripts/verify-branch-protection-remote.sh`](../../scripts/verify-branch-protection-remote.sh) exits `0` and summary output is pasted into the same table; **rulesets-only** remotes may return HTTP 404 to the classic GET — extend the script or audit rulesets separately (see enablement row note). |
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
| P2-ADR | Update or supersede [ADR-0002](adr/0002-relation-first-retrieval.md) with chosen storage (SQLite + NetworkX vs alternatives), ingestion language set, and CI resource limits — **SQLite slice:** [ADR-0007](adr/0007-graph-persistence.md) (stdlib `sqlite3`; Tree-sitter deferred) |
| P2-core | FR-2.1: byte-accurate code cards stored and indexed |
| P2-graph | FR-2.2: at least one aspect graph pipeline with tests |
| P2-tool | FR-2.3: `load_node` (or renamed equivalent) contract tests per ADR-0002 verification clause |

### Phase 3 — SBP runtime (essay Epic 3 + §9.2.2)

| Milestone | Exit criteria |
|-----------|----------------|
| P3-schema | Versioned JSON Schema (in-repo) for pheromone records aligned with FR-3.2; stance config schema for essay §9.2.1 (documented in TDD) |
| P3-ledger | FR-3.1: atomic publish API + observer stream (SSE or replacement); **durable JSONL** replay per [ADR-0008](adr/0008-sbp-persistence.md); load tests documented (still open for scale) |
| P3-pheromone | FR-3.2–FR-3.4: decay, idempotency, floor behaviour covered by automated tests; NFR-O2 moves to `implemented` with log contract tests |

### Phase 4 — Sublation crucible (essay Epic 4 + §9.3.2)

| Milestone | Exit criteria |
|-----------|----------------|
| P4-ADR | Child ADR(s) under ADR-0004: SMT subset scope, Z3 packaging, OPA/policy surfaces, and a **maintainer-only, explicitly documented** dev-shim install path (never implied as default CI enforcement) |
| P4-translate | FR-4.2 → `implemented`: [`packages/crucible`](../../packages/crucible/) + [`scripts/verify-crucible-compile.sh`](../../scripts/verify-crucible-compile.sh) golden `diff`; no LLM in translation path |
| P4-solve | FR-4.3 → `implemented`: `crucible.cli solve spec/` + named assertions + `explain_core` (see TDD / RTM) |
| P4-shim | FR-4.1: command interception behind explicit install; NFR-S1 evidence for review gates |

## Backlog hygiene

Parked ideas that are **not** yet tied to FR IDs belong in [BACKLOG.md](BACKLOG.md). Promoting an item requires: problem statement, phase label, target FR/NFR IDs, RTM verification language, and an ADR if architecture forks.

## Maintenance

When phases complete, update [PRD.md](PRD.md) success signals, [TDD.md](TDD.md) component status tables, and [traceability/RTM.md](traceability/RTM.md) in the **same change set** as maturity moves (FR/NFR co-touch rules apply).

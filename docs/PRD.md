# Product requirements document

**Name:** Sublate Plurality SDLC (reference design)  
**Source essay:** [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md) sections 8–9, expanded into [FR.md](requirements/FR.md) and [NFR.md](requirements/NFR.md).  
**Status:** Living document. Requirements carry their own **phase** and **maturity** in the requirements tables.

## Problem statement

Autonomous agents default to **pattern-matching the as-built** and to **self-referential completion** as context grows. Vector retrieval can flood context with plausible-but-wrong neighbourhoods. Purely hierarchical orchestration can produce **token furnaces** and **meaning drift**. The project needs durable **behavioural intent**, **relation-grounded navigation**, **stigmergic coordination**, and **deterministic verification**—implemented incrementally with honest maturity labels.

## Vision

A decentralized, verification-aware software development environment where multi-agent work coordinates through **environmental signals** where appropriate, and where mutations are checked against **formalized intent**—first via Allium and its tooling, later via additional mechanical gates **only when implemented**.

## Scope

### Normativity and inspiration essay

Sections 8–9 of [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md) motivate the design but may assume **Redis**, **PATH shims**, or **full Z3-on-commit** stacks. **Requirements tables and RTM rows override** the essay where they disagree ([ADR-0004](adr/0004-verification-stack-layering.md)). Essay language about “replacing centralized orchestrators” refers to **coordination pattern** (stigmergy vs star topology), not to vendoring third-party harness code.

### In scope (evolving)

- Maintaining Allium specs under `spec/` with CLI validation.
- Documentation and traceability (PRD, TDD, FR/NFR, RTM, ADRs).
- Skills and IDE rules that route agents to specs without duplicating large prompts.
- **Stigmergic coordination as a first-class story** — reference code and docs for indirect coordination via specs, graph artefacts, and SBP ([`packages/sbp-server`](../../packages/sbp-server)).
- **OpenCode extension (FR-5.x, FR-6.x; [ADR-0012](adr/0012-opencode-plugin-architecture.md), [ADR-0013](adr/0013-stigmergic-opencode-orchestration.md))** — in-tree [`packages/opencode-plugin`](../../packages/opencode-plugin/) wiring OpenCode to SBP HTTP and graph CLIs, with **ledger-first orchestration helpers** and stance→model policy—not a dependency on [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent).

### Three architectural pillars (reference)

1. **Intent formalization** — Allium-centric elicitation, distillation, propagation, tending, weeding (via JUXT skills + CLI).
2. **Stigmergic Blackboard Protocol (SBP)** — shared ledger and digital pheromones for indirect coordination.
3. **Sublation / verification bridge** — deterministic checks beyond raw LLM judgment; **Z3/OPA/shims are roadmap unless ADR says otherwise.**

### Out of scope (for this repository’s current maturity)

- Claiming production-grade Z3 or ContextCov enforcement without code and RTM proof.
- Mandating a specific commercial **model** vendor (operators configure providers in OpenCode; the plugin supplies policy hints only).

## Actors

| Actor | Role |
|-------|------|
| **Human architect** | Owns boundaries, reviews spec contradictions and unsat-style rejections when those tools exist. |
| **Stance-driven agents** | Consume environmental signals; propose changes under budgets and policies. |
| **Sublation / verification layer** | Deterministic tooling; **today** centred on Allium CLI; future layers per ADR-0004. |

## Phased roadmap

High-level goals below; **ordered milestones, explicit sequencing stances, and phase exit criteria** live in [ROADMAP.md](ROADMAP.md). That document maps [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md) §8–9 to FR/NFR evidence and resolves fork choices (for example graph-before-SBP, translation-before-solver-before-shell for P4).

| Phase | Goal | Success signal (examples) |
|-------|------|---------------------------|
| **P0** | Governance and specs in-repo | `allium check` and `allium analyse` clean on `spec/`; FR/NFR/RTM ID sets aligned (`scripts/verify-requirement-traceability.sh`); CI workflow `allium-specs` runs those gates on push/PR; default branch protection requires the check ([FR-0.2](requirements/FR.md), [docs/operations/github-branch-protection.md](operations/github-branch-protection.md)); FR-0.1 at `implemented` per [ROADMAP.md](ROADMAP.md) P0-b |
| **P1** | Intent workflows operational | `/allium:*` skills in use; FR-1.2 at `implemented` with repo-cited verification; distill vs elicit gaps triaged with artefacts |
| **P2** | Relation-first navigation | Graph or card index and `load_node`-style retrieval shipped with contract tests ([ADR-0002](adr/0002-relation-first-retrieval.md)) |
| **P3** | SBP runtime | Ledger + versioned pheromone schema; decay and idempotency tested; governance-sensitive features ADR-gated ([ADR-0005](adr/0005-conflict-resolution-governance.md)) |
| **P4** | Extended crucible | FR-4.2 → FR-4.3 → FR-4.1 order per [ROADMAP.md](ROADMAP.md); each layer ADR-documented under [ADR-0004](adr/0004-verification-stack-layering.md) |

## Deferred program of record (P2–P4)

Requirements in [requirements/FR.md](requirements/FR.md) that remain **planned** or **partial** with further work advance **only** along [ROADMAP.md](ROADMAP.md) **Phase 5** through **Phase 17** (and later phases when chartered) when each initiative has a **scoped ADR** (where required) and a **dedicated PR series** with RTM verification. **Phase 6** closes: **crucible** defaults + bounded invariants ([ADR-0006](adr/0006-p4-crucible-execution.md) amendment), **stance** normative config ([ADR-0010](adr/0010-stance-configuration-schema.md)), **graph** `CALLS` + method/decorator roles ([ADR-0002](adr/0002-relation-first-retrieval.md), [ADR-0007](adr/0007-graph-persistence.md) amendments), **SBP** SQLite + operability ([ADR-0011](adr/0011-sbp-sqlite-store.md)) — **Redis not pursued** ([BACKLOG.md](BACKLOG.md)). **Phase 7** closes governance honesty gaps: expanded [`spec/governance.allium`](spec/governance.allium), anchor enforcement, **ADR-0005** acceptance stance, graph CLI ergonomics, CI budget + PR secret-pattern gates (**NFR-P1**, **NFR-S2**), and workflow Node pinning policy. **Phase 8** makes those gates **operational** (graph step `timeout-minutes`, fail-loud secret scan in CI, required `BP_ADMIN_TOKEN` on the canonical remote for branch-protection audit) and completes repository-level Allium slices for FR-0.1 / FR-0.2 / FR-1.2 / FR-4.1. **Phase 9** (crucible expressiveness — **complete**): integer-range and list-**cardinality** invariant encoders in [`packages/crucible`](../../packages/crucible/) per [ROADMAP.md](ROADMAP.md) and [ADR-0006](adr/0006-p4-crucible-execution.md) decision (5). **Phase 10** (honesty + operational truth — **complete**): ADR-0003 + TDD alignment with shipped SBP; **NFR-P2** job-level `timeout-minutes` + [`scripts/verify-job-timeouts.sh`](../../scripts/verify-job-timeouts.sh) + merge-gate [`scripts/verify-actions-pinned.sh`](../../scripts/verify-actions-pinned.sh); SBP SSE + ledger size-rotation tests; `WorkflowJob` CI profile field in `spec/governance.allium` + `workflow_timeouts*` crucible goldens; BACKLOG graph scale-up row **not pursued in Phase 10** without ADR-0002 revision. **Phase 11** (OpenCode plugin — **complete**): BACKLOG “OpenCode / IDE bridge” promoted to in-tree [`packages/opencode-plugin`](../../packages/opencode-plugin/) per [ADR-0012](adr/0012-opencode-plugin-architecture.md) (**Accepted**); FR-5.1–FR-5.3 **`implemented`** with CI evidence ([ROADMAP.md](ROADMAP.md) Phase 11). **Phase 12** (OpenCode adoption readiness — **complete**): operator golden path [guides/opencode-stigmergy-golden-path.md](guides/opencode-stigmergy-golden-path.md), LICENSE + publish policy in ADR-0012, **FR-5.4** documented operator path with deterministic link verification ([ROADMAP.md](ROADMAP.md) Phase 12). **Phase 13** (stigmergic orchestration charter — **complete**): [ADR-0013](adr/0013-stigmergic-opencode-orchestration.md) **Accepted**; oh-my-openagent **not** the recommended operator path; migration guide + doc verification + bootstrap script ([ROADMAP.md](ROADMAP.md)). **Phase 14** (orchestration MVP — **complete**): **FR-6.1** `implemented` — plugin tools `stigmergy_actionable`, `stigmergy_resolve_model`, JSON schema policy, `npm pack` contract; **FR-6.2** migration + root links. **Phase 15** (orchestration operator closeout — **complete**): **FR-6.3** — model routing playbook, OpenCode compatibility matrix (pinned `@opencode-ai/plugin`), npm release runbook, [`scripts/verify-opencode-operator-docs.sh`](../../scripts/verify-opencode-operator-docs.sh); orchestration policy caps (`defaultOlfactoryThreshold`, `defaultActionableLimit`, `maxActionable`); BACKLOG OMO parity rows carry explicit **Disposition** ([ROADMAP.md](ROADMAP.md)). **Phase 16** (positioning, boundaries, SDLC operator closure — **complete**): **FR-6.4** — [guides/project-positioning-and-boundaries.md](guides/project-positioning-and-boundaries.md), [guides/stigmergic-sdlc-workflows.md](guides/stigmergic-sdlc-workflows.md), [inspiration-errata.md](inspiration-errata.md); permanent **no-Redis** stance for SBP reference path ([ADR-0011](adr/0011-sbp-sqlite-store.md) decision 2, [BACKLOG.md](BACKLOG.md)); ADR-0002 graph **promotion criteria**; ADR-0013 **upstream re-evaluation triggers**; [`scripts/verify-project-positioning-doc.sh`](../../scripts/verify-project-positioning-doc.sh) + [`scripts/verify-stigmergic-sdlc-workflows-doc.sh`](../../scripts/verify-stigmergic-sdlc-workflows-doc.sh) in CI ([ROADMAP.md](ROADMAP.md)). **Phase 17** (operator troubleshooting and usability closure — **complete**): **FR-6.5** — [operations/opencode-stigmergy-troubleshooting.md](operations/opencode-stigmergy-troubleshooting.md); [`scripts/verify-opencode-stigmergy-troubleshooting-doc.sh`](../../scripts/verify-opencode-stigmergy-troubleshooting-doc.sh); golden path → troubleshooting link enforced by [`scripts/verify-opencode-golden-path.sh`](../../scripts/verify-opencode-golden-path.sh) ([ROADMAP.md](ROADMAP.md)). **ContextCov / Hashline AST parity and org-wide OPA/PATH remain not pursued** ([BACKLOG.md](BACKLOG.md), [ADR-0004](adr/0004-verification-stack-layering.md)). Phase 5 items for JSONL compaction/decay GC ([ADR-0009](adr/0009-sbp-ledger-compaction-decay-gc.md)) and **shim** policy depth remain as previously documented. **Not** org-wide PATH/OPA enforcement (**not pursued**, [BACKLOG.md](BACKLOG.md), [ADR-0004](adr/0004-verification-stack-layering.md)). Use [BACKLOG.md](BACKLOG.md) to park or promote ideas without silently implying shipped maturity.

## References

Canonical requirement IDs: [requirements/FR.md](requirements/FR.md), [requirements/NFR.md](requirements/NFR.md).  
Trace matrix: [traceability/RTM.md](traceability/RTM.md).

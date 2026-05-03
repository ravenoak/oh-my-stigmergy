# ADR-0015: Empirical OpenCode effectiveness studies — claims boundary

## Status

Accepted

## Context

[FR-7.1](../requirements/FR.md) documents what **CI** can and cannot prove. [Phase 20](../ROADMAP.md) adds **FR-7.2**: a **versioned study protocol** and **deterministic log summarization** for operator-run evaluations on real code. Without a clear boundary, maintainers or users might misread **merge gates** or **structural doc checks** as proof of **productivity**, **safety**, or **coordination quality** in production.

[ADR-0004](0004-verification-stack-layering.md) already limits deterministic verification to **curated** fixtures and **spec-level** tooling. Human or agent **OpenCode** sessions on external repositories are **not** in that set.

## Decision

1. **In scope for the repository (Phase 20):** the **artefacts** in [`docs/research/opencode-effectiveness-study-protocol.md`](../research/opencode-effectiveness-study-protocol.md), [`scripts/verify-opencode-evaluation-protocol.sh`](../../scripts/verify-opencode-evaluation-protocol.sh) (structural checks only), and [`devtools/evaluation/`](../../devtools/evaluation/) (deterministic transforms on **captured** logs). These **do not** run the study or assert outcomes.

2. **Out of scope for CI:** statistical tests on study results, A/B assignment, or “green = effective” — **forbidden** as merge-gate requirements. Pilot and full-study **results** may be committed under `docs/research/results/` as **dated** human-written or script-generated reports; they are **not** NFR-D1 verification of product claims unless separately promoted to explicit FR/RTM language.

3. **Claims discipline:** Public statements (docs, talks, issues) that say the stigmergy stack **improves** time-to-completion, reduces duplicate work, or **proves** coordination benefits must cite **protocol version**, **task bank**, and **reported effect sizes** (or state “not yet measured”). Hand-waving without a **registered** study design violates [CONSTITUTION.md](../CONSTITUTION.md) empirical discipline.

4. **Alignment with ADR-0004:** This ADR does **not** add solver or whole-program proof. It only bounds **empirical** claims about **OpenCode + plugin + SBP** behavior in the field.

## Consequences

- **FR-7.2** RTM row cites the protocol path and verify script; not a guarantee of study success.
- Optional **Condition B2** (orchestration policy A/B) remains a **successor** protocol revision, not required for Phase 20 exit.

## References

- [docs/guides/stigmergy-evaluation-discipline.md](../guides/stigmergy-evaluation-discipline.md)
- [docs/adr/0004-verification-stack-layering.md](0004-verification-stack-layering.md)
- [docs/research/opencode-effectiveness-study-protocol.md](../research/opencode-effectiveness-study-protocol.md)

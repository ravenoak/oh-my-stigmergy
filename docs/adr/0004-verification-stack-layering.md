# ADR-0004: Verification stack layering — what is real today

## Status

Accepted

## Context

The inspiration essay describes Z3 satisfiability gates, OPA-backed shell interception, and Allium→SMT compilation. Confusing aspirational verification with shipped tooling produces **false precision** and unsafe reliance on LLM translations.

## Decision

1. **Deterministic today (this repository):** [allium-tools](https://github.com/juxt/allium-tools) — e.g. `allium check`, `allium analyse`, LSP diagnostics. These validate and analyse **Allium specifications**. They do **not** by themselves constitute a proof that arbitrary application code satisfies a spec until such a bridge exists and is tested.

2. **Deterministic today (this repository; scoped):** This repository also runs solver-oriented checks, but **only for curated, committed fixtures and specs** (not as a proof over arbitrary code):
   - **Allium model → SMT-LIB drift checks against committed goldens** (FR-4.2).
   - **Z3 runs over curated golden SMT fixtures** and **`crucible solve` over `spec/`** (FR-4.3).
   - **A maintainer-scoped Crucible PATH shim policy** (deny-by-default + attested policy) can be present as an additional safety surface (FR-4.1 / NFR-S1), but it is **not** an organization-wide interception layer.

3. **Future / explicit milestones (still not real until shipped):** Any of the following requires a **new ADR**, implementation, and RTM updates before it may be treated as enforced:
   - Organization-wide **PATH interception** and policy enforcement (e.g. OPA-backed shims across developer machines/CI environments), beyond the maintainer-scoped shim in-tree.
   - Any bridge that claims to prove or enforce that arbitrary application code satisfies an Allium spec (beyond fixture-level verification and spec-level solving).

4. **Prohibited narrative:** Agents and contributors must not imply that “OPA blocks bad commands” or that the repo has whole-program proofs/spec-to-code enforcement **unless** those subsystems exist in tree and are listed as `implemented` in [RTM.md](../traceability/RTM.md).

## Consequences

- Documentation and rules use cautious language for P4 items.
- When a solver bridge ships, **golden tests** on fixture `.allium` files are mandatory before maturity moves to `partial` or `implemented`.
- Scoped P4 delivery details: [ADR-0006](0006-p4-crucible-execution.md) (curated SMT, `z3` gate, maintainer-only shim).

## Verification

- **FR-4.2 / FR-4.3:** verified in CI via the `allium-specs` workflow (golden drift checks + Z3 golden runs + solving `spec/`).
- **FR-4.1 / NFR-S1:** verified in CI via shim policy attestation checks.
- **Narrative boundary:** PR review enforces ADR-0004 for any verification claim that goes beyond these scoped checks.

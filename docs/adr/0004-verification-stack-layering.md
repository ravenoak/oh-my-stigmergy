# ADR-0004: Verification stack layering — what is real today

## Status

Accepted

## Context

The inspiration essay describes Z3 satisfiability gates, OPA-backed shell interception, and Allium→SMT compilation. Confusing aspirational verification with shipped tooling produces **false precision** and unsafe reliance on LLM translations.

## Decision

1. **Deterministic today (this repository):** [allium-tools](https://github.com/juxt/allium-tools) — e.g. `allium check`, `allium analyse`, LSP diagnostics. These validate and analyse **Allium specifications**. They do **not** by themselves constitute a proof that arbitrary application code satisfies a spec until such a bridge exists and is tested.

2. **Future / explicit milestones:** Any of the following requires a **new ADR**, implementation, and RTM updates before FR-4.x maturity advances beyond `planned`:
   - Allium AST → **SMT-LIB** translation with **no** LLM in the hot path (FR-4.2).
   - **Z3** (or other SMT) runs tied to commits or CI (FR-4.3).
   - **ContextCov-class** PATH shims and OPA (FR-4.1).

3. **Prohibited narrative:** Agents and contributors must not imply that “Z3 must pass” or “OPA blocks bad commands” for this repo **unless** those subsystems exist in tree and are listed as `implemented` in [RTM.md](../traceability/RTM.md).

## Consequences

- Documentation and rules use cautious language for P4 items.
- When a solver bridge ships, **golden tests** on fixture `.allium` files are mandatory before maturity moves to `partial` or `implemented`.

## Verification

- RTM rows for FR-4.x remain `planned` until code lands.
- PR review enforces ADR-0004 for any verification claim.

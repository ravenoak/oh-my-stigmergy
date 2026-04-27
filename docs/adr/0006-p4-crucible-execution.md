# ADR-0006: P4 crucible — execution scope (child of ADR-0004)

## Status

Accepted

## Context

[ADR-0004](0004-verification-stack-layering.md) forbids claiming Z3, OPA, or shell interception without code and RTM proof. The inspiration essay ([oh-my-stigmergy_inspiration.md](../../oh-my-stigmergy_inspiration.md) §9.3.2) describes a full Sublation pipeline. This ADR scopes **incremental** delivery in this repository.

## Decision

1. **FR-4.2 (partial first):** Maintain **curated** golden pairs under `tests/fixtures/crucible/` (`.allium` narrative + hand-maintained `.smt2`). [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) is the deterministic gate. A future compiler from Allium AST to SMT replaces curation without deleting golden tests immediately (transition plan in PRs).

2. **FR-4.3 (partial):** `z3` on golden `.smt2` in CI. Unsat-core mapping to human-readable traces stays **TDD-documented** until FR-4.2 moves to `implemented` with an automated translator.

3. **FR-4.1 (partial):** [`devtools/crucible-shim/wrap.sh`](../../devtools/crucible-shim/wrap.sh) is a **maintainer-only** PATH prepend wrapper, not installed by default. Policy is JSON deny-list. No claim of ContextCov parity or org-wide PATH enforcement.

4. **No LLM** in any translation or policy evaluation path marked `implemented` in the RTM.

## Consequences

- Maturity upgrades for FR-4.x require updating this ADR when the mechanism changes.
- Forks that skip shim install remain valid; CI does not mutate developer PATH.

## Verification

- [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) and [`tests/crucible_shim_contract.sh`](../../tests/crucible_shim_contract.sh) in [`allium-specs.yml`](../../.github/workflows/allium-specs.yml).

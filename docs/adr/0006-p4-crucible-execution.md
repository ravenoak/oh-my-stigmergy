# ADR-0006: P4 crucible — execution scope (child of ADR-0004)

## Status

Accepted

## Context

[ADR-0004](0004-verification-stack-layering.md) forbids claiming Z3, OPA, or shell interception without code and RTM proof. The inspiration essay ([oh-my-stigmergy_inspiration.md](../../oh-my-stigmergy_inspiration.md) §9.3.2) describes a full Sublation pipeline. This ADR scopes **incremental** delivery in this repository.

## Decision

1. **FR-4.2 (`implemented`):** [`packages/crucible`](../../packages/crucible/) compiles **`allium model` JSON** to deterministic SMT-LIB. [`scripts/verify-crucible-compile.sh`](../../scripts/verify-crucible-compile.sh) enforces byte-stable output against [`tests/fixtures/crucible/transitions.smt2`](../../tests/fixtures/crucible/transitions.smt2). [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) continues to run `z3` on every `*.smt2` under `tests/fixtures/crucible/`. Extend the compiler incrementally for richer Allium constructs; goldens remain regression anchors.

2. **FR-4.3 (partial):** `z3` on golden `.smt2` in CI. Unsat-core mapping to human-readable traces is the next compiler + solver slice (FR-4.3 row).

3. **FR-4.1 (partial):** [`devtools/crucible-shim/wrap.sh`](../../devtools/crucible-shim/wrap.sh) is a **maintainer-only** PATH prepend wrapper, not installed by default. Policy is JSON deny-list. No claim of ContextCov parity or org-wide PATH enforcement.

4. **No LLM** in any translation or policy evaluation path marked `implemented` in the RTM.

## Consequences

- Maturity upgrades for FR-4.x require updating this ADR when the mechanism changes.
- Forks that skip shim install remain valid; CI does not mutate developer PATH.

## Verification

- [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) and [`tests/crucible_shim_contract.sh`](../../tests/crucible_shim_contract.sh) in [`allium-specs.yml`](../../.github/workflows/allium-specs.yml).

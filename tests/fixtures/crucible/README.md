# Crucible golden fixtures (FR-4.2 / FR-4.3)

Deterministic SMT checking with an **Allium model → SMT** compiler in [`packages/crucible`](../../../packages/crucible):

| File | Role |
|------|------|
| [`minimal.allium`](minimal.allium) | Behavioural stub in Allium. |
| [`minimal.smt2`](minimal.smt2) | Hand-maintained SMT-LIB fragment; `scripts/verify-smt-golden.sh` runs `z3` for `sat`. |
| [`transitions.allium`](transitions.allium) | Entity with a small transition graph. |
| [`transitions.smt2`](transitions.smt2) | Golden output of the compiler; `scripts/verify-crucible-compile.sh` `diff`s live output against this file. |

See [ADR-0006](../../../docs/adr/0006-p4-crucible-execution.md).

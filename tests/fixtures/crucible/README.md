# Crucible golden fixtures (FR-4.2 / FR-4.3)

Curated **pairs** for deterministic SMT checking without an Allium AST compiler in the hot path yet:

| File | Role |
|------|------|
| [`minimal.allium`](minimal.allium) | Behavioural stub in Allium (validated by `allium check` when included in `spec/` or copied into spec for experiments). |
| [`minimal.smt2`](minimal.smt2) | Hand-maintained SMT-LIB fragment; `scripts/verify-smt-golden.sh` runs `z3` for `sat`. |

Full Allium→SMT translation remains **partial** per [ADR-0006](../../../docs/adr/0006-p4-crucible-execution.md).

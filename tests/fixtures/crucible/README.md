# Crucible golden fixtures (FR-4.2 / FR-4.3)

Deterministic SMT checking with an **Allium model → SMT** compiler in [`packages/crucible`](../../../packages/crucible):

| File | Role |
|------|------|
| [`minimal.allium`](minimal.allium) | Behavioural stub in Allium. |
| [`minimal.smt2`](minimal.smt2) | Hand-maintained SMT-LIB fragment; `scripts/verify-smt-golden.sh` runs `z3` for `sat`. |
| [`transitions.allium`](transitions.allium) | Entity with a small transition graph. |
| [`transitions.smt2`](transitions.smt2) | Golden output of the compiler; `scripts/verify-crucible-compile.sh` `diff`s live output against this file. |
| [`enums.allium`](enums.allium) | Entity with an **enum-only** field (no `transitions` block). |
| [`enums.smt2`](enums.smt2) | Golden compiler output (`cur_*` defaults to lexicographically smallest enum value). |
| [`required_fields.model.json`](required_fields.model.json) | Hand-authored `allium model` JSON with `required: true` (extends vendor JSON for crucible-only fixtures). |
| [`required_fields.smt2`](required_fields.smt2) | Golden compiler output for required bool + `defined_*` witness. |

`minimal.allium` / `minimal.smt2` remain a **hand-curated** pair for `scripts/verify-smt-golden.sh` only; `verify-crucible-compile.sh` skips `minimal.allium`.

See [ADR-0006](../../../docs/adr/0006-p4-crucible-execution.md).

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
| [`invariants.allium`](invariants.allium) | Governance-sized Allium module for compiler regression (merged with overlay for goldens). |
| [`invariants.overlay.json`](invariants.overlay.json) | Optional **`defaults` / `invariants`** overlay merged before compile (see [`packages/crucible`](../../../packages/crucible/)). |
| [`invariants.smt2`](invariants.smt2) | Golden SMT-LIB (`QF_UFLIA`) after merge. |
| [`invariants_bad.model.json`](invariants_bad.model.json) | Minimal model with contradictory invariant clauses (named compile → **unsat** + core). |
| [`invariants_bad.smt2`](invariants_bad.smt2) | Golden for `invariants_bad.model.json`. |
| [`int_ranges.model.json`](int_ranges.model.json) | `Int` field + `int_range` / `int_gt` invariants (Phase 9; **sat**). |
| [`int_ranges.smt2`](int_ranges.smt2) | Golden compiler output. |
| [`int_ranges_bad.model.json`](int_ranges_bad.model.json) | Contradictory `int_eq` + `int_range` on the same field (**unsat**). |
| [`int_ranges_bad.smt2`](int_ranges_bad.smt2) | Golden for `int_ranges_bad.model.json`. |
| [`collections.model.json`](collections.model.json) | `List[String]` field + `card_in_range` (Phase 9; **sat**). |
| [`collections.smt2`](collections.smt2) | Golden compiler output. |
| [`collections_bad.model.json`](collections_bad.model.json) | Contradictory `card_eq` + `card_in_range` (**unsat**). |
| [`collections_bad.smt2`](collections_bad.smt2) | Golden for `collections_bad.model.json`. |

`minimal.allium` / `minimal.smt2` remain a **hand-curated** pair for `scripts/verify-smt-golden.sh` only; `verify-crucible-compile.sh` skips `minimal.allium`.

See [ADR-0006](../../../docs/adr/0006-p4-crucible-execution.md).

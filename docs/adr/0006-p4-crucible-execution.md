# ADR-0006: P4 crucible — execution scope (child of ADR-0004)

## Status

Accepted

## Context

[ADR-0004](0004-verification-stack-layering.md) forbids claiming Z3, OPA, or shell interception without code and RTM proof. The inspiration essay ([oh-my-stigmergy_inspiration.md](../../oh-my-stigmergy_inspiration.md) §9.3.2) describes a full Sublation pipeline. This ADR scopes **incremental** delivery in this repository.

## Decision

1. **FR-4.2 (`implemented`):** [`packages/crucible`](../../packages/crucible/) compiles **`allium model` JSON** to deterministic SMT-LIB (**QF_UFLIA** — integers used for UTF-8 string-length witnesses on `String` fields). In addition to `transition_graphs`, the supported **deterministic** slices today are: **multi-valued enum fields** without a sibling `transitions` block (declare-sort + distinct + `cur_<Entity>_<field>` defaulting to the lexicographically smallest value unless a **`defaults`** overlay supplies a valid enum literal); **bool** fields (`enum_values: ["bool"]`); **`required: true`** on fields (emits `defined_<Entity>_<field>` witness), including hand-authored fixture JSON under `tests/fixtures/crucible/*.model.json` when the vendor CLI does not emit `required` yet; **`defaults`** blocks merged from optional **`<stem>.overlay.json`** (field-level defaults for transition initial state / enum defaults / string length constants); and a bounded **`invariants`** subset (`len_gt`, `len_eq`, `enum_any_of` per invariant, combined conjunctively in unnamed mode; `:named` per clause in named mode). [`scripts/verify-crucible-compile.sh`](../../scripts/verify-crucible-compile.sh) diffs live compiler output against every `tests/fixtures/crucible/*.allium` golden **except** [`minimal.allium`](../../tests/fixtures/crucible/minimal.allium) (that pair is curated for [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) only) plus every `*.model.json` fixture vs its matching `*.smt2`. [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) continues to run `z3` on every `*.smt2` under `tests/fixtures/crucible/` (expecting **sat** or **unsat** as appropriate). Extend the compiler incrementally for richer Allium constructs; goldens remain regression anchors.

2. **FR-4.3 (`implemented`):** `z3` on golden `.smt2` in CI; `crucible.cli solve spec/` runs the named-assertion compile path and expects **sat** for transition-bearing modules. Unsat-core text + `explain_core` map assertion ids back to entity/field/kind (see [`packages/crucible/src/crucible/solve.py`](../../packages/crucible/src/crucible/solve.py)); **unittest** covers unsat-core extraction for enum-only, required-field, and **invariant** fixtures ([`packages/crucible/tests/test_solve.py`](../../packages/crucible/tests/test_solve.py), [`invariants_bad.model.json`](../../tests/fixtures/crucible/invariants_bad.model.json)).

3. **FR-4.1 (`implemented`):** [`devtools/crucible-shim/wrap.sh`](../../devtools/crucible-shim/wrap.sh) is a **maintainer-only** PATH prepend wrapper, not installed by default. Policy is **deny-by-default** with an explicit `allow` list (optional per-row **`args_regex`**: `re.fullmatch` against the argv tail after `argv_prefix`, space-joined), **SHA-256 attestation** over the policy body ([`policy_gate.py`](../../devtools/crucible-shim/policy_gate.py), [`scripts/verify-shim-policy.sh`](../../scripts/verify-shim-policy.sh)), optional **denied-call NDJSON audit** via **`CRUCIBLE_SHIM_AUDIT_LOG`** (`shim_denied` rows), and PR **`policy.maintainer.json` ↔ README co-touch** via [`scripts/verify-shim-policy-diff.sh`](../../scripts/verify-shim-policy-diff.sh). **Not pursued:** org-wide PATH / OPA parity (see [BACKLOG.md](../BACKLOG.md)); no claim of ContextCov parity or org-wide enforcement.

4. **No LLM** in any translation or policy evaluation path marked `implemented` in the RTM.

## Consequences

- Maturity upgrades for FR-4.x require updating this ADR when the mechanism changes.
- Forks that skip shim install remain valid; CI does not mutate developer PATH.

## Verification

- [`scripts/verify-smt-golden.sh`](../../scripts/verify-smt-golden.sh) and [`tests/crucible_shim_contract.sh`](../../tests/crucible_shim_contract.sh) in [`allium-specs.yml`](../../.github/workflows/allium-specs.yml).

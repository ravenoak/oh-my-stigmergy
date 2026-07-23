# Stage 0 — CI-contract coverage meta-check + orchestrator staging plan (FR-0.2)

**Date:** 2026-07-23
**Scope:** `scripts/verify-ci-contract-coverage.sh`, `devtools/verify-script-waivers.json`, wiring in
`tests/ci_contract.sh` and the `governance` job of `.github/workflows/allium-specs.yml`.

## Rationale

This change adds a **meta-verifier** that checks CI-wiring hygiene for other `scripts/verify-*.sh`
scripts (every verify script must be workflow/`ci_contract.sh`-referenced or explicitly waived). It
does not add new domain behaviour — it is a governance mechanic already covered by the **`WorkflowJob`**
slice in `spec/governance.allium` and **FR-0.2** (extended notes, same PR; no new FR ID minted). No
reverse-distillation slice is required beyond this waiver, per FR-1.2 and the precedent set by prior
CI-wiring waivers in this directory (e.g. Phase 12, Phase 15).

## Follow-up

None. If `verify-ci-contract-coverage.sh` grows domain-specific behaviour beyond CI-wiring hygiene,
extend `spec/governance.allium`'s `WorkflowJob` slice in that change set instead of adding another
waiver.

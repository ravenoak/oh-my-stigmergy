# Distillation contract waiver — Phase 9 + branch-protection cleanup

**Date:** 2026-04-28  
**Scope:** Deleted `.github/workflows/branch-protection-evidence.yml` and `scripts/verify-branch-protection-evidence-fresh.sh`; simplified `.github/workflows/branch-protection-audit.yml` (read-only audit, no PR bot); updated `docs/operations/github-branch-protection.md`.

## Rationale

CI orchestration and maintainer audit wiring only; no new Allium behavioural obligations in `spec/`. Crucible Phase 9 fixtures (`tests/fixtures/crucible/*.model.json`, `*.smt2`) and traceability edits are covered by FR/RTM co-touch in the same change set.

## Expiry

Revoke when `devtools/distillation-contract.json` no longer watches `.github/workflows/` for these edits or when this waiver is superseded by a narrower scope document.

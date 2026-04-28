# Distillation contract waiver — Phase 7 governance closeout

**Date:** 2026-04-28  
**Scope:** `.github/workflows/*.yml` (Node-on-Actions policy env + governance script wiring only).

## Rationale

These edits adjust CI orchestration and deterministic gates; they do **not** change normative Allium behavioural modules beyond what is already captured in `spec/governance.allium` and linked FR/NFR rows.

## Expiry

Revoke this waiver when distillation artefacts exist that mirror workflow wiring 1:1, or when the watched prefixes in `devtools/distillation-contract.json` no longer include `.github/workflows/`.

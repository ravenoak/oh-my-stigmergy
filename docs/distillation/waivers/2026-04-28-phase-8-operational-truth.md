# Distillation contract waiver — Phase 8 operational truth

**Date:** 2026-04-28  
**Scope:** `.github/workflows/*.yml` (graph step `timeout-minutes`, `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` review comments, branch-protection-audit job guards).

## Rationale

These edits change CI orchestration and operational enforcement only; normative Allium behavioural intent for packages is unchanged except where `spec/governance.allium` was extended in the same program (tracked in FR/RTM).

## Expiry

Revoke when distillation artefacts mirror workflow wiring 1:1 or when `devtools/distillation-contract.json` no longer watches `.github/workflows/`.

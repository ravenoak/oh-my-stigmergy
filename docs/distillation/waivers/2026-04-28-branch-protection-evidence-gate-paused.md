# Distillation contract waiver — branch-protection evidence gate paused

**Date:** 2026-04-28  
**Scope:** [`.github/workflows/branch-protection-evidence.yml`](../../.github/workflows/branch-protection-evidence.yml), [`.github/workflows/branch-protection-audit.yml`](../../.github/workflows/branch-protection-audit.yml), and [docs/operations/github-branch-protection.md](../../operations/github-branch-protection.md).

## Rationale

CI-only: disable automated enforcement of `docs/operations/branch-protection-evidence.json` freshness; document follow-up on token strategy (GitHub App vs PAT for administration-scoped API access). No change to Allium behavioural specifications.

## Expiry

Revoke when the verify step is restored in `branch-protection-evidence.yml` and/or the distillation contract no longer requires a waiver for these workflow edits.

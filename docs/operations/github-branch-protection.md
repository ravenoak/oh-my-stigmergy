# GitHub branch protection for `main`

This repository’s mechanical merge gate is the **`allium-specs`** workflow ([`.github/workflows/allium-specs.yml`](../../.github/workflows/allium-specs.yml)). The workflow defines several jobs (`filter`, `governance`, `specs-and-packages`); the **required** status check is still the aggregate job id **`check`**, which GitHub displays as **`allium-specs / check`**. **FR-0.2** is only fully satisfied for the organization when that workflow is **required** before merging to the default branch.

GitHub’s UI labels change over time; the intent is always: **no merge to `main` unless the Allium validation job has passed.**

## Steps (classic branch protection rules)

1. Open the repository on GitHub: `https://github.com/ravenoak/oh-my-stigmergy` (adjust owner/name if forked).
2. Go to **Settings** → **Branches** → **Branch protection rules** → **Add rule** (or edit the existing rule for `main`).
3. Under **Branch name pattern**, enter `main`.
4. Enable **Require a pull request before merging** if the team wants PR-only flow (recommended).
5. Under **Require status checks to pass before merging**, enable it and search the status list for:
   - **`allium-specs / check`** — this is the check name produced by the workflow file’s job id `check` and workflow `name: allium-specs`. If GitHub shows a slightly different string (for example after renaming the job), pick the entry that corresponds to this workflow’s Allium steps.
6. Save the rule.

## Rulesets (alternative)

If the organization uses **Repository rulesets** instead of classic rules, create or extend a ruleset targeting `main` and add the same required workflow: **Allium spec validation** (`allium-specs`), job **`check`**.

## After the first successful run

Until at least one workflow run has completed on the default branch, the required check may not appear in the pick list. Merge or push a commit that triggers `allium-specs`, wait for green, then attach the rule.

## Automated application (GitHub CLI)

When you have **`gh`**, **`jq`**, and a token with **admin** rights to this repository (`gh auth login`):

1. Confirm at least one successful **`allium-specs`** run exists on `main` (otherwise the API may return **422** until the check name exists).
2. From the repository root, run:

```bash
./scripts/apply-branch-protection-main.sh
```

Use `./scripts/apply-branch-protection-main.sh --strict` to **fail** if no workflow runs exist on `main` yet.

The JSON body sent to GitHub is committed as [`devtools/branch-protection.json`](../../devtools/branch-protection.json). Edit the `checks[].context` value there if your Actions UI shows a different required-check label than `allium-specs / check`.

3. Verify read-only:

```bash
./scripts/verify-branch-protection-remote.sh
```

This script is **not** run in PR CI by default (the default `GITHUB_TOKEN` usually cannot read admin-only settings).

### Human-readable summary

After `gh auth login` with a token that can read branch protection:

```bash
./scripts/print-branch-protection-summary.sh
```

### GitHub Actions audit (scheduled + manual)

Repository workflow [`.github/workflows/branch-protection-audit.yml`](../../.github/workflows/branch-protection-audit.yml) runs monthly (UTC) and on **`workflow_dispatch`**. Configure repository secret **`BP_ADMIN_TOKEN`** (admin-capable token able to read branch protection / rulesets via `gh api`) so `verify-branch-protection-remote.sh` + evidence refresh can run in Actions; if the secret is absent, verification steps are **skipped** with a notice (workflow stays green).

## Verification

Contributors with admin access confirm in the PR template (first-time setup) that this rule is enabled, or link to the org’s central governance doc if rules are managed elsewhere.

## Enablement record

After you enable protection (UI, rulesets, or `./scripts/apply-branch-protection-main.sh`), add a row with the date, verifier, and evidence. **P0-a is satisfied on the canonical remote only when** `./scripts/verify-branch-protection-remote.sh` exits `0` **and** this table records **verified remote** (not “automation only”).

| Date | Owner | Notes |
|------|-------|-------|
| 2026-04-27 | oh-my-stigmergy | **Required check enforced** — `main` requires **`allium-specs / check`** before merge (maintainer-confirmed in GitHub UI / rules). |
| 2026-04-28 | oh-my-stigmergy | **Rulesets-aware verification** — [`scripts/verify-branch-protection-remote.sh`](../../scripts/verify-branch-protection-remote.sh) supports classic protection **and** repository rulesets (required contexts + merge-method checks). Paste [`scripts/print-branch-protection-summary.sh`](../../scripts/print-branch-protection-summary.sh) output here after each audit; scheduled audit workflow runs monthly when **`BP_ADMIN_TOKEN`** is configured. |

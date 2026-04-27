# GitHub Flow for this repository

Normative expectations for humans and agents: **`main` is protected**; delivery happens through **feature branches**, **atomic commits**, and **pull requests** only. Server-side history on `main` stays **linear** by using **squash** or **rebase** merges—**not** merge commits.

## Principles

| Topic | Rule |
|-------|------|
| Branching | Create a **feature branch** from up-to-date `main` (`main` → `feature/short-description`). |
| Commits | **Atomic commits**: each commit is one coherent change (easy to revert and review). |
| Integration | Land work on `main` **only via PR** (no direct pushes of multi-step work for shared branches). |
| `main` history | **Linear**: GitHub **“Require linear history”** on `main`; PRs complete with **Squash and merge** or **Rebase and merge**. |
| Forbidden on `main` | **Merge commits** from PRs (`Create a merge commit` disabled for this repo’s workflow). |

## Tools

| Tool | Role |
|------|------|
| **`git`** | Branch, commit, rebase onto `main` before PR if needed. |
| **`gh`** ([CLI](https://cli.github.com/)) | `gh auth login`, `gh pr create`, `gh pr checks`, `gh pr view`, `gh pr merge --squash` / `--rebase`. Reduces UI drift and documents commands in scripts/chat. |
| **GitHub Actions** | `allium-specs` must be green before merge ([FR-0.2](../requirements/FR.md)). |

Install `gh`: `brew install gh` (macOS) or see [Installing gh](https://github.com/cli/cli#installation).

## Workflow (contributor)

1. **Sync and branch**

   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   git checkout -b feature/your-change
   ```

2. **Develop with atomic commits**

   ```bash
   git add -p   # or add explicit paths
   git commit -m "Clear imperative subject (present tense)"
   ```

   Group files so each commit tells one story (e.g. docs-only vs behaviour change).

3. **Push and open a PR**

   ```bash
   git push -u origin feature/your-change
   gh pr create --title "Short title" --body "Why / what / how validated (scripts run)."
   ```

4. **Wait for checks** — especially `allium-specs` / job `check`.

   ```bash
   gh pr checks <PR_NUMBER_OR_URL>
   ```

5. **Merge without merge commits**

   Prefer **squash** (single commit on `main` per PR) or **rebase** (one commit per PR commit, linear):

   ```bash
   gh pr merge --squash --delete-branch
   # or
   gh pr merge --rebase --delete-branch
   ```

   Do **not** use `gh pr merge --merge` for this repository’s policy.

## Maintainer: branch protection alignment

In repository **Settings → General → Pull Requests**, enable **Allow squash merging** and **Allow rebase merging**, and disable **Allow merge commits** if your org permits.

In **Settings → Rules** (rulesets) or **Branches → Branch protection** for `main`:

- Require status checks (e.g. `allium-specs / check`).
- **Require linear history** (when using rebase/squash-only merges this stays consistent).

Existing automation for required checks: [docs/operations/github-branch-protection.md](../operations/github-branch-protection.md).

## Agents and Cursor

Follow the same flow: create a feature branch for substantive work, keep commits atomic, open a PR with `gh`, and merge with squash or rebase only. See [.cursor/skills/github-flow/SKILL.md](../../.cursor/skills/github-flow/SKILL.md) and [.cursor/rules/github-flow.mdc](../../.cursor/rules/github-flow.mdc).

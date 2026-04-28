---
name: git-workflow
description: >-
  Complete Git work in Cursor with oh-my-stigmergy policy—feature branches, atomic commits at end of work, PR with green allium-specs, squash/rebase merge, delete merged local and remote branches, fetch --prune. Use when branching, committing, pushing, opening or merging PRs, cleaning up stale branches, or finishing an agent session with repo changes.
---

# Git workflow (oh-my-stigmergy / Cursor)

Apply for **every** session that touches tracked files: finish with **committed** state on a **feature branch**, or **clean** tree if intentionally discarding work.

## When to read this skill

- Starting or switching **feature** work.
- **End of session** with uncommitted changes.
- **Opening**, **updating**, or **merging** a PR.
- **Deleting** merged or obsolete branches (local + remote tracking).

## Policy summary

- Integration to **`main`**: **pull request only**; merge via **squash** or **rebase**, not merge commits ([docs/guides/github-flow.md](../../../docs/guides/github-flow.md)).
- **CI**: required check **`allium-specs / check`** must be green before merge ([`.github/workflows/allium-specs.yml`](../../../.github/workflows/allium-specs.yml)).
- **CLI**: prefer **`gh`** for PRs and merge; **`git`** for branch/commit.

## 1. Start work from main

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feature/<short-description>
```

If you already edited files on **`main`**, do **not** commit there:

```bash
git switch -c feature/<short-description>
```

## 2. Commit when a logical unit is done (atomic)

```bash
git status
git diff
git add <paths>
git commit -m "type(scope): imperative subject under ~72 chars"
```

Push when the branch should exist on the remote:

```bash
git push -u origin feature/<short-description>
```

## 3. Open or refresh a PR

```bash
gh pr create --base main --title "..." --body "..."   # first time
# or
gh pr view   # if already open
gh pr checks <n> --watch
```

Do **not** merge until **`allium-specs`** gate is **success**.

## 4. Merge and delete remote branch

Prefer squash (single commit on `main`):

```bash
gh pr merge <n> --squash --delete-branch
```

Alternative (linear commits from branch):

```bash
gh pr merge <n> --rebase --delete-branch
```

**Do not** use `gh pr merge --merge` for `main`.

## 5. Update local main and delete the local feature branch

After merge:

```bash
git checkout main
git pull origin main
git branch -d feature/<short-description>
```

If `-d` refuses (Git thinks branch not merged): **`git branch -D`** only after verifying the PR merged and you do not need the branch — otherwise **`git merge-base`** / **`gh pr view`** first.

## 6. Clean up other old branches

### Prune stale remote-tracking refs

```bash
git fetch origin --prune
```

### Delete **local** branches already merged into `main`

Inspect:

```bash
git branch --merged main
```

Delete merged locals (excludes current branch; adjust names):

```bash
git branch --merged main | grep -v '^\*' | grep -vE '^(main|master)$' | xargs -r git branch -d
```

On macOS without `xargs -r`, use a loop or delete one-by-one.

### Remote branches

Usually **`--delete-branch`** on merge removes the **feature** branch on origin. If one remains:

```bash
git push origin --delete feature/<obsolete>
```

Do **not** bulk-delete **`dependabot/**`** or active collaborator branches without maintainer intent.

## 7. If push or merge is blocked (auth / permissions)

1. Ensure **all commits** exist on the **feature** branch locally.
2. Tell the user clearly: push failed; give exact **`git push -u origin ...`** and **`gh pr create` / `gh pr merge`** commands.
3. Do **not** claim the PR is merged if **`gh`** did not succeed.

## References

- Rule: [`.cursor/rules/github-flow.mdc`](../../rules/github-flow.mdc), [`.cursor/rules/git-workflow.mdc`](../../rules/git-workflow.mdc)
- Guide: [docs/guides/github-flow.md](../../../docs/guides/github-flow.md)

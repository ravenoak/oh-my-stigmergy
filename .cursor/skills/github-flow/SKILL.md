---
name: github-flow
description: >-
  Use GitHub Flow for this repo: feature branches from main, atomic commits, PR-only
  integration, linear main via squash or rebase merge; document gh and git commands.
---

# GitHub Flow (oh-my-stigmergy)

Use when **branching, committing, pushing, opening PRs, or merging** — including agent-driven delivery sessions.

## Policy (non-negotiable here)

1. Branch from current `main`: `git fetch origin && git checkout main && git pull && git checkout -b feature/...`.
2. **Atomic commits** — one coherent story per commit (split docs vs code vs CI when helpful).
3. Land on `main` **only via PR**; ensure **`allium-specs`** is green (`gh pr checks`).
4. Merge with **`gh pr merge --squash`** or **`gh pr merge --rebase`** only — **not** `--merge` (no merge commits on `main`).
5. Prefer **`gh`** so steps are reproducible in chat and scripts.

## Command cheat sheet

```bash
# Start work
git fetch origin && git checkout main && git pull origin main
git checkout -b feature/my-change

# Commit atomically
git status
git add <paths>
git commit -m "feat: concise present-tense subject"

# Publish and PR
git push -u origin feature/my-change
gh pr create --fill   # or --title / --body

# Verify gate
gh pr checks

# Complete (pick one)
gh pr merge --squash --delete-branch
gh pr merge --rebase --delete-branch
```

## References

- [docs/guides/github-flow.md](../../../docs/guides/github-flow.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
- [docs/operations/github-branch-protection.md](../../../docs/operations/github-branch-protection.md)

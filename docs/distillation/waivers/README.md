# Distillation waivers (FR-1.2)

When a pull request changes paths under [`devtools/distillation-contract.json`](../../devtools/distillation-contract.json) prefixes **without** updating Allium under `spec/`, add a waiver file here so [`scripts/verify-distillation-contract.sh`](../../scripts/verify-distillation-contract.sh) passes.

## Format

One Markdown file per waiver, named `YYYY-MM-DD-scope.md`, containing:

- A first-level heading with the PR or change scope.
- Bullet **Reason** (why spec was not updated in this PR).
- Bullet **Follow-up** (issue or backlog ID, or “none” with justification).

Example:

```markdown
# PR 42 — workflow-only tweak

- **Reason:** YAML formatting only; no behavioural obligation change.
- **Follow-up:** none.
```

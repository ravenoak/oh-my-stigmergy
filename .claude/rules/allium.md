---
paths:
  - "**/*.allium"
  - ".github/workflows/**"
  - "scripts/**"
---

# Allium specs, CI gate, and traceability (FR-0.2, NFR-O1)

## Spec authoring — behavioural, not implementation

After creating or editing `.allium` files:

1. Run `allium check <path>` and fix all diagnostics (or use `./scripts/check-allium-specs.sh`
   for the full repo sweep). **Claude Code** runs this automatically via PostToolUse hook
   (`.claude/settings.json`) — verify the hook output before committing.
2. Run `allium analyse <path>` (or `./scripts/analyse-allium-specs.sh`) when exploring
   cross-rule implications.
3. Prefer JUXT Allium slash skills (`/allium`, `/allium:elicit`, `/allium:distill`,
   `/allium:tend`, `/allium:weed`) for spec work rather than duplicating language-reference
   prose in chat.

Specs describe **observable behaviour** (entities, rules, transitions). Do **not** encode
incidental implementation choices (schemas, frameworks) unless they are part of the contract.

## CI merge gate

Every push to `main`/`master` and every pull request runs workflow **`allium-specs`**
(job id **`check`** — the required branch-protection gate). The pipeline:

1. `tests/ci_contract.sh` — contract self-test
2. `scripts/verify-requirement-traceability.sh` — FR/NFR ↔ RTM ID sync
3. `scripts/verify-governance-doc-cotouch.sh` — on PRs, FR/NFR.md must travel with RTM.md
   ([FR-0.1](docs/requirements/FR.md))
4. Install pinned `allium-cli` from `devtools/allium-cli.version`
5. `scripts/check-allium-specs.sh` — `allium check` over `spec/`
6. `scripts/analyse-allium-specs.sh` — `allium analyse` over `spec/`

**Before pushing** spec, CI-workflow, or scripts changes, run the same steps locally:

```bash
bash tests/ci_contract.sh
bash scripts/verify-requirement-traceability.sh
# On a PR branch:
GITHUB_BASE_REF=main GITHUB_EVENT_NAME=pull_request \
  bash scripts/verify-governance-doc-cotouch.sh
./scripts/check-allium-specs.sh
./scripts/analyse-allium-specs.sh
```

Branch protection requires the **`check`** job to pass before merge:
[docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md).

## Traceability

When changing FR/NFR IDs or RTM rows, run `scripts/verify-requirement-traceability.sh`.
When changing `docs/requirements/FR.md` or `NFR.md` on a PR branch, include
`docs/traceability/RTM.md` in the same PR ([FR-0.1](docs/requirements/FR.md)).

Related IDs: FR-0.1, FR-0.2, NFR-D1, NFR-O1.

## References

- [docs/requirements/FR.md](docs/requirements/FR.md), [NFR.md](docs/requirements/NFR.md)
- [docs/traceability/RTM.md](docs/traceability/RTM.md)
- [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md)
- [docs/guides/agent-session-budgets.md](docs/guides/agent-session-budgets.md)

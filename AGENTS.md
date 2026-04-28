# Agent instructions

**oh-my-stigmergy** is an intention-first, traceability-heavy workspace for agentic software development research and practice.

## Start here

| Resource | Purpose |
|----------|---------|
| [docs/CONSTITUTION.md](docs/CONSTITUTION.md) | Non-negotiable principles and non-goals |
| [docs/README.md](docs/README.md) | Map of PRD, TDD, FR/NFR, RTM, ADRs |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Full implementation program vs inspiration essay; phase ordering |
| [docs/guides/github-flow.md](docs/guides/github-flow.md) | **GitHub Flow:** feature branches, atomic commits, PR-only `main`, squash/rebase merge; use `gh` |
| [`.cursor/skills/git-workflow/SKILL.md`](.cursor/skills/git-workflow/SKILL.md) | **Git (Cursor):** finish work with commits on a feature branch; PR + green CI + squash merge; delete merged branches; `git fetch --prune` |
| [spec/project.allium](spec/project.allium) | Seed Allium config — extend with domain behaviour |
| [docs/adr/0004-verification-stack-layering.md](docs/adr/0004-verification-stack-layering.md) | What deterministic tooling actually means **today** |

## Allium

- Invoke JUXT skills: `/allium`, `/allium:elicit`, `/allium:distill`, `/allium:propagate`, `/allium:tend`, `/allium:weed` (see [juxt/allium](https://github.com/juxt/allium)).
- After editing `.allium` files: run `allium check` and `allium analyse` (or `./scripts/check-allium-specs.sh` and `./scripts/analyse-allium-specs.sh`). Skills are installed under `.agents/skills/` and symlinked from `.cursor/skills/`.

## CI and contracts

- Workflow: [`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml) (job id **`check`**). Contract tests: [`tests/ci_contract.sh`](tests/ci_contract.sh). RTM ID sync: [`scripts/verify-requirement-traceability.sh`](scripts/verify-requirement-traceability.sh). PR governance: [`scripts/verify-governance-doc-cotouch.sh`](scripts/verify-governance-doc-cotouch.sh), [`scripts/verify-constitution-amendment-cotouch.sh`](scripts/verify-constitution-amendment-cotouch.sh), [`scripts/verify-distillation-contract.sh`](scripts/verify-distillation-contract.sh). Spec anchors: [`scripts/verify-fr-spec-anchors.sh`](scripts/verify-fr-spec-anchors.sh). Graph / SBP / stance / crucible slices: [`packages/graph`](packages/graph), [`packages/sbp-server`](packages/sbp-server), [`packages/stance`](packages/stance), [`scripts/verify-smt-golden.sh`](scripts/verify-smt-golden.sh), [`devtools/crucible-shim`](devtools/crucible-shim).
- Pin files: [`devtools/allium-cli.version`](devtools/allium-cli.version), [`devtools/uv.version`](devtools/uv.version) (Actions **uv** install). Local Python env: [`CONTRIBUTING.md`](CONTRIBUTING.md) (`uv sync …`).
- Branch protection (human step): [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md). Maintainer automation: [`scripts/apply-branch-protection-main.sh`](scripts/apply-branch-protection-main.sh), audit: [`scripts/verify-branch-protection-remote.sh`](scripts/verify-branch-protection-remote.sh) (`gh` + `jq`, admin token).
- Session budgets (NFR-C1): [docs/guides/agent-session-budgets.md](docs/guides/agent-session-budgets.md).
- Distillation (FR-1.2): [docs/guides/distillation-playbook.md](docs/guides/distillation-playbook.md).

## Do not invent enforcement

Do **not** claim this repository runs Z3 gates, OPA shell interception, or Allium→SMT compilation unless [docs/traceability/RTM.md](docs/traceability/RTM.md) lists them as `implemented` with code in tree.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

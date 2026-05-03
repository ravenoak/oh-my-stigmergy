# Agent instructions

**oh-my-stigmergy** is an intention-first, traceability-heavy workspace for agentic software development research and practice. It emphasizes **stigmergy** (specs, graph, SBP ledger, deterministic checks). The **recommended** OpenCode integration is [`packages/opencode-plugin`](packages/opencode-plugin) (FR-5.x / FR-6.x, [ADR-0012](docs/adr/0012-opencode-plugin-architecture.md), [ADR-0013](docs/adr/0013-stigmergic-opencode-orchestration.md)). Migration from [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent): [docs/guides/migration-from-oh-my-openagent.md](docs/guides/migration-from-oh-my-openagent.md).

## Start here

For **OpenCode + SBP + graph** end-to-end setup (operators), follow [docs/guides/opencode-stigmergy-golden-path.md](docs/guides/opencode-stigmergy-golden-path.md). **Troubleshooting** (SBP down, bridge errors, `uv`, orchestration JSON): [docs/operations/opencode-stigmergy-troubleshooting.md](docs/operations/opencode-stigmergy-troubleshooting.md). **Positioning and boundaries** (multi-agent, verification scope, SBP storage): [docs/guides/project-positioning-and-boundaries.md](docs/guides/project-positioning-and-boundaries.md). **Stigmergic SDLC workflow patterns:** [docs/guides/stigmergic-sdlc-workflows.md](docs/guides/stigmergic-sdlc-workflows.md). **Model routing and compatibility:** [docs/guides/opencode-model-routing-playbook.md](docs/guides/opencode-model-routing-playbook.md), [docs/operations/opencode-compatibility.md](docs/operations/opencode-compatibility.md), [docs/operations/opencode-plugin-release.md](docs/operations/opencode-plugin-release.md). It does not replace the broader programme in [docs/PRD.md](docs/PRD.md); it makes the cognitive bridge usable alongside the shared medium.

### OpenCode plugin (`@oh-my-stigmergy/opencode-plugin`)

Canonical reference for **what the plugin can and cannot do**, **install** (npm vs local path), **configuration**, **tools**, and **usage patterns**: [packages/opencode-plugin/README.md](packages/opencode-plugin/README.md). Read it before claiming ledger/graph/orchestration behaviour in user-facing answers.

- **Capabilities:** SBP HTTP tools, graph CLIs via `uv`, orchestration helpers (`stigmergy_actionable`, `stigmergy_resolve_model`), event hooks, optional audit log—see README tables.
- **Limitations:** no OMO vendoring, no in-session Z3/crucible, no automatic permission blocking without ADR-0005 successor; `sbp_error` / `graph_error` when SBP or `uv`/cwd is wrong—see README and [docs/operations/opencode-stigmergy-troubleshooting.md](docs/operations/opencode-stigmergy-troubleshooting.md).
- **Do not invent enforcement:** Z3, OPA shell interception, Allium→SMT—same rule as below and [docs/traceability/RTM.md](docs/traceability/RTM.md).

| Resource | Purpose |
|----------|---------|
| [docs/CONSTITUTION.md](docs/CONSTITUTION.md) | Non-negotiable principles and non-goals |
| [docs/README.md](docs/README.md) | Map of PRD, TDD, FR/NFR, RTM, ADRs |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Full implementation program vs inspiration essay; phase ordering |
| [docs/research/README.md](docs/research/README.md) | Phase 20 effectiveness protocol (**FR-7.2**), pilot runbook, optional results |
| [docs/guides/github-flow.md](docs/guides/github-flow.md) | **GitHub Flow:** feature branches, atomic commits, PR-only `main`, squash/rebase merge; use `gh` |
| [`.cursor/skills/git-workflow/SKILL.md`](.cursor/skills/git-workflow/SKILL.md) | **Git (Cursor):** finish work with commits on a feature branch; PR + green CI + squash merge; delete merged branches; `git fetch --prune` |
| [spec/project.allium](spec/project.allium) | Seed Allium config — extend with domain behaviour |
| [docs/adr/0004-verification-stack-layering.md](docs/adr/0004-verification-stack-layering.md) | What deterministic tooling actually means **today** |
| [docs/guides/project-positioning-and-boundaries.md](docs/guides/project-positioning-and-boundaries.md) | Multi-agent, verification, decentralization, reference scale (FR-6.4) |
| [docs/guides/stigmergic-sdlc-workflows.md](docs/guides/stigmergic-sdlc-workflows.md) | Pheromone, spec, and release SDLC patterns (FR-6.4) |
| [docs/operations/opencode-stigmergy-troubleshooting.md](docs/operations/opencode-stigmergy-troubleshooting.md) | OpenCode + SBP + graph failures (FR-6.5) |

## Allium

- Invoke JUXT skills: `/allium`, `/allium:elicit`, `/allium:distill`, `/allium:propagate`, `/allium:tend`, `/allium:weed` (see [juxt/allium](https://github.com/juxt/allium)).
- After editing `.allium` files: run `allium check` and `allium analyse` (or `./scripts/check-allium-specs.sh` and `./scripts/analyse-allium-specs.sh`). Skills are installed under `.agents/skills/` and symlinked from `.cursor/skills/`.

## CI and contracts

- Workflow: [`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml) (job id **`check`**). Contract tests: [`tests/ci_contract.sh`](tests/ci_contract.sh). RTM ID sync: [`scripts/verify-requirement-traceability.sh`](scripts/verify-requirement-traceability.sh). PR governance: [`scripts/verify-governance-doc-cotouch.sh`](scripts/verify-governance-doc-cotouch.sh), [`scripts/verify-constitution-amendment-cotouch.sh`](scripts/verify-constitution-amendment-cotouch.sh), [`scripts/verify-distillation-contract.sh`](scripts/verify-distillation-contract.sh). Spec anchors: [`scripts/verify-fr-spec-anchors.sh`](scripts/verify-fr-spec-anchors.sh). Graph / SBP / stance / crucible / OpenCode plugin: [`packages/graph`](packages/graph), [`packages/sbp-server`](packages/sbp-server), [`packages/stance`](packages/stance), [`packages/opencode-plugin`](packages/opencode-plugin), [`scripts/verify-smt-golden.sh`](scripts/verify-smt-golden.sh), [`devtools/crucible-shim`](devtools/crucible-shim).
- Pin files: [`devtools/allium-cli.version`](devtools/allium-cli.version), [`devtools/uv.version`](devtools/uv.version) (Actions **uv** install). Local Python env: [`CONTRIBUTING.md`](CONTRIBUTING.md) (`uv sync …`).
- Branch protection (human step): [docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md). Maintainer automation: [`scripts/apply-branch-protection-main.sh`](scripts/apply-branch-protection-main.sh), audit: [`scripts/verify-branch-protection-remote.sh`](scripts/verify-branch-protection-remote.sh) (`gh` + `jq`, admin token).
- Session budgets (NFR-C1): [docs/guides/agent-session-budgets.md](docs/guides/agent-session-budgets.md).
- Distillation (FR-1.2): [docs/guides/distillation-playbook.md](docs/guides/distillation-playbook.md).

## Do not invent enforcement

Do **not** claim this repository runs Z3 gates, OPA shell interception, or Allium→SMT compilation unless [docs/traceability/RTM.md](docs/traceability/RTM.md) lists them as `implemented` with code in tree.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

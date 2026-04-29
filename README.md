# oh-my-stigmergy

Intention-first agentic SDLC workspace: behavioural specs ([Allium](https://juxt.github.io/allium/)), traceable requirements, and explicit verification maturity — without pretending advanced solvers or shims exist before they do.

[![allium-specs](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml/badge.svg?branch=main)](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml?query=branch%3Amain)

## Positioning: stigmergy and OpenCode

The inspiration essay’s TDD places the **cognitive layer** on the **OpenCode framework** and the **coordination layer** on the SBP bus ([oh-my-stigmergy_inspiration.md](oh-my-stigmergy_inspiration.md) §9.1). **oh-my-stigmergy** delivers the **shared medium** — Allium specs, relation-first **graph** ([`packages/graph`](packages/graph)), **SBP** ([`packages/sbp-server`](packages/sbp-server)), deterministic **crucible** ([`packages/crucible`](packages/crucible)), CI/traceability — and the **recommended OpenCode extension**: **[`packages/opencode-plugin`](packages/opencode-plugin)** (`@oh-my-stigmergy/opencode-plugin`) with **stigmergic orchestration** (ledger-backed helpers and stance→model policy per [ADR-0013](docs/adr/0013-stigmergic-opencode-orchestration.md)). [ADR-0012](docs/adr/0012-opencode-plugin-architecture.md) is **Accepted**.

**Not the recommended path for this product:** [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (OMO) — hierarchical harness (Sisyphus, MCPs). If you used OMO before, see [docs/guides/migration-from-oh-my-openagent.md](docs/guides/migration-from-oh-my-openagent.md).

## Quick links

- **[Documentation index](docs/README.md)** — Constitution, PRD, TDD, FR/NFR, RTM, ADRs  
- **[AGENTS.md](AGENTS.md)** — Entry point for coding agents  
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Skills restore, Allium CLI, CI, doc rules, [GitHub Flow](docs/guides/github-flow.md)  
- **[docs/guides/opencode-stigmergy-golden-path.md](docs/guides/opencode-stigmergy-golden-path.md)** — Clone → SBP → OpenCode plugin → graph  
- **[docs/guides/opencode-model-routing-playbook.md](docs/guides/opencode-model-routing-playbook.md)** — Stance→model policy, actionable caps ([FR-6.3](docs/requirements/FR.md))  
- **[docs/operations/opencode-compatibility.md](docs/operations/opencode-compatibility.md)** — Pinned `@opencode-ai/plugin`, events, limits ([Phase 15](docs/ROADMAP.md))  
- **[docs/operations/opencode-plugin-release.md](docs/operations/opencode-plugin-release.md)** — npm publish runbook  
- **[docs/guides/migration-from-oh-my-openagent.md](docs/guides/migration-from-oh-my-openagent.md)** — Moving from OMO to stigmergy-first OpenCode ([ADR-0013](docs/adr/0013-stigmergic-opencode-orchestration.md))  
- **[docs/guides/agent-session-budgets.md](docs/guides/agent-session-budgets.md)** — Session and token discipline (NFR-C1)  
- **[oh-my-stigmergy_inspiration.md](oh-my-stigmergy_inspiration.md)** — Background essay (non-normative narrative)

## Specs

- [`spec/project.allium`](spec/project.allium) — seed configuration; `allium check` should pass.
- CI: the `allium-specs` workflow runs `allium check spec/` and `allium analyse spec/`, plus requirement-ID sync, on pushes to `main`/`master` and on pull requests ([`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml)). Maintainers should require this check in branch protection ([docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md)).

## License

This repository is licensed under the [MIT License](LICENSE).

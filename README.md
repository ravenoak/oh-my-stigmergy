# oh-my-stigmergy

Intention-first agentic SDLC workspace: behavioural specs ([Allium](https://juxt.github.io/allium/)), traceable requirements, and explicit verification maturity — without pretending advanced solvers or shims exist before they do.

[![allium-specs](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml/badge.svg?branch=main)](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml?query=branch%3Amain)

## Positioning: stigmergy and the OpenCode ecosystem

The inspiration essay’s TDD places the **cognitive layer** on the **OpenCode framework** and the **coordination layer** on the SBP bus ([oh-my-stigmergy_inspiration.md](oh-my-stigmergy_inspiration.md) §9.1). **[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)** (OMO) supplies **hierarchical orchestration** (Sisyphus, sub-agents, hooks, MCPs). **oh-my-stigmergy** supplies the **shared medium** — Allium specs, relation-first **graph** ([`packages/graph`](packages/graph)), **SBP** ([`packages/sbp-server`](packages/sbp-server)), deterministic **crucible** ([`packages/crucible`](packages/crucible)), and CI/traceability.

**Standalone OpenCode bridge:** an in-tree npm package **[`packages/opencode-plugin`](packages/opencode-plugin)** (`@oh-my-stigmergy/opencode-plugin`) wires OpenCode sessions to that medium over **HTTP** (to a running SBP) and **shell** (to `graph.load_node` / `graph.aspect`), **without** living inside OMO. Requirements **FR-5.1–FR-5.3** and [ADR-0012](docs/adr/0012-opencode-plugin-architecture.md) govern it; maturity follows [docs/ROADMAP.md](docs/ROADMAP.md) **Phase 11** (scaffold → full implementation + CI).

**Using both:** keep OpenCode + oh-my-openagent for harness/orchestration where you want it; add this repo’s plugin when you want agents to **read and write pheromones** and pull **graph-grounded** slices alongside spec-first gates.

## Quick links

- **[Documentation index](docs/README.md)** — Constitution, PRD, TDD, FR/NFR, RTM, ADRs  
- **[AGENTS.md](AGENTS.md)** — Entry point for coding agents  
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Skills restore, Allium CLI, CI, doc rules, [GitHub Flow](docs/guides/github-flow.md)  
- **[docs/guides/agent-session-budgets.md](docs/guides/agent-session-budgets.md)** — Session and token discipline (NFR-C1)  
- **[oh-my-stigmergy_inspiration.md](oh-my-stigmergy_inspiration.md)** — Background essay (non-normative narrative)

## Specs

- [`spec/project.allium`](spec/project.allium) — seed configuration; `allium check` should pass.
- CI: the `allium-specs` workflow runs `allium check spec/` and `allium analyse spec/`, plus requirement-ID sync, on pushes to `main`/`master` and on pull requests ([`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml)). Maintainers should require this check in branch protection ([docs/operations/github-branch-protection.md](docs/operations/github-branch-protection.md)).

## License

Add a `LICENSE` file when the project chooses a license.

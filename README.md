# oh-my-stigmergy

Intention-first agentic SDLC workspace: behavioural specs ([Allium](https://juxt.github.io/allium/)), traceable requirements, and explicit verification maturity — without pretending advanced solvers or shims exist before they do.

[![allium-specs](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml/badge.svg?branch=main)](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml?query=branch%3Amain)

## Positioning: stigmergy and the OpenCode ecosystem

This repository is **not** an OpenCode plugin. It does **not** replace agent harnesses such as **[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)** (distributed on npm historically as `oh-my-opencode`): that project installs into OpenCode’s plugin list, supplies curated **orchestrators and sub-agents** (e.g. Sisyphus), hooks, LSP/AST tools, and MCPs — a **centralized routing** model.

**oh-my-stigmergy** is a **complementary** direction: **stigmergic** coordination through **shared environment** — Allium specs, a relation-first **graph** ([`packages/graph`](packages/graph)), the **SBP** ledger and SSE stream ([`packages/sbp-server`](packages/sbp-server)), deterministic **crucible** checks ([`packages/crucible`](packages/crucible)), and CI/traceability. Agents (including OpenCode-driven ones) can **read signals** from that medium instead of only receiving top-down task lists. The inspiration essay contrasts hierarchical multi-agent harnesses with this pattern; see [oh-my-stigmergy_inspiration.md](oh-my-stigmergy_inspiration.md) (especially the discussion around oh-my-openagent / OMO).

**Using both:** Run OpenCode + oh-my-openagent for day-to-day coding orchestration, and adopt or deploy pieces from this repo when you want **blackboard-style** coordination, graph-grounded context, or spec-first gates. A first-class **OpenCode plugin / MCP bundle** that publishes pheromones and consumes graph hints is **not shipped here yet**; see [docs/BACKLOG.md](docs/BACKLOG.md) for the promotion path.

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

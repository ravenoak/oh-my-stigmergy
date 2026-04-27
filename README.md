# oh-my-stigmergy

Intention-first agentic SDLC workspace: behavioural specs ([Allium](https://juxt.github.io/allium/)), traceable requirements, and explicit verification maturity — without pretending advanced solvers or shims exist before they do.

[![allium-specs](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml/badge.svg?branch=main)](https://github.com/ravenoak/oh-my-stigmergy/actions/workflows/allium-specs.yml?query=branch%3Amain)

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

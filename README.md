# oh-my-stigmergy

Intention-first agentic SDLC workspace: behavioural specs ([Allium](https://juxt.github.io/allium/)), traceable requirements, and explicit verification maturity — without pretending advanced solvers or shims exist before they do.

## Quick links

- **[Documentation index](docs/README.md)** — Constitution, PRD, TDD, FR/NFR, RTM, ADRs  
- **[AGENTS.md](AGENTS.md)** — Entry point for coding agents  
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Skills restore, Allium CLI, doc rules  
- **[oh-my-stigmergy_inspiration.md](oh-my-stigmergy_inspiration.md)** — Background essay (non-normative narrative)

## Specs

- [`spec/project.allium`](spec/project.allium) — seed configuration; `allium check` should pass.
- CI: the `allium-specs` GitHub Actions workflow runs `allium check spec/` on relevant pushes and pull requests ([`.github/workflows/allium-specs.yml`](.github/workflows/allium-specs.yml)).

## License

Add a `LICENSE` file when the project chooses a license.

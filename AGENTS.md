# Agent instructions

**oh-my-stigmergy** is an intention-first, traceability-heavy workspace for agentic software development research and practice.

## Start here

| Resource | Purpose |
|----------|---------|
| [docs/CONSTITUTION.md](docs/CONSTITUTION.md) | Non-negotiable principles and non-goals |
| [docs/README.md](docs/README.md) | Map of PRD, TDD, FR/NFR, RTM, ADRs |
| [spec/project.allium](spec/project.allium) | Seed Allium config — extend with domain behaviour |
| [docs/adr/0004-verification-stack-layering.md](docs/adr/0004-verification-stack-layering.md) | What deterministic tooling actually means **today** |

## Allium

- Invoke JUXT skills: `/allium`, `/allium:elicit`, `/allium:distill`, `/allium:propagate`, `/allium:tend`, `/allium:weed` (see [juxt/allium](https://github.com/juxt/allium)).
- After editing `.allium` files: run `allium check` (and `allium analyse` when exploring cross-rule effects). Skills are installed under `.agents/skills/` and symlinked from `.cursor/skills/`.

## Do not invent enforcement

Do **not** claim this repository runs Z3 gates, OPA shell interception, or Allium→SMT compilation unless [docs/traceability/RTM.md](docs/traceability/RTM.md) lists them as `implemented` with code in tree.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

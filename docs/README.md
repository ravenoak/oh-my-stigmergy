# Documentation map

This folder is the canonical **governance and specification surface** for oh-my-stigmergy. The long-form essay [`oh-my-stigmergy_inspiration.md`](../oh-my-stigmergy_inspiration.md) remains background reading; **where it conflicts with [FR.md](requirements/FR.md), [RTM.md](traceability/RTM.md), or [ROADMAP.md](ROADMAP.md), those documents win.** **Errata** for the essay (e.g. coordination storage vs ADR-0011): [inspiration-errata.md](inspiration-errata.md). Normative intent lives here and in [`spec/`](../spec/). **OpenCode:** stigmergic orchestration is documented under [ADR-0013](adr/0013-stigmergic-opencode-orchestration.md); see root [`README.md`](../README.md).

| Document | Audience | Update when |
|----------|----------|-------------|
| [CONSTITUTION.md](CONSTITUTION.md) | Humans and agents | Principles or non-goals change |
| [PRD.md](PRD.md) | Product and architecture | Vision, phases, scope, metrics |
| [TDD.md](TDD.md) | Implementers | Components, flows, schemas change |
| [requirements/FR.md](requirements/FR.md) | Everyone | Functional behaviour commitments change |
| [requirements/NFR.md](requirements/NFR.md) | Everyone | Quality attributes change |
| [traceability/RTM.md](traceability/RTM.md) | QA and agents | FR/NFR links to verification change |
| [adr/](adr/) | Decision history | Architectural forks or reversals |
| [GLOSSARY.md](GLOSSARY.md) | Onboarding | New domain terms |
| [BACKLOG.md](BACKLOG.md) | Planning | Ideas are parked or promoted |
| [ROADMAP.md](ROADMAP.md) | Maintainers / architects | Full implementation program vs [oh-my-stigmergy_inspiration.md](../oh-my-stigmergy_inspiration.md); phase exit criteria |
| [inspiration-errata.md](inspiration-errata.md) | Everyone | Essay vs normative repo (e.g. Redis; ADR-0008 / ADR-0011) |
| [guides/project-positioning-and-boundaries.md](guides/project-positioning-and-boundaries.md) | Operators and agents | Multi-agent, verification, decentralization, scale (FR-6.4 / [Phase 16](ROADMAP.md)) |
| [guides/stigmergic-sdlc-workflows.md](guides/stigmergic-sdlc-workflows.md) | Operators and agents | Pheromone, spec, and release SDLC patterns (FR-6.4) |
| [operations/github-branch-protection.md](operations/github-branch-protection.md) | Maintainers | CI must be required on `main` |
| [`packages/graph`](../packages/graph), [`packages/sbp-server`](../packages/sbp-server) | Implementers | Relation-first graph (FR-2.x) and SBP reference server (FR-3.x) |
| [guides/agent-session-budgets.md](guides/agent-session-budgets.md) | Agents and humans | NFR-C1 session discipline |
| [guides/github-flow.md](guides/github-flow.md) | Contributors and agents | Feature branches, atomic commits, PR-only merges, `gh` |
| [guides/distillation-playbook.md](guides/distillation-playbook.md) | Architects and agents | FR-1.2 distil workflow |
| [guides/opencode-stigmergy-golden-path.md](guides/opencode-stigmergy-golden-path.md) | Operators and contributors | FR-5.4 clone → SBP → OpenCode plugin → graph verification ([Phase 12](ROADMAP.md)) |
| [guides/migration-from-oh-my-openagent.md](guides/migration-from-oh-my-openagent.md) | Operators leaving OMO | FR-6.x / [ADR-0013](adr/0013-stigmergic-opencode-orchestration.md) |
| [guides/opencode-model-routing-playbook.md](guides/opencode-model-routing-playbook.md) | Operators | FR-6.3 stance→model policy and actionable caps ([Phase 15](ROADMAP.md)) |
| [operations/opencode-compatibility.md](operations/opencode-compatibility.md) | Operators / upgrades | Pinned `@opencode-ai/plugin`; must match `package.json` ([FR-6.3](requirements/FR.md)) |
| [operations/opencode-stigmergy-troubleshooting.md](operations/opencode-stigmergy-troubleshooting.md) | Operators | Golden path failures: SBP, `sbp_error`/`graph_error`, `uv`, orchestration policy ([FR-6.5](requirements/FR.md), [Phase 17](ROADMAP.md)) |
| [operations/opencode-plugin-release.md](operations/opencode-plugin-release.md) | Maintainers | npm publish runbook for `@oh-my-stigmergy/opencode-plugin` |

**Phases** used in requirement rows: **P0** (governance and specs in-repo), **P1** (intent tooling and workflows), **P2** (relation-first code navigation), **P3** (stigmergic coordination runtime), **P4** (deterministic verification beyond Allium CLI).

**Maturity** labels: `implemented` | `partial` | `planned`. Do not upgrade maturity without evidence linked in the RTM.

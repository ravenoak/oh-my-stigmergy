# Documentation map

This folder is the canonical **governance and specification surface** for oh-my-stigmergy. The long-form essay [`oh-my-stigmergy_inspiration.md`](../oh-my-stigmergy_inspiration.md) remains background reading; normative intent lives here and in [`spec/`](../spec/).

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

**Phases** used in requirement rows: **P0** (governance and specs in-repo), **P1** (intent tooling and workflows), **P2** (relation-first code navigation), **P3** (stigmergic coordination runtime), **P4** (deterministic verification beyond Allium CLI).

**Maturity** labels: `implemented` | `partial` | `planned`. Do not upgrade maturity without evidence linked in the RTM.

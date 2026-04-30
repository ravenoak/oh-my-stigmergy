# Inspiration essay errata

The long-form essay [`oh-my-stigmergy_inspiration.md`](../oh-my-stigmergy_inspiration.md) motivates this repository. **Where the essay and normative docs disagree, [FR.md](requirements/FR.md), [RTM.md](traceability/RTM.md), and [ROADMAP.md](ROADMAP.md) win** ([PRD.md](PRD.md), [ADR-0004](adr/0004-verification-stack-layering.md)).

## Coordination storage (Redis)

The essay may describe the coordination layer as using **Redis** as an in-memory datastore. **That is not the architecture of the reference implementation in this repository.**

Normative durable storage for the Stigmergic Blackboard Protocol is:

- Append-only **JSONL** and optional **SQLite** via `better-sqlite3` ([ADR-0008](adr/0008-sbp-persistence.md), [ADR-0011](adr/0011-sbp-sqlite-store.md)).

**Network Redis** and **in-process Redis-protocol emulators** are **rejected** for the FR-3.x reference path (ADR-0011 decision 2). Operators requiring external databases should treat that as a **fork or separate deployment**, not the default developer path ([NFR-D2](requirements/NFR.md)).

See also [guides/project-positioning-and-boundaries.md](guides/project-positioning-and-boundaries.md).

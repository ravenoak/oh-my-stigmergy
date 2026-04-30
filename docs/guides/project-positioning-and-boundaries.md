# Project positioning and normative boundaries

This guide resolves recurring ambiguities about **multi-agent** wording, **what is mechanically verified**, **decentralization**, and **reference deployment scale**. It complements [CONSTITUTION.md](../CONSTITUTION.md), [ADR-0004](../adr/0004-verification-stack-layering.md), [ADR-0005](../adr/0005-conflict-resolution-governance.md), and [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md). **Normative requirements** live in [FR.md](../requirements/FR.md), [NFR.md](../requirements/NFR.md), and [RTM.md](../traceability/RTM.md).

## Multi-agent in this repository

In this repository, **multi-agent** primarily means **many actors sharing one stigmergic medium** (Allium specs, the relation-first graph, and the Stigmergic Blackboard Protocol ledger), **not** necessarily many simultaneous OpenCode sessions each with a dedicated named sub-agent roster.

The **recommended operator stack** is OpenCode plus [`@oh-my-stigmergy/opencode-plugin`](../../packages/opencode-plugin/) plus a running SBP server and graph CLIs ([ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md)). A **single** OpenCode session can publish and consume **pheromones**, resolve **stance→model** policy, and call **graph** tools—coordination is **ledger-centric**, not necessarily **parallel agent processes**.

**Sisyphus-style named sub-agent rosters** inside OpenCode (as in some upstream harnesses) require **stable multi-session APIs** from the OpenCode host. That capability is **deferred upstream**; see the **Sisyphus-style named sub-agent roster** row in [BACKLOG.md](../BACKLOG.md) and **Upstream re-evaluation triggers** in [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md). There is **no** `implemented` FR for in-tree simulation of that roster.

## Verification scope

Deterministic verification today is exactly what [ADR-0004](../adr/0004-verification-stack-layering.md) lists: Allium CLI checks on committed specs, **curated** crucible translation and Z3 runs on **fixtures** and **`spec/`** solving—**not** a proof that arbitrary application code satisfies every Allium obligation.

Do **not** treat organisation-wide PATH interception, OPA-on-every-shell, or whole-program spec-to-code enforcement as shipped unless [RTM.md](../traceability/RTM.md) says `implemented` and code exists. The **maintainer-scoped** crucible shim is a **bounded** safety surface ([FR-4.1](../requirements/FR.md)).

## Decentralization

**Stigmergic coordination** decentralizes **where signals live** (environmental traces in the ledger and graph) instead of forcing a single omniscient orchestrator prompt ([ADR-0003](../adr/0003-stigmergy-vs-orchestrator.md)).

**Irreconcilable specification or product conflicts** remain **human-architect resolution** until an automated handler ships with mitigations, tests, and a successor ADR ([ADR-0005](../adr/0005-conflict-resolution-governance.md)). That is **decentralization of the coordination pattern**, not **removal of human governance** for conflicts.

## Reference deployment scale

The **reference** SBP implementation uses **in-process**, **JSONL**, and/or **SQLite** (`better-sqlite3`) stores ([ADR-0008](../adr/0008-sbp-persistence.md), [ADR-0011](../adr/0011-sbp-sqlite-store.md)). **Network Redis** and **in-process Redis-protocol emulators** are **not** part of the FR-3.x reference path (ADR-0011 decision 2).

Scaling beyond a single-node SQLite or JSONL file—replication, horizontal SBP, or sub-millisecond fan-out—requires a **new initiative**: scoped ADR, FR/NFR targets, RTM verification, and honest maturity labels. **Promotion criteria** for expanding the **graph** pipeline (new grammars, NetworkX, type-level edges) are in [ADR-0002](../adr/0002-relation-first-retrieval.md).

Canonical links for verification discipline: [BACKLOG.md](../BACKLOG.md), [ADR-0004](../adr/0004-verification-stack-layering.md), [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md).

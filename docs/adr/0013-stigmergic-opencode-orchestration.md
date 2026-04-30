# ADR-0013: Stigmergic OpenCode orchestration (medium-first multi-agent path)

## Status

Accepted

## Context

[ADR-0012](0012-opencode-plugin-architecture.md) shipped an OpenCode **bridge** to SBP and graph. [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (OMO) provides a **hierarchical** harness (Sisyphus, specialist agents). The product charter requires **oh-my-stigmergy** to be the **recommended** way to extend OpenCode with **stigmergic** coordination—ledger-visible work, stance-driven behaviour, and declarative **model routing**—without requiring OMO.

[ADR-0003](0003-stigmergy-vs-orchestrator.md) rejects **mega-orchestrator** monoliths (single omniscient routing prompt). It does **not** reject **medium-centric** orchestration: agents observe SBP, claim work, and follow **policy** loaded from configuration.

## Decision

1. **Recommended operator path:** OpenCode + `@oh-my-stigmergy/opencode-plugin` + running SBP + graph CLIs. **oh-my-openagent** is **not** documented as part of the supported story for achieving stigmergic multi-agent goals in this repository (users may install it unofficially).
2. **Orchestration semantics** live in the **shared medium**: pheromone list/claim/publish (existing FR-3.x API) plus **plugin tools** that surface **actionable** work (intensity vs olfactory threshold) and **stance → model identifier** resolution from a **JSON policy** ([`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json)).
3. **No vendoring** of OMO. OMO parity gaps are listed in [BACKLOG.md](../BACKLOG.md) with **explicit dispositions** (`deferred-upstream`, `not pursued`, `won’t fix`)—not open-ended TBD rows.
4. **Honesty:** Multi-session parallelism and model switching are constrained by the **OpenCode host** and provider configuration—document the pinned `@opencode-ai/plugin` peer and cite upstream plugin docs in release notes.

## Consequences

- New FR epic **FR-6.x** (orchestration) and RTM verification; amend [ADR-0012](0012-opencode-plugin-architecture.md) to reference this ADR as the orchestration charter.
- Plugin ships optional env **`STIGMERGY_ORCHESTRATION_CONFIG`** pointing at a JSON file validating against `orchestration.schema.json`; defaults apply when unset.
- Migration guide [guides/migration-from-oh-my-openagent.md](../guides/migration-from-oh-my-openagent.md) describes conceptual mapping from OMO, not line-by-line config translation.

## Verification

- [`packages/opencode-plugin/test/orchestration.test.mjs`](../../packages/opencode-plugin/test/orchestration.test.mjs) exercises policy parsing and actionable filtering **without** a live SBP (unit fixtures).
- Plugin `npm test` includes orchestration tests; [`scripts/verify-stigmergy-orchestration-doc.sh`](../../scripts/verify-stigmergy-orchestration-doc.sh) asserts ADR-0013 + migration guide are linked from root docs.

## Risks

- **Local model effectiveness** depends on host GPU/drivers and OpenCode provider wiring—RTM cites **routing policy applied**, not subjective model quality.
- **OpenCode plugin API** evolution may require semver bumps on `@opencode-ai/plugin`; keep lockfile pinned and document upgrades.

## Program closure (Phase 15)

Phase 15 is the **mandatory operator closeout** for orchestration—not OMO feature parity. It delivers:

- **Operator-facing documentation:** model routing playbook, compatibility matrix (pinned `@opencode-ai/plugin` version **must** match [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json)), and npm release runbook ([FR-6.3](../requirements/FR.md)).
- **Bounded fan-out:** orchestration policy fields `defaultOlfactoryThreshold`, `defaultActionableLimit`, and `maxActionable` cap `stigmergy_actionable` output without claiming OpenCode token enforcement.
- **Deterministic verification:** [`scripts/verify-opencode-operator-docs.sh`](../../scripts/verify-opencode-operator-docs.sh) in CI.

**Explicit deferral:** A **named sub-agent roster** / Sisyphus-style hierarchy inside OpenCode remains **deferred-upstream** until the OpenCode host exposes stable multi-session APIs worth binding in an ADR—**no** `implemented` FR for in-tree simulation ([BACKLOG.md](../BACKLOG.md)).

### Upstream re-evaluation triggers (Sisyphus-style roster)

Revisit whether to open a **successor ADR** and optional new **FR** for **named sub-agent rosters** or **stable multi-session** OpenCode integration when **any** of the following holds. **Maintainers decide** when to act; there is **no** `implemented` maturity without code paths and [RTM.md](../traceability/RTM.md) verification ([NFR-D1](../requirements/NFR.md)).

1. **`@opencode-ai/plugin` semver:** The **major** or **minor** version of the peer dependency in [`packages/opencode-plugin/package.json`](../../packages/opencode-plugin/package.json) changes—operator docs and compatibility already require a coordinated update ([FR-6.3](../requirements/FR.md), [`scripts/verify-opencode-operator-docs.sh`](../../scripts/verify-opencode-operator-docs.sh)).
2. **Upstream capabilities:** OpenCode or `@opencode-ai/plugin` **release notes** document **stable** APIs for **multi-session**, **parallel agent**, or **named session** workflows suitable for binding from this plugin (beyond switching models in one session).
3. **Promotion from BACKLOG:** The [BACKLOG.md](../BACKLOG.md) **Sisyphus-style named sub-agent roster** row is **reactivated** for execution with a problem statement, target FR/NFR IDs, and verification plan per the promotion gate.

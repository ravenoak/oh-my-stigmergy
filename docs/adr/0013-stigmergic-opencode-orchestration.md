# ADR-0013: Stigmergic OpenCode orchestration (medium-first multi-agent path)

## Status

Accepted

## Context

[ADR-0012](0012-opencode-plugin-architecture.md) shipped an OpenCode **bridge** to SBP and graph. [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (OMO) provides a **hierarchical** harness (Sisyphus, specialist agents). The product charter requires **oh-my-stigmergy** to be the **recommended** way to extend OpenCode with **stigmergic** coordination—ledger-visible work, stance-driven behaviour, and declarative **model routing**—without requiring OMO.

[ADR-0003](0003-stigmergy-vs-orchestrator.md) rejects **mega-orchestrator** monoliths (single omniscient routing prompt). It does **not** reject **medium-centric** orchestration: agents observe SBP, claim work, and follow **policy** loaded from configuration.

## Decision

1. **Recommended operator path:** OpenCode + `@oh-my-stigmergy/opencode-plugin` + running SBP + graph CLIs. **oh-my-openagent** is **not** documented as part of the supported story for achieving stigmergic multi-agent goals in this repository (users may install it unofficially).
2. **Orchestration semantics** live in the **shared medium**: pheromone list/claim/publish (existing FR-3.x API) plus **plugin tools** that surface **actionable** work (intensity vs olfactory threshold) and **stance → model identifier** resolution from a **JSON policy** ([`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json)).
3. **No vendoring** of OMO. Parity gaps are tracked in [BACKLOG.md](../BACKLOG.md) with FR targets.
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

# Distillation playbook (FR-1.2)

This playbook normatively describes how to use **`/allium:distill`** (JUXT Allium skill) against this repository so draft behaviour specs stay aligned with governance artefacts.

## Prerequisites

- JUXT Allium skills installed per [CONTRIBUTING.md](../../CONTRIBUTING.md).
- [allium-tools](https://github.com/juxt/allium-tools) CLI available when validating output (`allium check`, `allium analyse`).
- A **named human architect** who owns contradictions between distilled spec and declared requirements.

## When to distil

- After a **non-trivial** change to scripts, workflows, or docs that encode obligations you want future agents to treat as behavioural (not only prose).
- When onboarding a new subsystem and the implementation exists before a spec.
- **Not** for typo-only edits or pure formatting.

## Steps

1. **Scope the slice.** Pick one directory or concern (for example `scripts/` or a single workflow). Avoid whole-repo distils in one session; split work across chats if context grows large ([NFR-C1](agent-session-budgets.md)).
2. **Run `/allium:distill`** with explicit paths and goals. Capture the skill’s gap list verbatim.
3. **Validate mechanically.** Run `./scripts/check-allium-specs.sh` and `./scripts/analyse-allium-specs.sh` on every new or changed `.allium` file.
4. **Triage gaps.** For each gap: **spec change**, **code change**, **defer** (with BACKLOG/ADR pointer), or **reject** (implementation was wrong).
5. **Update traceability.** If FR/NFR text or maturity changes, edit [docs/requirements/FR.md](../requirements/FR.md) / [NFR.md](../requirements/NFR.md) and [docs/traceability/RTM.md](../traceability/RTM.md) in the **same PR** (CI enforces co-touch for FR/NFR).
6. **Distillation contract (CI).** If you change paths under [`devtools/distillation-contract.json`](../../devtools/distillation-contract.json) prefixes without editing `spec/`, add a dated waiver under [`docs/distillation/waivers/`](../distillation/waivers/) (see README there) so [`scripts/verify-distillation-contract.sh`](../../scripts/verify-distillation-contract.sh) passes on pull requests.
7. **Weed periodically.** Use `/allium:weed` when specs and implementation have diverged; prefer evidence from `allium analyse` over intuition alone.

## Related skills

- `/allium:tend` — refine existing specs.
- `/allium:weed` — compare spec to code and resolve drift.
- `/allium:elicit` — when behaviour is greenfield, prefer elicit over distil.

## References

- [FR-1.2](../requirements/FR.md)
- [juxt/allium](https://github.com/juxt/allium)
- [Assessing specs](../../.agents/skills/allium/references/assessing-specs.md) (in-repo copy under `.agents/skills/`)

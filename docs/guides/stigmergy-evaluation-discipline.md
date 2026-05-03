# Stigmergy evaluation discipline (operators and researchers)

This guide ties **[CONSTITUTION.md](../CONSTITUTION.md)** empirical discipline to **what we can measure** when judging whether this repository’s **stigmergic** patterns help agents coordinate without inventing enforcement claims. It complements [ADR-0014](../adr/0014-sbp-project-supervision.md) (solo supervision), [ADR-0013](../adr/0013-stigmergic-opencode-orchestration.md) (orchestration helpers), and [ADR-0004](../adr/0004-verification-stack-layering.md) (what deterministic tooling actually proves).

**Canonical study design** (tasks, metrics **M1–M4**, conditions **A / B1 / B2**, reporting): **[OpenCode effectiveness study protocol](../research/opencode-effectiveness-study-protocol.md)** (**FR-7.2**, [ADR-0015](../adr/0015-empirical-evaluation-study-claims.md)). This guide states principles; the protocol is the **binding** operational specification for controlled runs on real code.

**Primary inference** for “does the default stigmergy stack help?” uses **A vs B1** unless a study **pre-registers** a different contrast. **B1 vs B2** addresses **orchestration policy** (explicit `STIGMERGY_ORCHESTRATION_CONFIG` file vs defaults-only) when that comparison is pre-registered—not a substitute for the stack-vs-control question.

## What this repository can prove with CI

- **Specs:** structural checks (`allium check` / `analyse`) on committed `.allium` files.
- **Implementation obligations:** tests and scripts cited in [traceability/RTM.md](../traceability/RTM.md) for each FR row (`implemented`).
- **Verification stack (bounded):** crucible compile / Z3 golden / shim contracts **only where** RTM lists them as **deterministic today**—not “all intent is true in production.”

CI does **not** prove that a team’s **OpenCode** session was **faster**, **safer**, or **less duplicative** without a **separate, designed study** and agreed metrics.

## Falsifiable hypotheses (examples)

These are **research questions**—use them to design studies; promote to FR rows + harnesses only if you want them **merge-gated**.

1. **Supervision vs manual SBP:** Leaving `SBP_URL` unset (project-local supervision) **reduces** misconfiguration and double-listener failures versus “read the doc and start SBP by hand,” for a **fixed** task set and time box.
2. **Ledger visibility:** When SBP is **on**, parallel agents **duplicate less work** (by an agreed measure) than when the ledger is **off**, holding task difficulty constant.
3. **Orchestration policy:** Stance→model policy + `stigmergy_actionable` **changes** model routing or queue review outcomes versus ad-hoc model choice, under a **blinded** or A/B protocol you document.

**Falsification:** any of the above can fail—e.g. supervision adds no measurable benefit for your team, or the ledger is ignored in practice. That is **useful**; it tightens the product story.

## What would count as evidence

- **Operational:** audit NDJSON ([`packages/opencode-plugin`](../../packages/opencode-plugin) `STIGMERGY_AUDIT_LOG_FILE`), SBP `SBP_LOG_FILE`, time-to-first-successful `stigmergy_publish` in a scripted lab.
- **Human protocol:** task instructions, success criteria, and rater rubrics **fixed before** the run (prevents post-hoc moving the goalposts).
- **Proportionality:** large claims (e.g. “stigmergy cuts integration incidents by X%”) need **sample design** and **uncertainty**—not a single anecdote.

## Non-claims

- **Z3 on commit for arbitrary app code** is **not** the default story ([ADR-0004](../adr/0004-verification-stack-layering.md)).
- **Plugin + SBP** do not replace **code review** or **security review** of your application.
- **Graph + stance** are **epistemic aids**; they do not guarantee correct business logic.

## References

- [CONSTITUTION.md](../CONSTITUTION.md)
- [traceability/RTM.md](../traceability/RTM.md)
- [ROADMAP.md](../ROADMAP.md) (Phase 19–20)
- [research/opencode-effectiveness-study-protocol.md](../research/opencode-effectiveness-study-protocol.md) (**FR-7.2**)
- [ADR-0015](../adr/0015-empirical-evaluation-study-claims.md)
- [docs/operations/opencode-plugin-release.md](../operations/opencode-plugin-release.md) (registry release train)
- [BACKLOG.md](../BACKLOG.md) (promotion gate for new epics)

# Orchestrator decision pre-registration

**Status: SCAFFOLD — criteria not yet frozen.** This document exists now (Stage 0) so its shape is
reviewable before the numbers are filled in. Every `[TO BE FROZEN IN STAGE 4]` blank must be
completed, maintainer-ratified, and this document's status line flipped to **`FROZEN — <date>`**
**before** the human-as-orchestrator bridge (Stage 4) observation window opens. No log data may be
collected before freezing. This is the FR-7.x / ADR-0015 discipline applied to a build-vs-don't-build
decision instead of an effectiveness study: falsifiable, versioned, and not merge-gated on its
*outcome* — only on the *existence* of a frozen rule before data collection.

**Normative context:** [ADR-0015](../adr/0015-empirical-evaluation-study-claims.md) (claims boundary —
same discipline applied here); [ADR-0003](../adr/0003-stigmergy-vs-orchestrator.md) (what is being
tested: whether the medium coordinates without a central controller);
[`docs/planning/orchestrator-implementation-plan.md`](../planning/orchestrator-implementation-plan.md)
(why this gate exists instead of a positioning ADR written first).

## What is being decided

Whether to build `packages/orchestrator` (brief workstream E) — **not** whether the medium is a good
idea, **not** whether leases/quiescence (workstream C) are needed (that is a separate,
claim-incident-triggered decision, deliberately excluded from this criterion; see "Excluded evidence"
below). This document decides one thing: does *phase management* on top of the ledger show enough
real, machine-avoidable friction to justify a deterministic controller.

## Instrument: the human-as-orchestrator bridge

Small `.mjs` CLIs (house style) hitting the SBP HTTP routes, by which the maintainer manually
publishes work-order and phase-mark pheromones and manually checks phase-close. Every action is logged
as NDJSON (`sbpLog`/audit style) with:

- action type (`publish_workorder`, `mark_phase`, `check_close`, …)
- timestamp
- **per-session wall-clock** (start/end of the interactive session containing the action) — this is
  the toil measurement; see "Toil operationalization" below
- outcome (success/error, and for `check_close`: on-time or late/missed)

**Auth mode:** the bridge runs with **real `worker`/`privileged` identity tokens** (Stage 2's
identity/kind mechanism), not open-mode loopback bootstrap — this is deliberate: running the bridge
under real auth accrues operational evidence for Stage 2's class gating as a side effect, at zero
extra cost.

## Bound workload (closes the "usage is endogenous" gap)

`[TO BE FROZEN IN STAGE 4]`: the prereg must record, before the window opens, the **specific set of
already-planned deliveries** for the observation window and commit that *all* of them route through
the bridge. Cycle counts below are read against this recorded intended workload, not against
whatever the maintainer happens to run — closing the channel by which usage could be gamed upward
(padding cycles) or downward (avoiding the bridge to force a null result).

## Toil operationalization

**Primary measure:** toil/week = summed per-session wall-clock (bridge-CLI-stamped) across all bridge
sessions in a week.

**Fallback** (if wall-clock proves too noisy — e.g. sessions interleaved with unrelated work):
`action-count × per-action cost estimate`, where the per-action estimate is itself recorded in this
document *before* the window opens (not fit to the data afterward).

**Baseline for deriving thresholds:** `[TO BE FROZEN IN STAGE 4]` — a short baseline estimate
(e.g. from the first 1–2 bridge-mediated deliveries) of mechanical cost per phase cycle, from which
the high/low thresholds below are *derived*, not chosen by feel.

## Excluded evidence

**Claim-incident evidence (orphaned claims, parallel-claim conflicts) is deliberately excluded from
this criterion.** That evidence class justifies leases/quiescence (workstream C), a different
component with its own conditional trigger (documented in the implementation plan, Stage 4). Wiring
claim-incident evidence into E's justification would let E be blocked by the absence of evidence for
C, or gamed upward by a single contrived second session. E's evidence is phase-management only:

- completed phase-cycle count (against the bound workload above)
- measured toil (above)
- **machine-avoidable phase-management failures** — missed or late phase-close, out-of-order
  transition, a phase mark published against the wrong prior state — failures a deterministic checker
  would not make, as distinct from coordination/claim conflicts between concurrent agents.

## Decision rule (must partition every possible log into exactly one verdict)

`[TO BE FROZEN IN STAGE 4 — thresholds derived from the baseline above, not chosen by feel]`

- **Justified** — cycles ≥ `[derived-high]` **and** toil/week ≥ `[derived-high]` **and** ≥1 recorded
  machine-avoidable phase-management failure.
- **Rejected-for-window** — toil/week < `[derived-low]` (no pain worth automating) **or** the bound
  workload completed with cycles < `[derived-low]` (too little phase structure to manage).
- **Inconclusive** — anything else. Action: extend the window **once** by `[N]` weeks under the same
  bound-workload discipline; re-evaluate against this same rule. If still not `Justified` after the
  extension, it **defaults to `Rejected-for-window`.**

No log outcome may fall outside these three buckets — if a real log doesn't fit, the rule was
mis-specified and must be fixed *before* being applied to that data, with the fix and its date
recorded here.

## Re-evaluation triggers (a `Rejected-for-window` verdict is not silently permanent)

A `Rejected-for-window` verdict reopens the question **only** on one of these named triggers, never
by re-running the same window:

- a second human contributor begins using the bridge regularly,
- a second repository adopts the bridge,
- a sustained upward toil trend is observed across ≥2 *later*, independently-windowed observation
  periods.

## Verdict record

`[TO BE FILLED AFTER THE WINDOW CLOSES]`

| Field | Value |
|---|---|
| Window dates | — |
| Bound workload (recorded before window opened) | — |
| Cycles completed | — |
| Toil/week (measured) | — |
| Machine-avoidable phase-management failures | — |
| **Verdict** | — |
| If `Justified`: cites this record as evidence in ADR-0016-successor positioning ADR | — |
| If `Rejected-for-window`: negative result recorded in Stage 4b synthesis doc; reopens only on a named trigger above | — |

## What this document is not

Not a merge gate on outcome — CI does not (and must not) assert `Justified` or `Rejected`; only a
human evaluates the frozen rule against the log, per the same claims-boundary discipline as
[ADR-0015](../adr/0015-empirical-evaluation-study-claims.md) §2 ("green = effective" is forbidden as a
merge-gate requirement). Not a statement that the medium has failed if `Justified` — a justified
orchestrator is a thesis *amendment with evidence*, not a repudiation; the original rejections of
mega-orchestrator prompts and in-tree agent runtimes stand unamended either way.

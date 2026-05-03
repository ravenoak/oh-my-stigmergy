# OpenCode effectiveness study protocol (oh-my-stigmergy)

**Protocol version:** 1.0.0  
**Normative ADR:** [ADR-0015](../adr/0015-empirical-evaluation-study-claims.md) (claims boundary; aligns with [ADR-0004](../adr/0004-verification-stack-layering.md))

This document is the **canonical** task, metric, and conditions definition for controlled evaluations of **OpenCode** with [`@oh-my-stigmergy/opencode-plugin`](../../packages/opencode-plugin/README.md) and [`@oh-my-stigmergy/sbp-server`](../../packages/sbp-server/README.md) on **real code** (external OSS repositories at pinned commits). [docs/guides/stigmergy-evaluation-discipline.md](../guides/stigmergy-evaluation-discipline.md) explains why **CI** does not substitute for this protocol.

## Objectives

- Measure whether the **default stigmergy stack** (plugin + project-local SBP supervision when `SBP_URL` is unset, per [ADR-0014](../adr/0014-sbp-project-supervision.md)) improves **pre-registered primary metrics** versus a **control** condition, for **fixed** task instructions and **versioned** success rubrics.
- Preserve **falsifiability**: negative or null results are valid and should be reported.

## Experimental conditions

| ID | Name | Configuration |
|----|------|-----------------|
| **A** | **Control** | OpenCode on the **task worktree** with **no** `@oh-my-stigmergy/opencode-plugin` in the OpenCode config (or plugin **disabled** per host docs). **No** project-local supervision: set `STIGMERGY_SUPERVISE=0` or start SBP **manually** if the task requires a ledger; control whether SBP is used at all **per task rubric** (document in task bank). |
| **B** | **Treatment** | `@oh-my-stigmergy/opencode-plugin` listed per [golden path](../guides/opencode-stigmergy-golden-path.md); **`SBP_URL` unset** so supervision applies; **`STIGMERGY_AUDIT_LOG_FILE`** set to a writable NDJSON path for the run. |

**Design stance:** **Crossover within-subject** when feasible: same participant completes **one task from difficulty class D** under A and **another task from class D** under B (order **counterbalanced** across participants). **Washout:** document whether same calendar day is allowed; minimum washout **≥ 24 h** recommended when switching plugin stacks on the same machine.

**Phase 20 scope:** Condition **B2** (orchestration policy file present vs defaults-only) is **out of scope** until a **protocol version ≥ 1.1** registers it after a pilot suggests signal.

## Metric definitions

### Primary metrics

| ID | Name | Definition | Unit |
|----|------|------------|------|
| **M1** | **Time-to-rubric-pass** | Wall time from **task start** (first prompt commit or agreed timestamp logged by participant) until **all** rubric criteria for the task id are satisfied (see appendix). | minutes |
| **M2** | **Task success** | Binary **1** iff rubric pass **without** disqualifying deviations (cheating rubric, wrong repo); **0** otherwise. Independently scored where feasible. | dimensionless |

### Secondary metrics (mechanism / efficiency proxies)

| ID | Name | Definition | Unit |
|----|------|------------|------|
| **M3** | **Misconfiguration events** | Count of audit lines with `event` in `{ supervision_resolve_failed, supervision_spawn_timeout, supervision_outer_timeout }` **plus** explicit `sbp_error:` outcomes on supervised attach attempts recorded in [`STIGMERGY_AUDIT_LOG_FILE`](../../packages/opencode-plugin/README.md). Optional: add HTTP failures from `SBP_LOG_FILE` when SBP is enabled (same run window). | count per task |
| **M4** | **Coordination redundancy proxy** | **(a)** Count of `tool_execute` audit rows with `tool=stigmergy_publish`. **(b)** When **SBP persistence** is enabled for the task, count duplicate **`POST /pheromones`** successes with the same logical **pheromone id** from ledger replay or logs (preferred when available). Report **(a)** always; **(b)** when ledger artifact exists. | count per task |

Primary inference uses **M1** and **M2**; **M3**/**M4** explain mechanisms and admit falsification (e.g. ledger ignored).

### Reporting rules

- **Pilot** (small N): report **M1** median / range, **M2** proportion, **M3**/**M4** totals; label **feasibility pilot** — no population-wide claims.
- **Full study:** pre-register **target N** (task completions); paired tests or bootstrap CI on **log(M1)** if assumptions documented; **α** and stopping rule fixed **before** data collection.

## Task bank

Tasks must use **real** OSS codebases at **pinned SHAs** (fork mirrors allowed). Replace placeholders before pilot execution.

| Task id | Repository URL | SHA | Difficulty class | Rubric id | Notes |
|---------|------------------|-----|------------------|-----------|-------|
| **smoke-oms** | `https://github.com/ravenoak/oh-my-stigmergy` | *(pinned tag/commit)* | smoke | R-smoke | **Excluded from primary inference** — harness validation only |
| **ext-001** | *(TBD)* | *(TBD)* | easy | R-ext-easy | External OSS; failing test or small fix |
| **ext-002** | *(TBD)* | *(TBD)* | medium | R-ext-med | Feature slice behind flag or comparable |

**Inclusion criteria:** public licence compatible with study use; build/test instructions reproducible; task completes within **session budget** ([agent-session-budgets](../guides/agent-session-budgets.md)).

**Exclusion:** tasks requiring secrets not available to participants.

## Analysis and reporting

- Store raw artefacts per run: redacted **audit NDJSON**, optional **SBP log**, **participant notes**, **wall-clock timestamps** for M1 boundaries.
- Summarize audit logs with [`devtools/evaluation/summarize-audit.mjs`](../../devtools/evaluation/summarize-audit.mjs) (deterministic).
- Publish dated summaries under [`results/`](results/) (see [`README.md`](README.md)); cite **protocol version** and **task bank SHA column**.

## Data retention and ethics

- **Retention:** retain raw logs until analysis complete + agreed cooling-off period (default **90 days**); then delete or aggregate per team policy.
- **Consent:** if participants are external humans, obtain consent consistent with your jurisdiction and institution; this repo does not supply IRB approval.
- **PII:** do not commit secrets or personal identifiers into `docs/research/results/`.

## Appendix: Rubric skeleton

Rubrics **R-smoke**, **R-ext-easy**, **R-ext-med** must be expanded with **checklist bullets** and **disqualifiers** before first pilot; bump protocol minor version when rubrics change materially.

**Example bullets (illustrative only):**

- **R-smoke:** `npm test` or repo-equivalent passes in `packages/opencode-plugin`; workspace matches pinned SHA.
- **R-ext-easy:** Specified tests green; change confined to named paths.

---

## References

- [0004-verification-stack-layering.md](../adr/0004-verification-stack-layering.md)
- [0015-empirical-evaluation-study-claims.md](../adr/0015-empirical-evaluation-study-claims.md)

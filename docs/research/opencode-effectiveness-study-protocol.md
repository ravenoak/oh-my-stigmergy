# OpenCode effectiveness study protocol (oh-my-stigmergy)

**Protocol version:** 1.1.0  
**Normative ADR:** [ADR-0015](../adr/0015-empirical-evaluation-study-claims.md) (claims boundary; aligns with [ADR-0004](../adr/0004-verification-stack-layering.md))

This document is the **canonical** task, metric, and conditions definition for controlled evaluations of **OpenCode** with [`@oh-my-stigmergy/opencode-plugin`](../../packages/opencode-plugin/README.md) and [`@oh-my-stigmergy/sbp-server`](../../packages/sbp-server/README.md) on **real code** (external OSS repositories at pinned commits). [docs/guides/stigmergy-evaluation-discipline.md](../guides/stigmergy-evaluation-discipline.md) explains why **CI** does not substitute for this protocol.

## Objectives

- Measure whether the **default stigmergy stack** under **Condition B1** (plugin + project-local SBP supervision when `SBP_URL` is unset, per [ADR-0014](../adr/0014-sbp-project-supervision.md), with **defaults-only** orchestration) improves **pre-registered primary metrics** versus **Condition A** (control), for **fixed** task instructions and **versioned** success rubrics.
- Where registered, measure whether an **explicit orchestration policy file** (**Condition B2**) changes outcomes versus **B1** on the same task bank.
- Preserve **falsifiability**: negative or null results are valid and should be reported.

## Experimental conditions

| ID | Name | Configuration |
|----|------|-----------------|
| **A** | **Control** | OpenCode on the **task worktree** with **no** `@oh-my-stigmergy/opencode-plugin` in the OpenCode config (or plugin **disabled** per host docs). **No** project-local supervision: set `STIGMERGY_SUPERVISE=0` or start SBP **manually** if the task requires a ledger; control whether SBP is used at all **per task rubric** (document in task bank). |
| **B1** | **Treatment — defaults-only orchestration** | `@oh-my-stigmergy/opencode-plugin` listed per [golden path](../guides/opencode-stigmergy-golden-path.md); **`SBP_URL` unset** so supervision applies; **`STIGMERGY_AUDIT_LOG_FILE`** set to a writable NDJSON path; **`STIGMERGY_ORCHESTRATION_CONFIG` unset** (plugin uses built-in defaults from [`packages/opencode-plugin/src/orchestration.mjs`](../../packages/opencode-plugin/src/orchestration.mjs)). |
| **B2** | **Treatment — explicit orchestration policy** | Same as **B1**, plus **`STIGMERGY_ORCHESTRATION_CONFIG`** set to an absolute or workspace-relative path of a JSON file that validates against [`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json). Log the resolved path in run notes; use real provider/model ids for your OpenCode host (see [fixtures/orchestration.policy.example.json](fixtures/orchestration.policy.example.json) **only** as a structural template — replace placeholders before production runs). |

**Design stance — primary stack comparison:** **Crossover within-subject** when feasible: same participant completes **one task from difficulty class D** under **A** and **another task from class D** under **B1** (order **counterbalanced** across participants). **Primary inference** for “does the default stack help?” uses **A vs B1** unless a study **pre-registers** a different contrast.

**Design stance — orchestration increment:** To test explicit policy vs defaults, compare **B1 vs B2** on matched tasks (same participant optional). Prefer **≥ 24 h washout** between B1 and B2 on the same machine if orchestration env vars are reused; document same-day runs as a limitation.

**Protocol lineage:** Studies executed under **protocol 1.0.x** (single treatment row **B**) remain valid archive; **1.1.0** replaces **B** with **B1**/**B2** for new runs. When citing historic results, map legacy **B** → **B1** unless the original run used an orchestration file (then map to **B2**).

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

Primary inference for the **stack** uses **M1** and **M2** under **A vs B1**; **B1 vs B2** comparisons address **orchestration policy** only when **pre-registered**. **M3**/**M4** explain mechanisms and admit falsification (e.g. ledger ignored).

### Reporting rules

- **Pilot** (small N): report **M1** median / range, **M2** proportion, **M3**/**M4** totals; label **feasibility pilot** — no population-wide claims.
- **Full study:** pre-register **target N** (task completions); paired tests or bootstrap CI on **log(M1)** if assumptions documented; **α** and stopping rule fixed **before** data collection.

## Task bank

Tasks use **real** OSS codebases at **pinned SHAs** (fork mirrors allowed). Update SHAs when upstream moves only if you **re-validate** rubrics and bump protocol patch version.

| Task id | Repository URL | SHA (full) | Difficulty class | Rubric id | Notes |
|---------|------------------|------------|------------------|-----------|-------|
| **smoke-oms** | `https://github.com/ravenoak/oh-my-stigmergy` | `f4d5016f163c1eeb201b3fc65a3488e4b2f524d0` | smoke | R-smoke | **Excluded from primary inference** — in-repo harness; pin advances with `main` doc updates |
| **ext-001** | `https://github.com/sindresorhus/is-plain-obj` | `97f38e8836f86a642cce98fc6ab3058bc36df181` | easy | R-ext-easy | Small ESM package; typical task: clone, install, run tests (see rubric) |
| **ext-002** | `https://github.com/chalk/chalk` | `aa06bb5ac3f14df9fda8cfb54274dfc165ddfdef` | medium | R-ext-med | Larger surface; typical task: install, test, then small doc/code edit per rubric |

**Inclusion criteria:** public licence compatible with study use; build/test instructions reproducible; task completes within **session budget** ([agent-session-budgets](../guides/agent-session-budgets.md)).

**Exclusion:** tasks requiring secrets not available to participants.

## Analysis and reporting

- Store raw artefacts per run: redacted **audit NDJSON**, optional **SBP log**, **participant notes**, **wall-clock timestamps** for M1 boundaries.
- Summarize audit logs with [`devtools/evaluation/summarize-audit.mjs`](../../devtools/evaluation/summarize-audit.mjs) (deterministic).
- Publish dated summaries under [`results/`](results/) (see [`README.md`](README.md)); cite **protocol version** and **task bank SHA column**.

### Pre-registered hypotheses (falsifiable; not merge-gated)

| ID | Hypothesis | Falsification pattern |
|----|------------|------------------------|
| **H_stack** | The default stigmergy stack (**B1**) improves **M1**/**M2** vs **A** for the fixed task bank. | Null or negative effect on **M1** median / **M2** proportion at registered **N**. |
| **H_orch** | An explicit orchestration policy (**B2**) improves **M1**/**M2** vs **B1** for the same tasks. | Null or negative effect when **B1↔B2** is run per design stance. |
| **H_mech** | Failures are dominated by misconfiguration or coordination noise. | High **M3** or **M4** with low **M2** (document per-run). |

## Data retention and ethics

- **Retention:** retain raw logs until analysis complete + agreed cooling-off period (default **90 days**); then delete or aggregate per team policy.
- **Consent:** if participants are external humans, obtain consent consistent with your jurisdiction and institution; this repo does not supply IRB approval.
- **PII:** do not commit secrets or personal identifiers into `docs/research/results/`.

## Appendix: Rubrics (versioned with protocol)

**Disqualifiers (all tasks):** Wrong repository or SHA; secrets committed; rubric items skipped without documenting protocol deviation.

### R-smoke (smoke-oms)

**Goal:** Confirm local clone matches pinned SHA and plugin package tests pass.

**Pass / M2 = 1 when all hold:**

- Git checkout at task bank SHA (or descendant tag containing that commit documented in run notes).
- `cd packages/opencode-plugin && npm ci && npm test` exits **0**.

**M1 start:** timestamp when participant begins first shell command for the task; **M1 end:** successful exit of `npm test`.

### R-ext-easy (ext-001)

**Goal:** Measure baseline tool friction on a minimal external repo.

**Pass / M2 = 1 when all hold:**

- Clean clone at pinned SHA `97f38e8836f86a642cce98fc6ab3058bc36df181`.
- Run `npm install` then `npm test` per repository layout (root `package.json`); both exit **0**.
- No source changes required for pass (familiarization / environment smoke).

**M1:** Start at clone complete; end at first full `npm test` success.

### R-ext-med (ext-002)

**Goal:** Small real edit with tests still green.

**Pass / M2 = 1 when all hold:**

- Clean clone at pinned SHA `aa06bb5ac3f14df9fda8cfb54274dfc165ddfdef`.
- `npm install` and `npm test` exit **0** before edit.
- Exactly **one** intentional change: chalk uses root `readme.md` — insert as **first line** the HTML comment `<!-- study-marker -->` (valid in GitHub-flavored Markdown). If upstream layout forbids it, document an equivalent single-line non-functional prefix in run notes and treat as protocol deviation.
- `npm test` exits **0** after the edit.

**M1:** Start at clone complete; end when post-edit `npm test` succeeds.

---

## References

- [0004-verification-stack-layering.md](../adr/0004-verification-stack-layering.md)
- [0015-empirical-evaluation-study-claims.md](../adr/0015-empirical-evaluation-study-claims.md)

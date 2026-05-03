# Feasibility pilot runbook (Conditions A, B1, B2)

Use with [opencode-effectiveness-study-protocol.md](opencode-effectiveness-study-protocol.md) **protocol version 1.1.0**. This file is operator guidance; it does not change merge-gated claims ([ADR-0015](../adr/0015-empirical-evaluation-study-claims.md)).

Record pilot lifecycle in **[FEASIBILITY_PILOT_STATUS.md](FEASIBILITY_PILOT_STATUS.md)** (`NotStarted` → `InProgress` → `Complete` or `Declined`).

## Preconditions

- OpenCode host + `@oh-my-stigmergy/opencode-plugin` installed per [guides/opencode-stigmergy-golden-path.md](../guides/opencode-stigmergy-golden-path.md). Keep `@opencode-ai/plugin` aligned with [opencode-compatibility.md](../operations/opencode-compatibility.md) when upgrading (`packages/opencode-plugin/package.json`).
- **Audit log** enabled (`STIGMERGY_AUDIT_LOG_FILE` set); NDJSON path recorded per session.
- **B2 only:** `STIGMERGY_ORCHESTRATION_CONFIG` points to a JSON file that matches [`packages/opencode-plugin/schema/orchestration.schema.json`](../../packages/opencode-plugin/schema/orchestration.schema.json); copy [fixtures/orchestration.policy.example.json](fixtures/orchestration.policy.example.json) and **replace** placeholder provider/model strings with ids valid for your OpenCode host.
- Git, Node.js (versions per upstream repos), and network access for clones/installs.

## Sessions (minimum feasibility)

**Primary stack comparison (A vs B1):** run **two** sessions — one under **A**, one under **B1** (order counterbalanced if two participants or repeat visits).

| Session | Condition | Configuration summary |
|---------|-----------|-------------------------|
| **A** | Control | No plugin / disabled per protocol table; no unsupervised-default supervision unless rubric says otherwise. |
| **B1** | Treatment, defaults-only orchestration | Plugin + `SBP_URL` unset + audit log + **`STIGMERGY_ORCHESTRATION_CONFIG` unset**. |
| **B2** | Treatment, explicit policy | Same as B1 + **`STIGMERGY_ORCHESTRATION_CONFIG`** set to your validated policy file path. |

**Orchestration contrast (B1 vs B2):** optional third/fourth sessions on the **same** task class; prefer **≥ 24 h washout** when switching only the orchestration file on one machine.

Record **wall-clock timestamps** for:

- **M1** window start/end per task (protocol metric definitions).
- **M2** outcome (pass/fail per rubric).
- **M3/M4** from NDJSON via `node devtools/evaluation/summarize-audit.mjs <audit.ndjson>` after each session.

## Task order (feasibility)

1. **smoke-oms** — R-smoke (in-repo pin); validates harness only.
2. **ext-001** — R-ext-easy (`is-plain-obj` SHA in task bank).
3. **ext-002** — R-ext-med (`chalk` SHA in task bank).

## Lab pipeline smoke (no OpenCode required)

To verify the summarizer on a **fixture** (does **not** substitute for human pilot):

```bash
node devtools/evaluation/summarize-audit.mjs docs/research/fixtures/lab-audit.ndjson
```

Expected CSV row is captured in [results/2026-04-29-lab-pipeline-smoke.md](results/2026-04-29-lab-pipeline-smoke.md).

## After the pilot

- Store raw NDJSON and notes outside the repo or in agreed restricted storage; add a dated summary under [results/](results/) when publishing findings.
- Update [FEASIBILITY_PILOT_STATUS.md](FEASIBILITY_PILOT_STATUS.md) to **Complete** with a link to that summary, or **Declined** with one stated reason.

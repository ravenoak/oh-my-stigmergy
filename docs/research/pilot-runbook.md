# Feasibility pilot runbook (Conditions A and B)

Use with [opencode-effectiveness-study-protocol.md](opencode-effectiveness-study-protocol.md) **protocol version 1.0.1**. This file is operator guidance; it does not change merge-gated claims ([ADR-0015](../adr/0015-empirical-evaluation-study-claims.md)).

## Preconditions

- OpenCode host + `@oh-my-stigmergy/opencode-plugin` installed per [guides/opencode-stigmergy-golden-path.md](../guides/opencode-stigmergy-golden-path.md). Keep `@opencode-ai/plugin` aligned with [opencode-compatibility.md](../operations/opencode-compatibility.md) when upgrading (`packages/opencode-plugin/package.json`).
- **Audit log** enabled (`STIGMERGY_AUDIT_LOG_FILE` set); NDJSON path recorded per session.
- Git, Node.js (versions per upstream repos), and network access for clones/installs.

## Condition A vs B

Execute two **sessions** (same participant optional for feasibility; note in run log):

| Session | Condition | Orchestration |
|---------|-----------|----------------|
| **A** | Baseline | Per operator default (document exact plugin/OpenCode versions). |
| **B** | Treatment | Document any distinct routing/orchestration settings required by the protocol table (same plugin major as compatibility doc unless study intentionally varies). |

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

- Store raw NDJSON and notes outside the repo or in agreed restricted storage; optional dated summary under [results/](results/).
- If orchestration A/B should continue, follow roadmap **Phase 20 follow-on** (protocol ≥ 1.1, Condition B2) before changing CI verify scripts.

# Lab pipeline smoke — audit summarizer (fixture)

**Date:** 2026-04-29  
**Protocol:** [opencode-effectiveness-study-protocol.md](../opencode-effectiveness-study-protocol.md) **version 1.1.0** (fixture smoke only; protocol evolved since original lab note).

This artifact exercises **`devtools/evaluation/summarize-audit.mjs`** on checked-in NDJSON only. It does **not** report human effectiveness, OpenCode sessions, or Conditions A/B outcomes ([ADR-0015](../../adr/0015-empirical-evaluation-study-claims.md)).

## Input

`docs/research/fixtures/lab-audit.ndjson` — synthetic lines with `tool_execute` (including `stigmergy_publish`) and one `supervision_resolve_failed` event.

## Command

```bash
node devtools/evaluation/summarize-audit.mjs docs/research/fixtures/lab-audit.ndjson
```

## Output (CSV)

```
misconfiguration_events,tool_execute_total,stigmergy_publish_count
1,2,1
```

**Interpretation (M3/M4 helpers):** `misconfiguration_events` = 1; `tool_execute_total` = 2; `stigmergy_publish_count` = 1 — deterministic fixture counts only.

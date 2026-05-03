# Evaluation log helpers (Phase 20)

Deterministic tools for **post-hoc** summarization of [`STIGMERGY_AUDIT_LOG_FILE`](../../packages/opencode-plugin/README.md) NDJSON lines. No LLM; no network.

## summarize-audit.mjs

Reads one NDJSON audit file (one JSON object per line), prints CSV summary to stdout.

```bash
node devtools/evaluation/summarize-audit.mjs path/to/audit.ndjson
```

**Columns (single aggregate row):**

- `misconfiguration_events` — counts supervision failures/timeouts per protocol **M3**.
- `tool_execute_total` — all `tool_execute` rows.
- `stigmergy_publish_count` — subset with `tool=stigmergy_publish` for **M4(a)**.

**Limitation:** Duplicate pheromone IDs (**M4(b)**) require SBP ledger data when enabled — parse separately.

## References

- [docs/research/opencode-effectiveness-study-protocol.md](../../docs/research/opencode-effectiveness-study-protocol.md)
- [ADR-0015](../../docs/adr/0015-empirical-evaluation-study-claims.md)

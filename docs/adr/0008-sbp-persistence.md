# ADR-0008: SBP ledger persistence (append-only JSONL)

## Status

Accepted

## Context

The reference [`packages/sbp-server`](../../packages/sbp-server) keeps pheromones and claims in memory. Agents coordinating across process restarts need a **durable** ledger without introducing external databases in the default developer path.

## Decision

- **Durability format:** append-only **JSONL** (one JSON object per line) on a configurable file path, using Node `fs.appendFileSync` for each mutation.
- **Event types:** `publish` (full validated pheromone body), `claim` (`id` + `token`), `inflate` (`id` only — intensity is recomputed on replay using the same rule as the in-memory server).
- **Replay:** on startup, read the file line-by-line; **skip** lines that fail `JSON.parse` (covers truncated tail after crash). Apply events in order; duplicate `claim` lines for the same `id` are ignored (first claim wins).
- **Default:** in-memory store when no path is passed to `createLedgerServer()` — existing tests unchanged.
- **Redis / SQL:** JSONL scope for this ADR; **SQLite** ledger path is [ADR-0011](0011-sbp-sqlite-store.md) (`SBP_LEDGER_SQLITE`, `better-sqlite3`).

## Consequences

- Disk growth is unbounded without rotation — mitigated by in-tree **compaction / decay GC** in [ADR-0009](0009-sbp-ledger-compaction-decay-gc.md) (reference implementation; operators still manage backups).
- Concurrent multi-writer processes are not supported (single-file append); matches reference-server expectations.

## Verification

- [`packages/sbp-server/test/durability.test.mjs`](../../packages/sbp-server/test/durability.test.mjs) exercises restart replay and truncated-tail recovery.

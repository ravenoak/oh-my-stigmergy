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
- **Redis / SQL:** out of scope for this ADR; park in [BACKLOG.md](../BACKLOG.md) if scale demands it.

## Consequences

- Disk growth is unbounded without rotation — acceptable for a reference implementation; production deployments should add compaction or external storage via a future ADR.
- Concurrent multi-writer processes are not supported (single-file append); matches reference-server expectations.

## Verification

- [`packages/sbp-server/test/durability.test.mjs`](../../packages/sbp-server/test/durability.test.mjs) exercises restart replay and truncated-tail recovery.

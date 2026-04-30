# ADR-0011: SBP ledger — SQLite store (`better-sqlite3`)

## Status

Accepted

## Context

[ADR-0008](0008-sbp-persistence.md) and [ADR-0009](0009-sbp-ledger-compaction-decay-gc.md) standardised append-only **JSONL** plus compaction/decay GC. Scale and operability notes still pointed at Redis/SQL as future work. [ADR-0004](0004-verification-stack-layering.md) and **NFR-D2** discourage claiming external databases in the default developer path.

## Decision

1. **Store:** **`better-sqlite3`** (single native npm dependency, synchronous API aligned with the existing `JsonlLedgerStore` contract). **Rejected for default CI path:** **`node:sqlite`** (experimental / runner noise) and **Redis** (external service; conflicts with graph SQLite precedent in [ADR-0007](0007-graph-persistence.md) and `NFR-D2` honesty).
2. **Redis (permanent rejection for the FR-3.x reference path):** **Network Redis** is not adopted as mandatory or default coordination storage for the in-tree SBP server. **In-process Redis-protocol emulators** (e.g. Node libraries that speak the Redis wire protocol in-memory) are also **rejected** for **durable** ledger responsibilities: they introduce a second store narrative without an RTM win over JSONL + SQLite, and their durability and operational story are weaker than the committed `JsonlLedgerStore` / `SqliteLedgerStore` pair ([NFR-D1](../requirements/NFR.md)). This decision **supersedes** any inspiration-essay language that names Redis for the coordination layer; normative storage for this repository is [ADR-0008](0008-sbp-persistence.md) + this ADR.
3. **Schema:** `pheromones(id TEXT PRIMARY KEY, json TEXT NOT NULL, published_at INTEGER NOT NULL, inflations INTEGER NOT NULL DEFAULT 0)`; `claims(id TEXT PRIMARY KEY, token TEXT NOT NULL, claimed_at INTEGER NOT NULL)`; `PRAGMA journal_mode=WAL`; `PRAGMA synchronous=NORMAL`; `busy_timeout` for short multi-writer contention.
4. **Env:** `SBP_LEDGER_SQLITE=<path>` selects `SqliteLedgerStore`. **Mutually exclusive** with `SBP_LEDGER_JSONL` — the standalone entrypoint exits with an error if both are set.
5. **Compaction:** `compactSqliteLedger(path)` mirrors JSONL semantics: **delete** claimed pheromones whose `currentIntensity` is **strictly below** `SBP_DECAY_GC_FLOOR` (same shape `{ kept, dropped }` as `compactJsonlLedger`). `bin/compact.mjs` chooses JSONL vs SQLite by file suffix (`.db` / `.sqlite` ⇒ SQLite).
6. **Multi-writer:** JSONL uses an **exclusive directory lock** (`${ledger}.sbp-writer-lock` via `mkdir`); a second writer fails fast with code **`ELEDGERLOCKED`** (process exit **75** in the standalone server). SQLite relies on **`busy_timeout`** + bounded retries at the driver level for `SQLITE_BUSY`.
7. **Rotation signal:** `SBP_LEDGER_MAX_BYTES` — when the ledger file exceeds this size at a decay-GC tick, compaction runs with **`forceSizeRotation`** (aggressive floor) to encourage row drops independent of the usual decay cadence.
8. **Observability:** `GET /healthz` returns JSON `{ ok, store, replayedAt, pheromones, claims }`. Compaction emits `sbpLog({ event: "compaction_done", store, kept, dropped, durationMs, bytesBefore, bytesAfter })`.
9. **Intensity helper:** shared [`packages/sbp-server/intensity.mjs`](../../packages/sbp-server/intensity.mjs) exports `currentIntensity` (re-exported from [`server.mjs`](../../packages/sbp-server/server.mjs)).

## Consequences

- Linux CI must install a `better-sqlite3` prebuild compatible with the runner’s Node/glibc (pinned in `package-lock.json`).
- Operators manage SQLite files like graph DBs: backups, optional `VACUUM` after large compactions (see runbook).

## Verification

- [`packages/sbp-server/test/sqlite-store.test.mjs`](../../packages/sbp-server/test/sqlite-store.test.mjs), [`healthz.test.mjs`](../../packages/sbp-server/test/healthz.test.mjs), [`multi-writer.test.mjs`](../../packages/sbp-server/test/multi-writer.test.mjs), extended [`compaction.test.mjs`](../../packages/sbp-server/test/compaction.test.mjs).

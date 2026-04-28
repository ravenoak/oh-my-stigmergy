# SBP reference ledger — operator runbook

This runbook covers the **append-only JSONL** ledger from [ADR-0008](../adr/0008-sbp-persistence.md), **SQLite** ledger from [ADR-0011](../adr/0011-sbp-sqlite-store.md), and **compaction / decay GC** from [ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md) for [`packages/sbp-server`](../../packages/sbp-server).

## Single-writer / lock semantics

- **JSONL:** the server takes an **exclusive writer lock** (`mkdir` on `${ledger}.sbp-writer-lock`). Only one live `JsonlLedgerStore` should own a path; a second process fails fast (**exit 75** in the standalone entrypoint). Release the lock by stopping the owning process (tests call `releaseWriterLock()`).
- **SQLite:** multiple writers are **not** supported as a product feature; `better-sqlite3` uses `busy_timeout` so transient contention fails gracefully instead of corrupting. Prefer a single writer; run **`VACUUM`** offline after large compactions if file size matters.

Do **not** run compaction (CLI or in-process timer) while another process appends to the same **JSONL** file. Stop the server (or pause writers), compact, then restart. For **SQLite**, stop writers before `VACUUM` or file copy.

## Rotation (copy-truncate pattern)

### JSONL

1. Stop the server using `SBP_LEDGER_JSONL`.
2. Copy the ledger: `cp ledger.jsonl ledger-$(date -u +%Y%m%dT%H%M%SZ).jsonl`.
3. Optionally compact the copy for archival analysis; keep the live path unchanged until you are ready to swap.
4. Start the server again.

### SQLite

1. Stop the server using `SBP_LEDGER_SQLITE`.
2. Copy the DB file: `cp ledger.db ledger-$(date -u +%Y%m%dT%H%M%SZ).db`.
3. Optionally run `sqlite3 ledger.db 'VACUUM;'` on a **copy** to reclaim space after heavy compaction; swap paths only when quiesced.
4. Start the server again.

## Compaction (manual)

Compaction **rewrites** the ledger in place (atomic `rename` after writing `*.compact.tmp`).

```bash
cd packages/sbp-server
node bin/compact.mjs /path/to/ledger.jsonl
# or SQLite:
node bin/compact.mjs /path/to/ledger.db
```

Stdout is one JSON line: `{"kept":N,"dropped":M}`.

Environment:

- **`SBP_DECAY_GC_FLOOR`** — intensity floor (default `0.01`). Claimed pheromones with `currentIntensity` **strictly below** this value after replay are **dropped**.

Override for a one-off run is not wired in the CLI; set the env var in the shell before invoking `node bin/compact.mjs` (the server and `compactJsonlLedger` read the same default).

## In-process decay GC (opt-in)

When running **`node server.mjs`** with **`SBP_LEDGER_JSONL`** or **`SBP_LEDGER_SQLITE`**:

- Set **`SBP_DECAY_GC_INTERVAL_MS`** to a positive interval (milliseconds) to run compaction on that path periodically (`compactJsonlLedger` vs `compactSqliteLedger` is selected automatically).
- Leave unset or `0` to disable (default).
- **`SBP_LEDGER_MAX_BYTES`:** when set, a tick that sees the ledger file **larger** than this threshold runs compaction with **size-rotation** semantics (see [ADR-0011](../adr/0011-sbp-sqlite-store.md)).

`SIGINT` / `SIGTERM` stop the timer hook (best-effort).

## Health check

- **`GET /healthz`** — JSON `{ ok, store, replayedAt, pheromones, claims }` for liveness probes when using a durable store.

## Replay verification

After compaction or rotation, start the server once and hit **`GET /pheromones`** to confirm expected rows; use [`docs/operations/sbp-slo.md`](sbp-slo.md) load tests locally if you changed decay parameters.

## Related

- [SBP SLOs](sbp-slo.md) — latency / log contracts.
- [ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md) — algorithm and verification tests.
- [ADR-0011](../adr/0011-sbp-sqlite-store.md) — SQLite ledger + rotation / multi-writer notes.

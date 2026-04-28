# SBP reference ledger — operator runbook

This runbook covers the **append-only JSONL** ledger from [ADR-0008](../adr/0008-sbp-persistence.md) and **compaction / decay GC** from [ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md) for [`packages/sbp-server`](../../packages/sbp-server).

## Single-writer assumption

Do **not** run compaction (CLI or in-process timer) while another process appends to the same file. Stop the server (or pause writers), compact, then restart.

## Rotation (copy-truncate pattern)

1. Stop the server using `SBP_LEDGER_JSONL`.
2. Copy the ledger: `cp ledger.jsonl ledger-$(date -u +%Y%m%dT%H%M%SZ).jsonl`.
3. Optionally compact the copy for archival analysis; keep the live path unchanged until you are ready to swap.
4. Start the server again.

## Compaction (manual)

Compaction **rewrites** the ledger in place (atomic `rename` after writing `*.compact.tmp`).

```bash
cd packages/sbp-server
node bin/compact.mjs /path/to/ledger.jsonl
```

Stdout is one JSON line: `{"kept":N,"dropped":M}`.

Environment:

- **`SBP_DECAY_GC_FLOOR`** — intensity floor (default `0.01`). Claimed pheromones with `currentIntensity` **strictly below** this value after replay are **dropped**.

Override for a one-off run is not wired in the CLI; set the env var in the shell before invoking `node bin/compact.mjs` (the server and `compactJsonlLedger` read the same default).

## In-process decay GC (opt-in)

When running **`node server.mjs`** with **`SBP_LEDGER_JSONL`**:

- Set **`SBP_DECAY_GC_INTERVAL_MS`** to a positive interval (milliseconds) to run **`compactJsonlLedger`** on that path periodically.
- Leave unset or `0` to disable (default).

`SIGINT` / `SIGTERM` stop the timer hook (best-effort).

## Replay verification

After compaction or rotation, start the server once and hit **`GET /pheromones`** to confirm expected rows; use [`docs/operations/sbp-slo.md`](sbp-slo.md) load tests locally if you changed decay parameters.

## Related

- [SBP SLOs](sbp-slo.md) — latency / log contracts.
- [ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md) — algorithm and verification tests.

# SBP reference server — SLOs and load tests

The in-tree ledger under [`packages/sbp-server`](../../packages/sbp-server) is a **reference** implementation (not production scale). Deterministic checks live in `node --test` (bounded per-test timeouts; run via `npm test` in that package).

## Intensity model

Computed intensity (not stored as a single frozen field):

\[
\text{currentIntensity} = \text{baseIntensity} \cdot e^{-\text{decayRate} \cdot \Delta t_{\text{s}}} + \text{inflations}
\]

- `publishedAt` is set on `POST /pheromones`.
- `inflate` increments the integer `inflations` counter.

## Structured logs

- Set **`SBP_LOG_FILE`** to append **NDJSON** lines `{ ts, event, ... }` for HTTP lifecycle events.
- Set **`SBP_LOG_STDERR=1`** to mirror the same NDJSON to stderr (used in tests).
- To summarize an existing log into coordination metrics, use:

```bash
cd packages/sbp-server && npm run metrics -- /path/to/sbp.ndjson
```

## Load / latency contract (CI)

[`packages/sbp-server/test/load.test.mjs`](../../packages/sbp-server/test/load.test.mjs) publishes **k = 80** pheromones then claims each id, measuring wall-clock per request.

**Target on `ubuntu-24.04` GitHub-hosted runners:** **p95 &lt; 80 ms** per publish and per claim (generous vs sub-ms laptops; avoids flaky CI). The same target applies when tests are pointed at an on-disk **SQLite** ledger (`SqliteLedgerStore`) per [ADR-0011](../adr/0011-sbp-sqlite-store.md).

**Size rotation:** when **`SBP_LEDGER_MAX_BYTES`** is set with an opt-in decay GC interval, oversize ledgers trigger an extra compaction pass; operators may **`VACUUM`** SQLite copies offline after large deletes (runbook).

Run locally:

```bash
cd packages/sbp-server && npm test -- test/load.test.mjs
```

## Ledger growth and GC

- **Compaction** rewrites JSONL in place or **deletes** rows in SQLite (claimed rows whose computed `currentIntensity` is below **`SBP_DECAY_GC_FLOOR`**, default `0.01`, are dropped). See [ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md) and [ADR-0011](../adr/0011-sbp-sqlite-store.md).
- **Opt-in timer:** **`SBP_DECAY_GC_INTERVAL_MS`** triggers periodic compaction when the standalone server runs with **`SBP_LEDGER_JSONL`** or **`SBP_LEDGER_SQLITE`**.
- **Operator procedures:** [sbp-operator-runbook.md](sbp-operator-runbook.md) (stop writer → compact / rotate → verify).

## Related

- [ADR-0008](../adr/0008-sbp-persistence.md) — JSONL durability.
- [ADR-0009](../adr/0009-sbp-ledger-compaction-decay-gc.md) — compaction + decay GC.
- [ADR-0011](../adr/0011-sbp-sqlite-store.md) — SQLite ledger.
- [NFR.md](../requirements/NFR.md) **NFR-O2**, [FR.md](../requirements/FR.md) **FR-3.2** — RTM verification strings.

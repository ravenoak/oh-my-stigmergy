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

## Load / latency contract (CI)

[`packages/sbp-server/test/load.test.mjs`](../../packages/sbp-server/test/load.test.mjs) publishes **k = 80** pheromones then claims each id, measuring wall-clock per request.

**Target on `ubuntu-24.04` GitHub-hosted runners:** **p95 &lt; 80 ms** per publish and per claim (generous vs sub-ms laptops; avoids flaky CI).

Run locally:

```bash
cd packages/sbp-server && npm test -- test/load.test.mjs
```

## Related

- [ADR-0008](../adr/0008-sbp-persistence.md) — JSONL durability.
- [NFR.md](../requirements/NFR.md) **NFR-O2**, [FR.md](../requirements/FR.md) **FR-3.2** — RTM verification strings.

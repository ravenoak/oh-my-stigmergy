# ADR-0009: SBP ledger compaction and decay GC

## Status

Accepted

## Context

[ADR-0008](0008-sbp-persistence.md) chose append-only **JSONL** for durability. Append-only growth is **unbounded** without an operator step. [NFR-D2](../requirements/NFR.md) discourages claiming external services in the default path; **Redis / SQL remain out of scope** (same rationale as ADR-0008).

## Decision

- **Compaction (`compactJsonlLedger`):** replay the existing ledger into memory (same semantics as [`JsonlLedgerStore`](../../packages/sbp-server/server.mjs)), then **rewrite** the file from derived state:
  - **Drop** pheromones whose `currentIntensity` (per `currentIntensity(rec, nowMs)`) is **strictly below** a configurable floor **`SBP_DECAY_GC_FLOOR`** (default **`0.01`**) **and** whose `id` is **claimed** at replay completion. All other records are **retained**.
  - Surviving records are written as **`publish`** lines (full payload, including `publishedAt` and `inflations`) followed by **`claim`** lines where a claim exists, in **lexicographic `id` order** for deterministic bytes. Historical **`inflate`** lines are folded into `inflations` during replay and are not re-emitted.
  - Write to **`${filePath}.compact.tmp`** then **`renameSync`** over `filePath` (atomic replace on POSIX CI).
- **Decay GC timer:** opt-in via **`SBP_DECAY_GC_INTERVAL_MS`** (positive integer, default **off**). When the standalone server runs with **`SBP_LEDGER_JSONL`**, it starts an in-process **`setInterval`** that invokes compaction on that path. Single-writer assumption unchanged from ADR-0008; operators should avoid concurrent writers during compaction (see runbook).
- **Manual CLI:** `node packages/sbp-server/bin/compact.mjs <ledger.jsonl>` for ops (same compaction function).

## Consequences

- Compaction **rewrites** the ledger; truncated-tail tolerance from ADR-0008 applies to the **post-compaction** file on the next startup.
- Low-intensity **unclaimed** pheromones are **not** dropped by this rule (only claimed rows below the floor are GC’d).

## Verification

- [`packages/sbp-server/test/compaction.test.mjs`](../../packages/sbp-server/test/compaction.test.mjs) — deterministic ledger → stable output bytes (`nowMs` fixed).
- [`packages/sbp-server/test/decay-gc.test.mjs`](../../packages/sbp-server/test/decay-gc.test.mjs) — injectable timer + compaction hook proves the scheduler invokes compaction.

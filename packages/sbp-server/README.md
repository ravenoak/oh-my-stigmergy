# SBP server (FR-3.1–FR-3.4)

Minimal **in-process** ledger with **SSE** broadcast (`GET /stream`), pheromone `POST /pheromones`, first-claim wins (`POST /pheromones/:id/claim`), and floor inflation (`POST /pheromones/:id/inflate`).

## Run

```bash
npm install
node server.mjs
```

### Durable ledger (JSONL)

Append-only persistence is opt-in via **`SBP_LEDGER_JSONL`** (path to a `.jsonl` file). The server replays the log on startup; see [ADR-0008](../../docs/adr/0008-sbp-persistence.md).

```bash
SBP_LEDGER_JSONL=/tmp/sbp-ledger.jsonl node server.mjs
```

Optional **decay GC** (periodic compaction of the JSONL file): set **`SBP_DECAY_GC_INTERVAL_MS`** to a positive value (milliseconds). Intensity floor: **`SBP_DECAY_GC_FLOOR`** (default `0.01`). See [ADR-0009](../../docs/adr/0009-sbp-ledger-compaction-decay-gc.md) and [sbp-operator-runbook](../../docs/operations/sbp-operator-runbook.md).

**Manual compaction** (stop writers first):

```bash
node bin/compact.mjs /tmp/sbp-ledger.jsonl
```

Programmatic use:

```javascript
import { createLedgerServer, JsonlLedgerStore, compactJsonlLedger } from "./server.mjs";

const store = new JsonlLedgerStore("/tmp/ledger.jsonl");
const { server } = createLedgerServer({ store });
```

## Test

```bash
npm test
```

The script sets a **per-test timeout** so a stuck handler cannot hang the runner indefinitely. Avoid overlapping full `npm test` runs (multiple processes can contend for debug ports or file handles in constrained environments).


Redis is **not** required for this reference slice; see [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md) before adding delegation or economic features.

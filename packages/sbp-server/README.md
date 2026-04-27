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

Programmatic use:

```javascript
import { createLedgerServer, JsonlLedgerStore } from "./server.mjs";

const store = new JsonlLedgerStore("/tmp/ledger.jsonl");
const { server } = createLedgerServer({ store });
```

## Test

```bash
npm test
```

Redis is **not** required for this reference slice; see [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md) before adding delegation or economic features.

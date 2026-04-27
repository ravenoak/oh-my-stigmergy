# SBP server (FR-3.1–FR-3.4)

Minimal **in-process** ledger with **SSE** broadcast (`GET /stream`), pheromone `POST /pheromones`, first-claim wins (`POST /pheromones/:id/claim`), and floor inflation (`POST /pheromones/:id/inflate`).

## Run

```bash
npm install
node server.mjs
```

## Test

```bash
npm test
```

Redis is **not** required for this reference slice; see [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md) before adding delegation or economic features.

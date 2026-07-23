# SBP server (FR-3.1–FR-3.4)

npm package **`@oh-my-stigmergy/sbp-server`**: minimal **in-process** ledger with **SSE** broadcast (`GET /stream`), pheromone `POST /pheromones`, first-claim wins (`POST /pheromones/:id/claim`), and floor inflation (`POST /pheromones/:id/inflate`).

## Run

```bash
npm install
node server.mjs
```

### Supervised / OpenCode project-local (plugin-spawned)

When **`SBP_SUPERVISED=1`**: set **`STIGMERGY_WORKTREE`** to the project root, or set **`SBP_LEDGER_SQLITE`** / **`SBP_LEDGER_JSONL`** yourself. If neither ledger env is set, the server uses **`$STIGMERGY_WORKTREE/.stigmergy/ledger.db`** (SQLite) and creates **`.stigmergy/`**.

- **`PORT`:** use **`0`** for an **ephemeral** free port (recommended for automatic collision avoidance). Otherwise defaults to **3847** if **`PORT`** is unset.
- **`SBP_RUNTIME_FILE`:** if set, after the HTTP server is listening the process writes **atomic JSON** with **`url`**, **`port`**, **`pid`**, **`startedAt`**. Binds to **`127.0.0.1`** only for predictable local URLs.
- **Stop** (optional): from the worktree, **`npm run stop -- <worktree>`** (or **`STIGMERGY_WORKTREE`**) reads **`.stigmergy/runtime.json`** and sends **SIGTERM** to **`pid`**.

The OpenCode plugin normally starts this process for you when **`SBP_URL`** is unset; see [ADR-0014](../../docs/adr/0014-sbp-project-supervision.md) (once added) and [`packages/opencode-plugin/README.md`](../opencode-plugin/README.md).

### Durable ledger (JSONL or SQLite)

- **JSONL:** opt-in via **`SBP_LEDGER_JSONL`** (path to a `.jsonl` file). Replays on startup; see [ADR-0008](../../docs/adr/0008-sbp-persistence.md). Exclusive writer lock: `${path}.sbp-writer-lock` (second process → **exit 75**).
- **SQLite:** opt-in via **`SBP_LEDGER_SQLITE`** (path ending in `.db` / `.sqlite`). See [ADR-0011](../../docs/adr/0011-sbp-sqlite-store.md). **Do not** set both `SBP_LEDGER_JSONL` and `SBP_LEDGER_SQLITE`.

```bash
SBP_LEDGER_JSONL=/tmp/sbp-ledger.jsonl node server.mjs
# or
SBP_LEDGER_SQLITE=/tmp/sbp-ledger.db node server.mjs
```

Optional **stance allow-list** (reject unknown `stanceTarget` with 400): **`SBP_STANCE_REGISTRY`** → JSON file or directory of `*.json` configs (union of `stance_vector` keys); see [ADR-0010](../../docs/adr/0010-stance-configuration-schema.md).

Optional **decay GC** (periodic compaction): set **`SBP_DECAY_GC_INTERVAL_MS`** (milliseconds). Intensity floor: **`SBP_DECAY_GC_FLOOR`** (default `0.01`). **`SBP_LEDGER_MAX_BYTES`:** when set with decay GC enabled, oversize files trigger a **size-rotation** compaction pass. See [ADR-0009](../../docs/adr/0009-sbp-ledger-compaction-decay-gc.md), [ADR-0011](../../docs/adr/0011-sbp-sqlite-store.md), and [sbp-operator-runbook](../../docs/operations/sbp-operator-runbook.md).

### Identity and kind (opt-in — [ADR-0016](../../docs/adr/0016-sbp-ledger-identity-and-kind.md))

Absent the env vars below, the server is in **open mode**: no auth, no class-gating, unchanged from
prior releases. Setting **`SBP_AUTH_TOKENS_FILE`** (JSON: `{ "tokens": { "<token>": { "agentId", "class": "worker"|"privileged" } } }`)
requires a valid `Authorization: Bearer <token>` on `POST /pheromones`, `.../claim`, and
`.../inflate`; the server stamps `agentId` on published records from the resolved identity. Every
pheromone carries a `kind` (defaults to `"signal"`); **`SBP_KIND_REGISTRY_FILE`** (JSON:
`{ "kinds": { "<kind>": { "publishableBy": ["worker","privileged"] } } }`) restricts which identity
classes may publish which kind — **class-gating only activates when both env vars are set**. The
baseline registry shipped here registers `signal` only, open to both classes. Per-identity inflate
budgets: **`SBP_INFLATE_MAX_PER_WINDOW`** + **`SBP_INFLATE_WINDOW_SECONDS`** (also require
`SBP_AUTH_TOKENS_FILE`). Records that predate `kind` are backstamped to `"signal"` on replay.

**Health:** `GET /healthz` → `{ ok, store, replayedAt, pheromones, claims }`.

**Manual compaction** (stop writers first):

```bash
node bin/compact.mjs /tmp/sbp-ledger.jsonl
node bin/compact.mjs /tmp/sbp-ledger.db
```

Programmatic use:

```javascript
import {
  createLedgerServer,
  JsonlLedgerStore,
  SqliteLedgerStore,
  compactJsonlLedger,
  compactSqliteLedger,
} from "./server.mjs";

const store = new JsonlLedgerStore("/tmp/ledger.jsonl");
const { server } = createLedgerServer({ store });
```

## Test

```bash
npm test
```

## Metrics (audit log summary)

SBP can emit an append-only NDJSON audit log via **`SBP_LOG_FILE`** (see `docs/operations/sbp-slo.md`).
To summarize a captured log into machine-readable coordination metrics:

```bash
npm run metrics -- /path/to/sbp.ndjson
```

This prints a JSON summary (event counts, claim conflicts, compaction activity, etc.) to stdout.

The script sets a **per-test timeout** so a stuck handler cannot hang the runner indefinitely. Avoid overlapping full `npm test` runs (multiple processes can contend for debug ports or file handles in constrained environments).


Redis is **not** pursued for the default scale path ([BACKLOG.md](../../docs/BACKLOG.md), [ADR-0011](../../docs/adr/0011-sbp-sqlite-store.md)); see [ADR-0005](../../docs/adr/0005-conflict-resolution-governance.md) before adding delegation or economic features.

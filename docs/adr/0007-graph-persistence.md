# ADR-0007: Graph persistence (SQLite, stdlib)

## Status

Accepted

## Context

[ADR-0002](0002-relation-first-retrieval.md) bound the reference graph to an in-memory Python index. Larger repositories and cross-session tooling need a **durable** card and edge store without pulling heavy native dependencies (Tree-sitter, Redis) into the default developer path.

## Decision

- **Primary store for the next scale step:** Python stdlib `sqlite3` with an on-disk database file or `:memory:` for tests.
- **Languages in scope:** **Python** (`.py`), **TypeScript** (`.ts`, `.tsx`), and **shell** (`.sh`) via [`packages/graph/src/graph/ingest.py`](../../packages/graph/src/graph/ingest.py). Python symbol cards use **`tree-sitter`** + **`tree-sitter-python`**; TypeScript symbol cards use **`tree-sitter`** + **`tree-sitter-typescript`** (installed via workspace `uv sync` on CI; `ubuntu-24.04` / CPython 3.13). When those bindings are unavailable (`ImportError`), ingestion **degrades** to line cards + regex edges only (no symbol cards for that language).
- **Persistence:** `cards` rows carry `language` and `role` (`line` | `symbol`); stable ids use [`card_id`](../../packages/graph/src/graph/ids.py) for symbol rows.
- **Default API:** [`GraphIndex`](../../packages/graph/src/graph/index.py) remains **in-memory** (`GraphIndex.build`). Callers opt in via `GraphIndex.persist_to_sqlite(path)` and `GraphIndex.from_sqlite(path, root=...)`.
- **CI budget:** unchanged from ADR-0002 (graph unittest job wall-clock ≤ ~2 minutes on `ubuntu-24.04`); ingestion tests target [`tests/fixtures/graph-corpus/`](../../tests/fixtures/graph-corpus/) rather than the full repo.

## Consequences

- Non-wheel languages and additional aspects remain **out of scope** until a follow-on ADR extends ingestion.
- Operators must manage SQLite file paths (permissions, backups); the in-memory path stays the zero-config default.

## Verification

- [`packages/graph/tests/test_store_sqlite.py`](../../packages/graph/tests/test_store_sqlite.py) round-trips cards and edges and asserts `load_node` parity against the in-memory build.
- [`packages/graph/tests/test_ingest_multilang.py`](../../packages/graph/tests/test_ingest_multilang.py) + [`tests/fixtures/graph-corpus/`](../../tests/fixtures/graph-corpus/) cover multi-language cards and aspect edges.

# ADR-0007: Graph persistence (SQLite, stdlib)

## Status

Accepted

## Context

[ADR-0002](0002-relation-first-retrieval.md) bound the reference graph to an in-memory Python index. Larger repositories and cross-session tooling need a **durable** card and edge store without pulling heavy native dependencies (Tree-sitter, Redis) into the default developer path.

## Decision

- **Primary store for the next scale step:** Python stdlib `sqlite3` with an on-disk database file or `:memory:` for tests.
- **Languages in scope:** Python (`.py`) only; multi-language ingestion remains a future ADR revision.
- **Default API:** [`GraphIndex`](../../packages/graph/src/graph/index.py) remains **in-memory** (`GraphIndex.build`). Callers opt in via `GraphIndex.persist_to_sqlite(path)` and `GraphIndex.from_sqlite(path, root=...)`.
- **CI budget:** unchanged from ADR-0002 (graph unittest job wall-clock ≤ ~2 minutes on `ubuntu-24.04` for the reference checkout size).

## Consequences

- Tree-sitter / AST-accurate cards are **explicitly deferred** (future ADR, likely ADR-0008 successor).
- Operators must manage SQLite file paths (permissions, backups); the in-memory path stays the zero-config default.

## Verification

- [`packages/graph/tests/test_store_sqlite.py`](../../packages/graph/tests/test_store_sqlite.py) round-trips cards and edges and asserts `load_node` parity against the in-memory build.

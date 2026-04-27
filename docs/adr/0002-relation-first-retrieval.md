# ADR-0002: Relation-first, reference-grounded retrieval

## Status

Accepted

## Context

Cosine-similarity retrieval can return lookalike code that is topologically irrelevant, increasing context noise and belief errors (see inspiration essay on RAG vs graphs and Hound-style designs).

## Decision

- Prefer **graph- or reference-based** navigation for agent tooling in this project once implementation work begins.
- Embedding-only RAG is not forbidden for experiments, but it is **not** the assumed production path for deep navigation FRs (FR-2.x).

## Consequences

- **Implementation binding (2026):** the reference graph lives under [`packages/graph`](../../packages/graph) (Python, stdlib + in-memory index). Optional **SQLite** persistence is documented in child [ADR-0007](0007-graph-persistence.md). **Not** committed by default: NetworkX or Tree-sitter parsers—those remain future ADR revisions if scale requires them.
- CI time budget for graph ingestion: **≤ 2 minutes** wall-clock on `ubuntu-24.04` for the unittest job scanning the repo checkout (exclude `.git`, `node_modules`, `.venv`, `__pycache__`, `dist`, `build`).
- First-class languages in scope for cards: **Python** (`.py`). Additional extensions require an ADR amendment.
- If a vendor or internal tool replaces this approach, update this ADR rather than pretending the essay’s names are binding.

## Verification

- [`packages/graph/tests`](../../packages/graph/tests) unittest discovery in `allium-specs` covers byte cards, IMPORTS aspect edges, and `load_node` slice aggregation.

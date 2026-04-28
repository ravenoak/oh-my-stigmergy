# ADR-0002: Relation-first, reference-grounded retrieval

## Status

Accepted

## Context

Cosine-similarity retrieval can return lookalike code that is topologically irrelevant, increasing context noise and belief errors (see inspiration essay on RAG vs graphs and Hound-style designs).

## Decision

- Prefer **graph- or reference-based** navigation for agent tooling in this project once implementation work begins.
- Embedding-only RAG is not forbidden for experiments, but it is **not** the assumed production path for deep navigation FRs (FR-2.x).

## Consequences

- **Implementation binding (2026):** the reference graph lives under [`packages/graph`](../../packages/graph) (Python, stdlib + in-memory index). Optional **SQLite** persistence is documented in child [ADR-0007](0007-graph-persistence.md). **Not** committed by default: NetworkX—remains a future ADR revision if scale requires it.
- CI time budget for graph ingestion: **≤ 2 minutes** wall-clock on `ubuntu-24.04` for the unittest job scanning the repo checkout (exclude `.git`, `node_modules`, `.venv`, `__pycache__`, `dist`, `build`).
- First-class languages in scope for **line cards + aspect edges:** **Python** (`.py`), **TypeScript** (`.ts`, `.tsx`), **shell** (`.sh`). **Optional symbol cards** (Tree-sitter): **Python** and **TypeScript** via `tree-sitter-python` / `tree-sitter-typescript` (see [ADR-0007](0007-graph-persistence.md)); additional grammars require an ADR amendment. **CALLS** edges (best-effort callee text) and symbol subroles **`method`** / **`decorator`** are emitted for those same languages; **no** deeper resolution (type-level edges, global name resolution) in this ADR — would exceed the CI graph budget without proportional retrieval value.
- `load_node` supports **depth-bounded** BFS over `IMPORTS` / `SOURCES` / **`CALLS`** edges with deterministic ordering (see [`packages/graph/src/graph/load_node.py`](../../packages/graph/src/graph/load_node.py)).
- If a vendor or internal tool replaces this approach, update this ADR rather than pretending the essay’s names are binding.

## Verification

- [`packages/graph/tests`](../../packages/graph/tests) unittest discovery in `allium-specs` covers byte cards, IMPORTS aspect edges, and `load_node` slice aggregation.
- CI graph ingestion wall-clock budget is pinned with [`devtools/ci-heavy-budget-seconds.txt`](../../devtools/ci-heavy-budget-seconds.txt); the **`Graph package unit tests (FR-2.x)`** step in [`.github/workflows/allium-specs.yml`](../../.github/workflows/allium-specs.yml) sets **`timeout-minutes`** to `ceil(seconds / 60)` (hard kill on `ubuntu-24.04`). [`scripts/verify-heavy-budget.sh`](../../scripts/verify-heavy-budget.sh) asserts the pin, ADR text, and workflow timeout stay aligned (see [NFR-P1](../requirements/NFR.md)).

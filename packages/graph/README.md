# Graph package (FR-2.1–FR-2.3)

Byte-addressed **code cards** and an **imports** aspect graph for Python sources under a repository root.

**Python:** 3.13 only for this package ([`.python-version`](../../.python-version); `requires-python` in `pyproject.toml` excludes 3.14+).

**Backends:** default build is in-memory (`GraphIndex.build`). Optional SQLite persistence (`GraphIndex.persist_to_sqlite` / `GraphIndex.from_sqlite`) per [ADR-0007](../../docs/adr/0007-graph-persistence.md).

## Develop

From the **repository root** (recommended, uses [`uv`](https://docs.astral.sh/uv/)):

```bash
uv sync -U --all-extras --all-groups -p "$(which python3.13)"
uv run python -m unittest discover -s packages/graph/tests -p 'test_*.py' -v
```

Without uv, from `packages/graph`: `PYTHONPATH=src python3.13 -m unittest discover -s tests -p 'test_*.py' -v`. Optional: `uv` / `pip` editable install with the `[dev]` extra for `pytest`.

## `load_node`

```bash
python -m graph.load_node <repo_root> <node_id>
```

`node_id` format: `relative/path.py#line` (1-based line number).

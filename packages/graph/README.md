# Graph package (FR-2.1–FR-2.3)

Byte-addressed **code cards** and an **imports** aspect graph for Python sources under a repository root.

## Develop

```bash
PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py' -v
```

Optional: `pip install -e ".[dev]"` in a venv for `pytest`.

## `load_node`

```bash
python -m graph.load_node <repo_root> <node_id>
```

`node_id` format: `relative/path.py#line` (1-based line number).

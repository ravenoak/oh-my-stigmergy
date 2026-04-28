# Crucible compiler (FR-4.2)

**Python 3.13** only ([`.python-version`](../../.python-version)).

Deterministic **`allium model` → SMT-LIB 2.0** for transition-bearing entities.

From the repo root after [`uv sync`](../../CONTRIBUTING.md) (`allium` on `PATH`):

```bash
uv run python -c "from pathlib import Path; from crucible.compile import compile_allium_file; Path('/tmp/out.smt2').write_text(compile_allium_file(Path('tests/fixtures/crucible/transitions.allium')), encoding='utf-8')"
```

CI runs `diff` against committed goldens under `tests/fixtures/crucible/`.

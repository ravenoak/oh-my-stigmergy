# Crucible compiler (FR-4.2)

Deterministic **`allium model` → SMT-LIB 2.0** for transition-bearing entities.

```bash
PYTHONPATH=src python3 -m crucible.compile --input tests/fixtures/crucible/transitions.allium --output /tmp/out.smt2
```

CI runs `diff` against committed goldens under `tests/fixtures/crucible/`.

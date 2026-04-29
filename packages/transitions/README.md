# Transition table harness (FR-1.3)

Merges structured **`allium model`** JSON from every `spec/*.allium` file and exposes **`TransitionTable.from_allium_specs(spec_dir)`** for allowed / disallowed transition checks.

## Requirements

- **`allium`** CLI on `PATH` (same pin as CI: [`devtools/allium-cli.version`](../../devtools/allium-cli.version)).
- Python **3.13** (workspace root [`.python-version`](../../.python-version)).

## Usage

From the repository root with a synced uv workspace:

```bash
uv run python -c "from pathlib import Path; from transitions import TransitionTable; t = TransitionTable.from_allium_specs(Path('spec')); print(t)"
```

Or run the unit tests (also executed in the `allium-specs` heavy job):

```bash
uv run python -m unittest discover -s packages/transitions/tests -p 'test_*.py' -v
```

## Behaviour

- For each `*.allium` under the given directory, the harness runs **`allium model <file>`** and merges `entities` by name (duplicate entity names across files are rejected).
- Transition edges are interpreted only from Allium source — **no** checked-in `*.model.json` sidecar for transitions.

## References

- [ADR-0001](../../docs/adr/0001-allium-behavioural-specs.md) — behavioural specs.
- [docs/TDD.md](../../docs/TDD.md) § FR-1.3 — transition hooks.
- [traceability/RTM.md](../../docs/traceability/RTM.md) — FR-1.3 verification row.

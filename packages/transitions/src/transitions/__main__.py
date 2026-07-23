"""CLI: emit the transitions.json artifact from spec/*.allium (FR-8.1)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from ._allium import AlliumModelError
from .artifact import render_transitions_artifact


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m transitions")
    parser.add_argument("--spec-dir", type=Path, default=Path("spec"))
    parser.add_argument("--output", type=Path, default=None, help="write JSON here instead of stdout")
    args = parser.parse_args(argv)

    try:
        text = render_transitions_artifact(args.spec_dir)
    except AlliumModelError as exc:
        print(f"transitions: {exc}", file=sys.stderr)
        return 1

    if args.output:
        args.output.write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

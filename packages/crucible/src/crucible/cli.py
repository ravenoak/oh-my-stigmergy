"""CLI: python -m crucible.cli solve <spec_dir>."""

from __future__ import annotations

import argparse
from pathlib import Path

from crucible.solve import solve_spec_dir


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="crucible")
    sub = p.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("solve", help="Run Z3 on transition-bearing spec/*.allium")
    sp.add_argument("spec_dir", type=Path, help="directory containing .allium files")

    args = p.parse_args(argv)
    if args.cmd == "solve":
        return solve_spec_dir(args.spec_dir.resolve())
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

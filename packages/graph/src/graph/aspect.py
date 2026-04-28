"""CLI: list aspect edges (IMPORTS / SOURCES / CALLS) for a repo root (FR-2.2)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from graph.index import GraphIndex

_VALID = frozenset({"IMPORTS", "SOURCES", "CALLS"})


def parse_kinds(s: str) -> frozenset[str]:
    kinds = frozenset(k.strip().upper() for k in s.split(",") if k.strip())
    bad = kinds - _VALID
    if bad:
        raise ValueError(f"unknown edge kinds: {sorted(bad)}")
    return kinds or _VALID


def list_edges(index: GraphIndex, kinds: frozenset[str]) -> list[tuple[str, str, str]]:
    rows: list[tuple[str, str, str]] = []
    for src, dst, kind in sorted(index.edges, key=lambda e: (e[2], e[0], e[1])):
        if kind in kinds:
            rows.append((src, dst, kind))
    return rows


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="List aspect edges (FR-2.2)")
    p.add_argument("root", type=Path)
    p.add_argument(
        "--kind",
        default="IMPORTS,SOURCES,CALLS",
        help="Comma-separated subset of IMPORTS,SOURCES,CALLS (default: all)",
    )
    args = p.parse_args(argv)
    try:
        kinds = parse_kinds(args.kind)
    except ValueError as e:
        print(f"graph.aspect: {e}", file=sys.stderr)
        return 2
    idx = GraphIndex.build(args.root)
    for src, dst, kind in list_edges(idx, kinds):
        sys.stdout.write(f"{kind}\t{src}\t{dst}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

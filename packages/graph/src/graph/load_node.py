"""CLI: print incident slices for a node (FR-2.3)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from graph.index import GraphIndex, node_id


def load_slices(index: GraphIndex, nid: str) -> list[str]:
    card = index.cards.get(nid)
    if not card:
        return [f"# missing node {nid}"]
    chunks = [f"## {nid}\n{card.text}\n"]
    for src, dst, kind in index.edges:
        if src == nid and kind == "IMPORTS":
            chunks.append(f"### edge {kind} -> {dst}\n")
    return chunks


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="load_node FR-2.3")
    p.add_argument("root", type=Path)
    p.add_argument("node_id")
    args = p.parse_args(argv)
    idx = GraphIndex.build(args.root)
    for part in load_slices(idx, args.node_id):
        sys.stdout.write(part)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

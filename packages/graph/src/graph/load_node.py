"""CLI: print incident slices for a node (FR-2.3)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from graph.ids import node_id
from graph.index import GraphIndex


def resolve_target_node(index: GraphIndex, dst: str) -> str | None:
    """Map IMPORTS/SOURCES target string to a card node id when uniquely resolvable."""
    raw = dst.strip().strip("'\"")
    if raw.startswith("./"):
        raw = raw[2:]
    root = index.root
    # Path-like target (e.g. common.sh)
    if "/" in raw or "\\" in raw or raw.endswith((".py", ".ts", ".tsx", ".sh")):
        key = raw.replace("\\", "/")
        p = (root / key).resolve()
        try:
            rel = str(p.relative_to(root.resolve()))
        except ValueError:
            rel = key
        candidates = [nid for nid in index.cards if nid.startswith(rel + "#")]
        return sorted(candidates)[0] if candidates else None
    stem = Path(raw).stem if "." in raw else raw
    candidates = [nid for nid in index.cards if Path(nid.rsplit("#", 1)[0]).stem == stem]
    return sorted(set(candidates))[0] if candidates else None


def edge_lines(index: GraphIndex, nid: str) -> list[str]:
    out: list[str] = []
    for src, dst, kind in sorted(index.edges, key=lambda e: (e[0], e[1], e[2])):
        if src == nid and kind in ("IMPORTS", "SOURCES"):
            out.append(f"### edge {kind} -> {dst}\n")
    return out


def load_slices(index: GraphIndex, nid: str, depth: int = 1) -> list[str]:
    """Return markdown-ish chunks: anchor card, incident edges, optional BFS card bodies."""
    d = max(0, min(depth, 3))
    card = index.cards.get(nid)
    if not card:
        return [f"# missing node {nid}"]
    chunks: list[str] = [f"## {nid}\n{card.text}\n"]
    chunks.extend(edge_lines(index, nid))
    extra_hops = max(0, d - 1)
    seen: set[str] = {nid}
    frontier = [nid]
    for _ in range(extra_hops):
        next_frontier: list[str] = []
        for cur in sorted(frontier):
            for src, dst, kind in sorted(index.edges, key=lambda e: (e[0], e[1], e[2])):
                if src != cur or kind not in ("IMPORTS", "SOURCES"):
                    continue
                other = resolve_target_node(index, dst)
                if other and other not in seen:
                    seen.add(other)
                    next_frontier.append(other)
                    oc = index.cards.get(other)
                    if oc:
                        chunks.append(f"## {other}\n{oc.text}\n")
                        chunks.extend(edge_lines(index, other))
        frontier = next_frontier
    return chunks


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="load_node FR-2.3")
    p.add_argument("root", type=Path)
    p.add_argument("node_id")
    p.add_argument(
        "--depth",
        type=int,
        default=1,
        help="0–3: BFS card hops beyond anchor (0 = anchor + incident edges only; 1 default; each +1 adds resolved IMPORTS/SOURCES targets)",
    )
    args = p.parse_args(argv)
    depth = max(0, min(args.depth, 3))
    idx = GraphIndex.build(args.root)
    for part in load_slices(idx, args.node_id, depth=depth):
        sys.stdout.write(part)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Compare transition graphs in spec/*.allium with spec/transitions.json."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def _extract_braced(text: str, open_idx: int) -> tuple[str, int] | None:
    """Return (inner, index_after_closing) starting at text[open_idx] == '{'."""
    if open_idx >= len(text) or text[open_idx] != "{":
        return None
    depth = 0
    for j in range(open_idx, len(text)):
        c = text[j]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[open_idx + 1 : j], j + 1
    return None


def _iter_entities(allium: str) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    i = 0
    while True:
        m = re.search(r"\bentity\s+(\w+)\s*\{", allium[i:])
        if not m:
            break
        name = m.group(1)
        brace_at = i + m.end() - 1
        inner = _extract_braced(allium, brace_at)
        if inner is None:
            raise SystemExit(f"verify-transitions-sync: unclosed entity block for {name}")
        body, next_i = inner
        out.append((name, body))
        i = next_i
    return out


def _extract_transition_graphs(entity_body: str) -> dict[str, tuple[set[tuple[str, str]], set[str]]]:
    """field -> (edges, terminals)."""
    graphs: dict[str, set[tuple[str, str]]] = {}
    terminals: dict[str, set[str]] = {}
    i = 0
    while True:
        m = re.search(r"\btransitions\s+(\w+)\s*\{", entity_body[i:])
        if not m:
            break
        field = m.group(1)
        brace_at = i + m.end() - 1
        inner_pair = _extract_braced(entity_body, brace_at)
        if inner_pair is None:
            break
        inner, next_i = inner_pair
        i = next_i
        edges: set[tuple[str, str]] = set()
        terms: set[str] = set()
        for line in inner.splitlines():
            line = line.split("--", 1)[0].strip()
            if not line:
                continue
            tm = re.match(r"terminal:\s*(\w+)\s*$", line)
            if tm:
                terms.add(tm.group(1))
                continue
            em = re.match(r"(\w+)\s*->\s*(\w+)\s*$", line)
            if em:
                edges.add((em.group(1), em.group(2)))
        graphs[field] = edges
        terminals[field] = terms
    return {f: (graphs[f], terminals.get(f, set())) for f in graphs}


def parse_allium_specs(spec_dir: Path) -> dict[tuple[str, str], tuple[set[tuple[str, str]], set[str]]]:
    combined: dict[tuple[str, str], tuple[set[tuple[str, str]], set[str]]] = {}
    for path in sorted(spec_dir.glob("*.allium")):
        text = path.read_text(encoding="utf-8")
        for entity_name, body in _iter_entities(text):
            for field, (edges, terms) in _extract_transition_graphs(body).items():
                key = (entity_name, field)
                if key in combined and combined[key] != (edges, terms):
                    raise SystemExit(f"verify-transitions-sync: duplicate conflicting transitions for {key} in {path}")
                combined[key] = (edges, terms)
    return combined


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    spec_dir = root / "spec"
    sidecar = spec_dir / "transitions.json"
    if not sidecar.is_file():
        print("verify-transitions-sync: missing spec/transitions.json", file=sys.stderr)
        return 1
    data = json.loads(sidecar.read_text(encoding="utf-8"))
    rows = data.get("transitions")
    if not isinstance(rows, list):
        print("verify-transitions-sync: transitions.json must have a list 'transitions'", file=sys.stderr)
        return 1

    from_spec = parse_allium_specs(spec_dir)
    from_json: dict[tuple[str, str], tuple[set[tuple[str, str]], set[str]]] = {}

    for row in rows:
        try:
            ent = row["entity"]
            field = row["field"]
            edges_list = row["edges"]
            terms_list = row.get("terminals", [])
        except (KeyError, TypeError) as e:
            print(f"verify-transitions-sync: bad row {row!r}: {e}", file=sys.stderr)
            return 1
        edges = {(a, b) for a, b in edges_list}
        terms = set(terms_list)
        from_json[(ent, field)] = (edges, terms)

    if from_json != from_spec:
        print("verify-transitions-sync: spec/*.allium transitions != spec/transitions.json", file=sys.stderr)
        print(f"  from allium: {sorted(from_spec.items())}", file=sys.stderr)
        print(f"  from json:   {sorted(from_json.items())}", file=sys.stderr)
        return 1

    print("verify-transitions-sync: ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

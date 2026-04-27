"""Multi-language ingestion dispatcher (Python + TypeScript + shell)."""

from __future__ import annotations

import re
from pathlib import Path

from graph.cards import Card, extract_import_targets, ingest_line_cards
from graph.ids import node_id

try:
    from tree_sitter_languages import get_parser
except ImportError:  # pragma: no cover - dev env without wheels
    get_parser = None  # type: ignore[misc, assignment]


_SH_SOURCE = re.compile(r"(?:^|\n)\s*(?:source|\.\s+)\s*([^\s#;`]+)", re.MULTILINE)


def _python_symbol_cards(root: Path, file_path: Path) -> list[Card]:
    if get_parser is None:
        return []
    rel = str(file_path.relative_to(root))
    source = file_path.read_bytes()
    parser = get_parser("python")
    tree = parser.parse(source)

    def walk(node, acc: list[tuple[int, int, int, str]]) -> None:
        if node.type in ("function_definition", "class_definition"):
            name_child = node.child_by_field_name("name")
            if name_child:
                line = source[: node.start_byte].count(b"\n") + 1
                snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
                first = snippet.splitlines()[0][:200] if snippet else node.type
                acc.append((line, node.start_byte, node.end_byte, first))
        for i in range(node.child_count):
            walk(node.child(i), acc)

    acc: list[tuple[int, int, int, str]] = []
    walk(tree.root_node, acc)
    return [
        Card(
            file_path=rel,
            line=line,
            char_start=start,
            char_end=end,
            text=text,
            language="python",
            role="symbol",
        )
        for line, start, end, text in acc
    ]


def extract_typescript_imports(source: str) -> list[str]:
    out: list[str] = []
    patterns = (
        r"from\s+['\"]([^'\"]+)['\"]",
        r"import\s+['\"]([^'\"]+)['\"]",
        r"^\s*import\s+([\w.]+)\s*;",
    )
    for pat in patterns:
        for m in re.finditer(pat, source, re.MULTILINE):
            g = m.group(1)
            out.append(g.split("/")[-1].split(".")[0])
    return out


def extract_shell_sources(source: str) -> list[str]:
    return [m.group(1).strip().strip("'\"") for m in _SH_SOURCE.finditer(source)]


def ingest_file(root: Path, file_path: Path) -> tuple[list[Card], list[tuple[str, str, str]]]:
    """Return (cards, edges). Edges use IMPORTS or SOURCES."""
    suf = file_path.suffix.lower()
    edges: list[tuple[str, str, str]] = []
    rel = str(file_path.relative_to(root))

    def src_anchor_line() -> str:
        return node_id(rel, 1)

    if suf == ".py":
        cards = ingest_line_cards(root, file_path, language="python")
        cards.extend(_python_symbol_cards(root, file_path))
        text = file_path.read_text(encoding="utf-8", errors="replace")
        for target in extract_import_targets(text):
            edges.append((src_anchor_line(), target, "IMPORTS"))
        return cards, edges

    if suf in (".ts", ".tsx"):
        cards = ingest_line_cards(root, file_path, language="typescript")
        text = file_path.read_text(encoding="utf-8", errors="replace")
        for target in extract_typescript_imports(text):
            edges.append((src_anchor_line(), target, "IMPORTS"))
        return cards, edges

    if suf == ".sh":
        cards = ingest_line_cards(root, file_path, language="shell")
        text = file_path.read_text(encoding="utf-8", errors="replace")
        for target in extract_shell_sources(text):
            edges.append((src_anchor_line(), target, "SOURCES"))
        return cards, edges

    return [], []


def supported_suffix(path: Path) -> bool:
    return path.suffix.lower() in (".py", ".ts", ".tsx", ".sh")

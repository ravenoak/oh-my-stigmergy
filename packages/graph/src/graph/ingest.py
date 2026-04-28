"""Multi-language ingestion dispatcher (Python + TypeScript + shell)."""

from __future__ import annotations

import re
from pathlib import Path

from graph.cards import Card, extract_import_targets, ingest_line_cards
from graph.ids import card_id, node_id

try:
    import tree_sitter_python as tspython
    import tree_sitter_typescript as tsts
    from tree_sitter import Language, Parser

    _PY_LANGUAGE = Language(tspython.language())
    _TS_LANGUAGE = Language(tsts.language_typescript())
    _TSX_LANGUAGE = Language(tsts.language_tsx())
except ImportError:  # pragma: no cover - dev env without bindings
    _PY_LANGUAGE = None  # type: ignore[misc, assignment]
    _TS_LANGUAGE = None  # type: ignore[misc, assignment]
    _TSX_LANGUAGE = None  # type: ignore[misc, assignment]


_SH_SOURCE = re.compile(r"(?:^|\n)\s*(?:source|\.\s+)\s*([^\s#;`]+)", re.MULTILINE)


def _callee_text(node, source: bytes) -> str | None:
    fn = node.child_by_field_name("function")
    if fn is None:
        return None
    raw = source[fn.start_byte : fn.end_byte].decode("utf-8", errors="replace").strip()
    return raw or None


def _python_symbol_scope_and_calls(root: Path, file_path: Path) -> tuple[list[Card], list[tuple[str, str, str]]]:
    if _PY_LANGUAGE is None:
        return [], []
    rel = str(file_path.relative_to(root))
    source = file_path.read_bytes()
    parser = Parser(_PY_LANGUAGE)
    tree = parser.parse(source)
    cards: list[Card] = []
    scope_by_start: dict[int, Card] = {}

    def line_no(byte_idx: int) -> int:
        return source[:byte_idx].count(b"\n") + 1

    def walk(node, ancestors: list[object]) -> None:
        atypes = {getattr(a, "type", "") for a in ancestors}
        if node.type == "decorator":
            ln = line_no(node.start_byte)
            snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
            first = snippet.splitlines()[0][:200] if snippet else node.type
            cards.append(
                Card(
                    file_path=rel,
                    line=ln,
                    char_start=node.start_byte,
                    char_end=node.end_byte,
                    text=first,
                    language="python",
                    role="decorator",
                )
            )
        elif node.type == "function_definition":
            name_child = node.child_by_field_name("name")
            if name_child:
                in_class = "class_definition" in atypes
                role = "method" if in_class else "symbol"
                ln = line_no(node.start_byte)
                snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
                first = snippet.splitlines()[0][:200] if snippet else node.type
                c = Card(
                    file_path=rel,
                    line=ln,
                    char_start=node.start_byte,
                    char_end=node.end_byte,
                    text=first,
                    language="python",
                    role=role,
                )
                cards.append(c)
                scope_by_start[node.start_byte] = c
        elif node.type == "class_definition":
            name_child = node.child_by_field_name("name")
            if name_child:
                ln = line_no(node.start_byte)
                snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
                first = snippet.splitlines()[0][:200] if snippet else node.type
                c = Card(
                    file_path=rel,
                    line=ln,
                    char_start=node.start_byte,
                    char_end=node.end_byte,
                    text=first,
                    language="python",
                    role="symbol",
                )
                cards.append(c)
                scope_by_start[node.start_byte] = c
        for i in range(node.child_count):
            walk(node.child(i), ancestors + [node])

    walk(tree.root_node, [])

    call_edges: list[tuple[str, str, str]] = []

    def walk_calls(node, stack: list[object]) -> None:
        stack.append(node)
        if node.type == "call":
            callee = _callee_text(node, source)
            scope_node = None
            for anc in reversed(stack[:-1]):
                if getattr(anc, "type", None) in ("function_definition", "class_definition"):
                    scope_node = anc
                    break
            if callee and scope_node is not None:
                sc = scope_by_start.get(scope_node.start_byte)
                if sc is not None:
                    call_edges.append((card_id(sc), callee, "CALLS"))
        for i in range(node.child_count):
            walk_calls(node.child(i), stack)
        stack.pop()

    walk_calls(tree.root_node, [])
    return cards, call_edges


def _typescript_symbol_scope_and_calls(root: Path, file_path: Path) -> tuple[list[Card], list[tuple[str, str, str]]]:
    if _TS_LANGUAGE is None or _TSX_LANGUAGE is None:
        return [], []
    rel = str(file_path.relative_to(root))
    source = file_path.read_bytes()
    lang = _TSX_LANGUAGE if file_path.suffix.lower() == ".tsx" else _TS_LANGUAGE
    parser = Parser(lang)
    tree = parser.parse(source)
    cards: list[Card] = []
    scope_by_start: dict[int, Card] = {}

    interesting_decl = {
        "function_declaration",
        "class_declaration",
        "interface_declaration",
        "type_alias_declaration",
    }

    def line_no(byte_idx: int) -> int:
        return source[:byte_idx].count(b"\n") + 1

    def walk(node, ancestors: list[object]) -> None:
        atypes = {getattr(a, "type", "") for a in ancestors}
        if node.type == "decorator":
            ln = line_no(node.start_byte)
            snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
            first = snippet.splitlines()[0][:200] if snippet else node.type
            cards.append(
                Card(
                    file_path=rel,
                    line=ln,
                    char_start=node.start_byte,
                    char_end=node.end_byte,
                    text=first,
                    language="typescript",
                    role="decorator",
                )
            )
        elif node.type in ("method_definition", "method_signature"):
            name_child = node.child_by_field_name("name")
            if name_child:
                ln = line_no(node.start_byte)
                snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
                first = snippet.splitlines()[0][:200] if snippet else node.type
                c = Card(
                    file_path=rel,
                    line=ln,
                    char_start=node.start_byte,
                    char_end=node.end_byte,
                    text=first,
                    language="typescript",
                    role="method",
                )
                cards.append(c)
                scope_by_start[node.start_byte] = c
        elif node.type in interesting_decl:
            name_child = node.child_by_field_name("name")
            if name_child:
                ln = line_no(node.start_byte)
                snippet = source[node.start_byte : node.end_byte].decode("utf-8", errors="replace")
                first = snippet.splitlines()[0][:200] if snippet else node.type
                role = "symbol"
                c = Card(
                    file_path=rel,
                    line=ln,
                    char_start=node.start_byte,
                    char_end=node.end_byte,
                    text=first,
                    language="typescript",
                    role=role,
                )
                cards.append(c)
                if node.type in ("class_declaration", "interface_declaration", "function_declaration"):
                    scope_by_start[node.start_byte] = c
        for i in range(node.child_count):
            walk(node.child(i), ancestors + [node])

    walk(tree.root_node, [])

    call_edges: list[tuple[str, str, str]] = []

    def walk_calls(node, stack: list[object]) -> None:
        stack.append(node)
        if node.type == "call_expression":
            callee = _callee_text(node, source)
            scope_node = None
            for anc in reversed(stack[:-1]):
                t = getattr(anc, "type", None)
                if t in ("function_declaration", "class_declaration", "method_definition", "method_signature"):
                    scope_node = anc
                    break
            if callee and scope_node is not None:
                sc = scope_by_start.get(scope_node.start_byte)
                if sc is not None:
                    call_edges.append((card_id(sc), callee, "CALLS"))
        for i in range(node.child_count):
            walk_calls(node.child(i), stack)
        stack.pop()

    walk_calls(tree.root_node, [])
    return cards, call_edges


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
    """Return (cards, edges). Edges use IMPORTS, SOURCES, or CALLS."""
    suf = file_path.suffix.lower()
    edges: list[tuple[str, str, str]] = []
    rel = str(file_path.relative_to(root))

    def src_anchor_line() -> str:
        return node_id(rel, 1)

    if suf == ".py":
        cards = ingest_line_cards(root, file_path, language="python")
        sym, calls = _python_symbol_scope_and_calls(root, file_path)
        cards.extend(sym)
        edges.extend(calls)
        text = file_path.read_text(encoding="utf-8", errors="replace")
        for target in extract_import_targets(text):
            edges.append((src_anchor_line(), target, "IMPORTS"))
        return cards, edges

    if suf in (".ts", ".tsx"):
        cards = ingest_line_cards(root, file_path, language="typescript")
        sym, calls = _typescript_symbol_scope_and_calls(root, file_path)
        cards.extend(sym)
        edges.extend(calls)
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

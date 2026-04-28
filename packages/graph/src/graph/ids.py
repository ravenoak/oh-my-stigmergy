"""Stable node identifiers for graph cards (FR-2.3)."""

from __future__ import annotations

_ROLE_PREFIX = {"symbol": "sym", "method": "meth", "decorator": "dec"}


def node_id(file_path: str, line: int) -> str:
    return f"{file_path}#{line}"


def card_id(card: object) -> str:
    """Stable id for a card (line slice or tree-sitter symbol / method / decorator)."""
    fp = str(getattr(card, "file_path"))
    line = int(getattr(card, "line"))
    cs = int(getattr(card, "char_start"))
    role = getattr(card, "role", "line") or "line"
    if role == "line":
        return node_id(fp, line)
    prefix = _ROLE_PREFIX.get(str(role), "sym")
    return f"{fp}#{prefix}{cs}"

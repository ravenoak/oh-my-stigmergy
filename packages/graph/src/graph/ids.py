"""Stable node identifiers for graph cards (FR-2.3)."""

from __future__ import annotations


def node_id(file_path: str, line: int) -> str:
    return f"{file_path}#{line}"


def card_id(card: object) -> str:
    """Stable id for a card (line slice or tree-sitter symbol)."""
    fp = str(getattr(card, "file_path"))
    line = int(getattr(card, "line"))
    cs = int(getattr(card, "char_start"))
    if getattr(card, "role", "line") == "symbol":
        return f"{fp}#sym{cs}"
    return node_id(fp, line)

"""Stable node identifiers for graph cards (FR-2.3)."""


def node_id(file_path: str, line: int) -> str:
    return f"{file_path}#{line}"

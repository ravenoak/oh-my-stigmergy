from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from graph.cards import Card, extract_import_targets, ingest_python_file


@dataclass
class GraphIndex:
    """In-memory index: cards + IMPORTS edges (FR-2.2)."""

    root: Path
    cards: dict[str, Card] = field(default_factory=dict)
    edges: list[tuple[str, str, str]] = field(default_factory=list)

    @classmethod
    def build(cls, root: Path, globs: tuple[str, ...] = ("**/*.py",)) -> GraphIndex:
        idx = cls(root=root)
        for pattern in globs:
            for path in root.glob(pattern):
                if path.is_dir():
                    continue
                if "packages" in path.parts and "tests" in path.parts:
                    continue
                rel = path.relative_to(root)
                if any(p.startswith(".") for p in rel.parts):
                    continue
                skip = {".git", "__pycache__", "node_modules", ".venv", "dist", "build"}
                if skip.intersection(rel.parts):
                    continue
                file_cards = ingest_python_file(root, path)
                for c in file_cards:
                    nid = node_id(c.file_path, c.line)
                    idx.cards[nid] = c
                src = path.read_text(encoding="utf-8", errors="replace")
                for target in extract_import_targets(src):
                    src_node = node_id(str(rel), 1)
                    idx.edges.append((src_node, target, "IMPORTS"))
        return idx


def node_id(file_path: str, line: int) -> str:
    return f"{file_path}#{line}"

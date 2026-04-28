from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from graph.cards import Card
from graph.ids import card_id, node_id
from graph.ingest import ingest_file, supported_suffix
from graph.store import SqliteCardStore


@dataclass
class GraphIndex:
    """In-memory index: cards + aspect edges (FR-2.2)."""

    root: Path
    cards: dict[str, Card] = field(default_factory=dict)
    edges: list[tuple[str, str, str]] = field(default_factory=list)

    @classmethod
    def build(
        cls,
        root: Path,
        globs: tuple[str, ...] = ("**/*.py", "**/*.ts", "**/*.tsx", "**/*.sh"),
    ) -> GraphIndex:
        idx = cls(root=root)
        for pattern in globs:
            for path in root.glob(pattern):
                if path.is_dir():
                    continue
                if not supported_suffix(path):
                    continue
                if "packages" in path.parts and "tests" in path.parts:
                    continue
                rel = path.relative_to(root)
                if any(p.startswith(".") for p in rel.parts):
                    continue
                skip = {".git", "__pycache__", "node_modules", ".venv", "dist", "build"}
                if skip.intersection(rel.parts):
                    continue
                file_cards, file_edges = ingest_file(root, path)
                for c in file_cards:
                    nid = card_id(c)
                    idx.cards[nid] = c
                idx.edges.extend(file_edges)
        return idx

    def persist_to_sqlite(self, sqlite_path: Path) -> None:
        """Write cards and edges to SQLite (ADR-0007)."""
        store = SqliteCardStore(sqlite_path)
        try:
            store.init_schema()
            store.conn.execute("DELETE FROM edges")
            store.conn.execute("DELETE FROM cards")
            store.conn.commit()
            store.upsert_cards(self.cards.values())
            store.add_imports(self.edges)
        finally:
            store.close()

    @classmethod
    def from_sqlite(cls, sqlite_path: Path, root: Path) -> GraphIndex:
        """Load a previously persisted graph from SQLite."""
        store = SqliteCardStore(sqlite_path)
        try:
            cards: dict[str, Card] = {}
            for nid, c in store.iter_card_rows():
                cards[nid] = c
            edges = list(store.iter_edges())
            return cls(root=root, cards=cards, edges=edges)
        finally:
            store.close()


__all__ = ["GraphIndex", "card_id", "node_id"]

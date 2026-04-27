"""SQLite persistence for code cards and aspect edges (ADR-0007)."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterable
from pathlib import Path
from typing import Any

from graph.cards import Card
from graph.ids import node_id


class SqliteCardStore:
    """Append-friendly card + edge store backed by sqlite3."""

    def __init__(self, path: str | Path) -> None:
        self.path = str(path)
        self.conn = sqlite3.connect(self.path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys=ON")

    def close(self) -> None:
        self.conn.close()

    def init_schema(self) -> None:
        self.conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS cards (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                line INTEGER NOT NULL,
                char_start INTEGER NOT NULL,
                char_end INTEGER NOT NULL,
                text TEXT NOT NULL,
                sha256 TEXT
            );
            CREATE TABLE IF NOT EXISTS edges (
                src TEXT NOT NULL,
                dst TEXT NOT NULL,
                kind TEXT NOT NULL,
                PRIMARY KEY (src, dst, kind)
            );
            """
        )
        self.conn.commit()

    def upsert_cards(self, cards: Iterable[Card]) -> None:
        rows: list[tuple[Any, ...]] = []
        for c in cards:
            cid = node_id(c.file_path, c.line)
            rows.append((cid, c.file_path, c.line, c.char_start, c.char_end, c.text, None))
        self.conn.executemany(
            """
            INSERT INTO cards (id, path, line, char_start, char_end, text, sha256)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              path=excluded.path,
              line=excluded.line,
              char_start=excluded.char_start,
              char_end=excluded.char_end,
              text=excluded.text,
              sha256=excluded.sha256
            """,
            rows,
        )
        self.conn.commit()

    def add_imports(self, edges: Iterable[tuple[str, str, str]]) -> None:
        self.conn.executemany(
            """
            INSERT OR IGNORE INTO edges (src, dst, kind) VALUES (?, ?, ?)
            """,
            list(edges),
        )
        self.conn.commit()

    def iter_cards(self) -> list[Card]:
        cur = self.conn.execute(
            "SELECT path, line, char_start, char_end, text FROM cards ORDER BY path, line"
        )
        return [
            Card(
                file_path=str(r["path"]),
                line=int(r["line"]),
                char_start=int(r["char_start"]),
                char_end=int(r["char_end"]),
                text=str(r["text"]),
            )
            for r in cur.fetchall()
        ]

    def iter_edges(self) -> list[tuple[str, str, str]]:
        cur = self.conn.execute("SELECT src, dst, kind FROM edges ORDER BY src, dst, kind")
        return [(str(r["src"]), str(r["dst"]), str(r["kind"])) for r in cur.fetchall()]

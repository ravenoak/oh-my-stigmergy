import sqlite3
import tempfile
import unittest
from pathlib import Path

from graph.store import SCHEMA_VERSION, SqliteCardStore


class TestSchemaVersion(unittest.TestCase):
    def test_fresh_database_is_stamped(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            db_path = Path(td) / "graph.sqlite"
            store = SqliteCardStore(db_path)
            store.init_schema()
            self.assertEqual(store.schema_version(), SCHEMA_VERSION)
            store.close()

    def test_stamp_persists_across_reopen(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            db_path = Path(td) / "graph.sqlite"
            store = SqliteCardStore(db_path)
            store.init_schema()
            store.close()

            reopened = SqliteCardStore(db_path)
            self.assertEqual(reopened.schema_version(), SCHEMA_VERSION)
            reopened.init_schema()
            self.assertEqual(reopened.schema_version(), SCHEMA_VERSION)
            reopened.close()

    def test_pre_versioning_database_is_migrated_and_stamped(self) -> None:
        """A database created before schema versioning existed has user_version=0
        and lacks the language/role columns — init_schema() must migrate and stamp it."""
        with tempfile.TemporaryDirectory() as td:
            db_path = Path(td) / "legacy.sqlite"
            conn = sqlite3.connect(str(db_path))
            conn.executescript(
                """
                CREATE TABLE cards (
                    id TEXT PRIMARY KEY, path TEXT NOT NULL, line INTEGER NOT NULL,
                    char_start INTEGER NOT NULL, char_end INTEGER NOT NULL,
                    text TEXT NOT NULL, sha256 TEXT
                );
                CREATE TABLE edges (
                    src TEXT NOT NULL, dst TEXT NOT NULL, kind TEXT NOT NULL,
                    PRIMARY KEY (src, dst, kind)
                );
                """
            )
            conn.commit()
            conn.close()

            store = SqliteCardStore(db_path)
            self.assertEqual(store.schema_version(), 0)
            store.init_schema()
            self.assertEqual(store.schema_version(), SCHEMA_VERSION)
            cols = {str(r[1]) for r in store.conn.execute("PRAGMA table_info(cards)").fetchall()}
            self.assertIn("language", cols)
            self.assertIn("role", cols)
            store.close()

    def test_future_schema_version_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            db_path = Path(td) / "graph.sqlite"
            store = SqliteCardStore(db_path)
            store.init_schema()
            store.conn.execute(f"PRAGMA user_version = {SCHEMA_VERSION + 1}")
            store.conn.commit()
            store.close()

            reopened = SqliteCardStore(db_path)
            with self.assertRaises(RuntimeError):
                reopened.init_schema()
            reopened.close()


if __name__ == "__main__":
    unittest.main()

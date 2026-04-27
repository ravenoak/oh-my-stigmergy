import tempfile
import unittest
from pathlib import Path

from graph.index import GraphIndex, node_id
from graph.load_node import load_slices


class TestSqliteStore(unittest.TestCase):
    def test_round_trip_and_load_node_parity(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            (root / "svc.py").write_text("import os\n\nprint(os)\n", encoding="utf-8")
            mem = GraphIndex.build(root)
            db_path = root / "graph.sqlite"
            mem.persist_to_sqlite(db_path)
            loaded = GraphIndex.from_sqlite(db_path, root=root)
            nid = node_id("svc.py", 1)
            self.assertEqual(
                "".join(load_slices(mem, nid)),
                "".join(load_slices(loaded, nid)),
            )
            self.assertEqual(len(mem.cards), len(loaded.cards))
            self.assertEqual(mem.edges, loaded.edges)


if __name__ == "__main__":
    unittest.main()

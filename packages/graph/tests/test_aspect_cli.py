import tempfile
import unittest
from pathlib import Path

from graph.aspect import list_edges, parse_kinds
from graph.index import GraphIndex


class TestAspectCli(unittest.TestCase):
    def test_list_edges_filters_kind(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            (tmp / "a.py").write_text("import b\n", encoding="utf-8")
            (tmp / "b.py").write_text("x = 1\n", encoding="utf-8")
            idx = GraphIndex.build(tmp)
            kinds = parse_kinds("IMPORTS")
            rows = list_edges(idx, kinds)
            self.assertTrue(any(r[2] == "IMPORTS" for r in rows))
            self.assertFalse(any(r[2] == "SOURCES" for r in rows))

    def test_parse_kinds_rejects_unknown(self) -> None:
        with self.assertRaises(ValueError):
            parse_kinds("BOGUS")


if __name__ == "__main__":
    unittest.main()

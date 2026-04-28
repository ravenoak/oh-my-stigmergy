import tempfile
import unittest
from pathlib import Path

from graph.index import GraphIndex, node_id
from graph.load_node import load_slices, parse_edge_kinds


class TestLoadNode(unittest.TestCase):
    def test_load_node_returns_line_and_import_hint(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            (tmp / "svc.py").write_text("import os\n\nprint(os)\n", encoding="utf-8")
            idx = GraphIndex.build(tmp)
            nid = node_id("svc.py", 1)
            out = "".join(load_slices(idx, nid, depth=1))
            self.assertIn("import os", out)
            self.assertIn("IMPORTS", out)

    def test_load_node_depth_resolves_import_chain(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            (tmp / "a.py").write_text("import b\n", encoding="utf-8")
            (tmp / "b.py").write_text("import c\n", encoding="utf-8")
            (tmp / "c.py").write_text("x = 1\n", encoding="utf-8")
            idx = GraphIndex.build(tmp)
            anchor = node_id("a.py", 1)
            shallow = "".join(load_slices(idx, anchor, depth=1))
            self.assertIn("import b", shallow)
            self.assertNotIn("import c", shallow)
            deep = "".join(load_slices(idx, anchor, depth=3))
            self.assertIn("import c", deep)
            self.assertIn("x = 1", deep)

    def test_load_node_edge_kind_filters_incident_edges(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            (tmp / "a.py").write_text("import b\n", encoding="utf-8")
            (tmp / "b.py").write_text("x = 1\n", encoding="utf-8")
            idx = GraphIndex.build(tmp)
            anchor = node_id("a.py", 1)
            out_imports = "".join(
                load_slices(idx, anchor, depth=1, edge_kinds=parse_edge_kinds("IMPORTS"))
            )
            self.assertIn("### edge IMPORTS", out_imports)
            out_sources_only = "".join(
                load_slices(idx, anchor, depth=1, edge_kinds=parse_edge_kinds("SOURCES"))
            )
            self.assertNotIn("### edge IMPORTS", out_sources_only)


if __name__ == "__main__":
    unittest.main()

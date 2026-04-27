import tempfile
import unittest
from pathlib import Path

from graph.index import GraphIndex, node_id
from graph.load_node import load_slices


class TestLoadNode(unittest.TestCase):
    def test_load_node_returns_line_and_import_hint(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            (tmp / "svc.py").write_text("import os\n\nprint(os)\n", encoding="utf-8")
            idx = GraphIndex.build(tmp)
            nid = node_id("svc.py", 1)
            out = "".join(load_slices(idx, nid))
            self.assertIn("import os", out)
            self.assertIn("IMPORTS", out)


if __name__ == "__main__":
    unittest.main()

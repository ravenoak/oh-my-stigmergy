import tempfile
import unittest
from pathlib import Path

from graph.index import GraphIndex


class TestAspect(unittest.TestCase):
    def test_imports_edge_between_files(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            tmp = Path(td)
            (tmp / "a.py").write_text("import b\n", encoding="utf-8")
            (tmp / "b.py").write_text("x = 1\n", encoding="utf-8")
            idx = GraphIndex.build(tmp)
            imports = [e for e in idx.edges if e[2] == "IMPORTS"]
            self.assertTrue(any(e[1] == "b" for e in imports))


if __name__ == "__main__":
    unittest.main()

import unittest
from pathlib import Path

from graph.ids import card_id
from graph.index import GraphIndex
from graph.load_node import load_slices


class TestCallsEdges(unittest.TestCase):
    def test_calls_edges_in_fixture_corpus(self) -> None:
        root = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "graph-corpus"
        idx = GraphIndex.build(root, globs=("**/*.py", "**/*.ts"))
        kinds = {e[2] for e in idx.edges}
        self.assertIn("CALLS", kinds)
        py_calls = [e for e in idx.edges if e[2] == "CALLS" and e[0].startswith("call_caller.py#")]
        self.assertTrue(any("callee_fn" in e[1] for e in py_calls), py_calls)
        ts_calls = [e for e in idx.edges if e[2] == "CALLS" and e[0].startswith("call_caller.ts#")]
        self.assertTrue(any("calleeTs" in e[1] for e in ts_calls), ts_calls)

    def test_decorated_python_roles(self) -> None:
        root = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "graph-corpus"
        idx = GraphIndex.build(root, globs=("decorated.py",))
        roles = {c.role for c in idx.cards.values()}
        self.assertIn("decorator", roles)
        self.assertIn("method", roles)

    def test_load_node_bfs_follows_calls(self) -> None:
        root = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "graph-corpus"
        idx = GraphIndex.build(root, globs=("call_caller.py", "call_callee.py"))
        main_cards = [
            c
            for c in idx.cards.values()
            if c.file_path == "call_caller.py" and c.role == "symbol" and "main" in c.text
        ]
        self.assertTrue(main_cards)
        nid = card_id(main_cards[0])
        out = "".join(load_slices(idx, nid, depth=2))
        self.assertIn("CALLS", out)
        self.assertIn("callee_fn", out)
        self.assertIn("def callee_fn", out)


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import shutil
import unittest
from pathlib import Path

from transitions import TransitionError, TransitionTable
from transitions._allium import AlliumModelError


@unittest.skipUnless(shutil.which("allium"), "allium CLI not installed")
class TestTransitionsFromAllium(unittest.TestCase):
    def setUp(self) -> None:
        root = Path(__file__).resolve().parents[3]
        self.spec = root / "spec"
        self.table = TransitionTable.from_allium_specs(self.spec)

    def test_allowed_edge(self) -> None:
        self.table.validate("TraceabilityRow", "maturity", "draft", "published")

    def test_disallowed_jump(self) -> None:
        with self.assertRaises(TransitionError):
            self.table.validate("Pheromone", "state", "open", "done")

    def test_cannot_leave_terminal(self) -> None:
        with self.assertRaises(TransitionError):
            self.table.validate("Pheromone", "state", "done", "open")

    def test_unknown_graph(self) -> None:
        with self.assertRaises(TransitionError):
            self.table.validate("Unknown", "field", "a", "b")


class TestTransitionsFixture(unittest.TestCase):
    """Regression: merged model rejects duplicate entity names across files."""

    def test_duplicate_entity_raises(self) -> None:
        if not shutil.which("allium"):
            self.skipTest("allium CLI not installed")
        from tempfile import TemporaryDirectory

        from transitions._allium import load_merged_model

        with TemporaryDirectory() as td:
            p = Path(td)
            body = """-- allium: 3
entity Dup { x: String }
"""
            (p / "a.allium").write_text(body, encoding="utf-8")
            (p / "b.allium").write_text(body, encoding="utf-8")
            with self.assertRaises(AlliumModelError):
                load_merged_model(p)


if __name__ == "__main__":
    unittest.main()

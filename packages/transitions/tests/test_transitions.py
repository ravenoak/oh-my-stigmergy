from __future__ import annotations

import unittest
from pathlib import Path

from transitions import TransitionError, TransitionTable


class TestTransitions(unittest.TestCase):
    def setUp(self) -> None:
        root = Path(__file__).resolve().parents[3]
        self.table = TransitionTable.from_json(root / "spec" / "transitions.json")

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


if __name__ == "__main__":
    unittest.main()

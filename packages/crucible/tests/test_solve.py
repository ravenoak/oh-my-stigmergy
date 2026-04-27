from __future__ import annotations

import shutil
import unittest
from pathlib import Path

from crucible.solve import explain_core, solve_allium_file, solve_allium_file_with_contradiction, solve_spec_dir
from crucible.compile import _run_allium_model, compile_named_model


@unittest.skipUnless(shutil.which("allium") and shutil.which("z3"), "need allium and z3")
class TestSolve(unittest.TestCase):
    def test_transitions_fixture_sat(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "transitions.allium"
        res = solve_allium_file(path)
        self.assertEqual(res.status, "sat")

    def test_unsat_core_explain(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "transitions.allium"
        model = _run_allium_model(path)
        _smt, labels = compile_named_model(model)
        extra = "(assert (! (not (step_Toggle_s Toggle_s_up Toggle_s_down)) :named contradiction))"
        res = solve_allium_file_with_contradiction(path, extra)
        self.assertEqual(res.status, "unsat")
        self.assertIn("contradiction", res.unsat_core)
        txt = explain_core(labels, res.unsat_core, path)
        self.assertIn("contradiction", txt)
        self.assertIn("Toggle", txt)

    def test_spec_dir_returns_zero(self) -> None:
        root = Path(__file__).resolve().parents[3]
        self.assertEqual(solve_spec_dir(root / "spec"), 0)


if __name__ == "__main__":
    unittest.main()

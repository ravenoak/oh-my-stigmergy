from __future__ import annotations

import json
import shutil
import unittest
from pathlib import Path

from crucible.solve import explain_core, run_z3, solve_allium_file, solve_allium_file_with_contradiction, solve_spec_dir
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

    def test_enums_fixture_unsat_core(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "enums.allium"
        model = _run_allium_model(path)
        smt, labels = compile_named_model(model)
        smt = smt.replace("(check-sat)\n(exit)", "")
        smt += "(assert (! (= cur_Ticket_phase Ticket_phase_planning) :named wrong_phase))\n(check-sat)\n(get-unsat-core)\n(exit)\n"
        res = run_z3(smt)
        self.assertEqual(res.status, "unsat")
        self.assertIn("wrong_phase", res.unsat_core)
        txt = explain_core(labels, res.unsat_core, path)
        self.assertIn("wrong_phase", txt)

    def test_required_fields_json_unsat_core(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "required_fields.model.json"
        model = json.loads(path.read_text(encoding="utf-8"))
        smt, labels = compile_named_model(model)
        smt = smt.replace("(check-sat)\n(exit)", "")
        smt += "(assert (! (not defined_Seal_verified) :named deny_required))\n(check-sat)\n(get-unsat-core)\n(exit)\n"
        res = run_z3(smt)
        self.assertEqual(res.status, "unsat")
        self.assertIn("deny_required", res.unsat_core)
        txt = explain_core(labels, res.unsat_core, path)
        self.assertIn("deny_required", txt)


if __name__ == "__main__":
    unittest.main()

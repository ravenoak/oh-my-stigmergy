from __future__ import annotations

import json
import shutil
import unittest
from pathlib import Path

from crucible.compile import compile_allium_file, compile_model_fixture, compile_model_json_to_smt


@unittest.skipUnless(shutil.which("allium"), "allium CLI not installed")
class TestCompile(unittest.TestCase):
    def test_idempotent_bytes(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "transitions.allium"
        a = compile_allium_file(path)
        b = compile_allium_file(path)
        self.assertEqual(a, b)

    def test_empty_model_emits_minimal(self) -> None:
        smt = compile_model_json_to_smt({"entities": [], "version": 3})
        self.assertIn("(check-sat)", smt)
        self.assertIn("(exit)", smt)

    def test_enums_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "enums.allium"
        golden = (root / "tests" / "fixtures" / "crucible" / "enums.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)


class TestCompileJsonFixtures(unittest.TestCase):
    def test_invariants_bad_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "invariants_bad.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "invariants_bad.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_required_fields_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "required_fields.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "required_fields.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    @unittest.skipUnless(shutil.which("allium"), "allium CLI not installed")
    def test_invariants_allium_overlay_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "invariants.allium"
        golden = (root / "tests" / "fixtures" / "crucible" / "invariants.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_required_bool_json_roundtrip(self) -> None:
        raw = (Path(__file__).resolve().parents[3] / "tests/fixtures/crucible/required_fields.model.json").read_text(
            encoding="utf-8",
        )
        smt_a = compile_model_json_to_smt(json.loads(raw))
        smt_b = compile_model_json_to_smt(json.loads(raw))
        self.assertEqual(smt_a, smt_b)

    def test_int_ranges_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "int_ranges.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "int_ranges.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_int_ranges_bad_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "int_ranges_bad.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "int_ranges_bad.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_collections_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "collections.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "collections.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_collections_bad_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "collections_bad.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "collections_bad.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_workflow_timeouts_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "workflow_timeouts.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "workflow_timeouts.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)

    def test_workflow_timeouts_bad_fixture_matches_golden(self) -> None:
        root = Path(__file__).resolve().parents[3]
        path = root / "tests" / "fixtures" / "crucible" / "workflow_timeouts_bad.model.json"
        golden = (root / "tests" / "fixtures" / "crucible" / "workflow_timeouts_bad.smt2").read_text(encoding="utf-8")
        self.assertEqual(compile_model_fixture(path), golden)


if __name__ == "__main__":
    unittest.main()

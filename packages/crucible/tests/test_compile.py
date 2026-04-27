from __future__ import annotations

import shutil
import unittest
from pathlib import Path

from crucible.compile import compile_allium_file, compile_model_json_to_smt


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


if __name__ == "__main__":
    unittest.main()

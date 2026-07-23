"""Subprocess coverage for `python -m stance.validate` (README contract)."""

from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class TestStanceValidateCli(unittest.TestCase):
    def test_cli_ok_on_good_fixture(self) -> None:
        repo = Path(__file__).resolve().parents[3]
        good = repo / "tests" / "fixtures" / "stance" / "good.json"
        proc = subprocess.run(
            [sys.executable, "-m", "stance.validate", str(good)],
            cwd=str(repo),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertIn("ok", proc.stdout)

    def test_cli_nonzero_on_invalid_json(self) -> None:
        repo = Path(__file__).resolve().parents[3]
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".json",
            delete=False,
            encoding="utf-8",
        ) as f:
            f.write("{ not json ")
            bad_path = Path(f.name)
        try:
            proc = subprocess.run(
                [sys.executable, "-m", "stance.validate", str(bad_path)],
                cwd=str(repo),
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertNotEqual(proc.returncode, 0)
            self.assertTrue(proc.stderr or proc.stdout)
        finally:
            bad_path.unlink(missing_ok=True)

    def test_cli_nonzero_on_schema_violation(self) -> None:
        repo = Path(__file__).resolve().parents[3]
        bad_path = repo / "tests" / "fixtures" / "stance" / "invalid" / "threshold_out_of_range.json"
        proc = subprocess.run(
            [sys.executable, "-m", "stance.validate", str(bad_path)],
            cwd=str(repo),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(proc.returncode, 1)
        combined = (proc.stderr + proc.stdout).lower()
        self.assertTrue("maximum" in combined or "threshold" in combined, combined)


if __name__ == "__main__":
    unittest.main()

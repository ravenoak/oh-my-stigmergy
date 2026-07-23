import json
import tempfile
import unittest
from pathlib import Path

import jsonschema

from stance.registry import load_registry
from stance.validate import validate_file


FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "stance"
FIXTURE_GOOD = FIXTURES / "good.json"
FIXTURES_INVALID = FIXTURES / "invalid"


class TestValidate(unittest.TestCase):
    def test_good_fixture(self) -> None:
        data = validate_file(FIXTURE_GOOD)
        self.assertEqual(data["agent_id"], "fixture-agent")

    def test_missing_required(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_file(FIXTURES_INVALID / "missing_required.json")

    def test_no_stance_vector(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_file(FIXTURES_INVALID / "no_stance_vector.json")

    def test_threshold_out_of_range(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_file(FIXTURES_INVALID / "threshold_out_of_range.json")

    def test_extra_property_rejected(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_file(FIXTURES_INVALID / "extra_property.json")

    def test_load_registry_file(self) -> None:
        keys = load_registry(FIXTURE_GOOD)
        self.assertEqual(keys, {"security_auditing", "feature_implementation"})

    def test_load_registry_dir(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)
            (p / "a.json").write_text(
                json.dumps(
                    {
                        "agent_id": "1",
                        "stance_vector": {"u": 1, "v": 0},
                        "olfactory_threshold": 0,
                    }
                ),
                encoding="utf-8",
            )
            (p / "b.json").write_text(
                json.dumps(
                    {
                        "agent_id": "2",
                        "stance_vector": {"v": 0.5, "w": 0.25},
                        "olfactory_threshold": 0.5,
                    }
                ),
                encoding="utf-8",
            )
            keys = load_registry(p)
            self.assertEqual(keys, {"u", "v", "w"})


if __name__ == "__main__":
    unittest.main()

import json
import tempfile
import unittest
from pathlib import Path

import jsonschema

from stance.registry import load_registry
from stance.validate import validate_file, validate_instance


FIXTURE_GOOD = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "stance" / "good.json"


class TestValidate(unittest.TestCase):
    def test_good_fixture(self) -> None:
        data = validate_file(FIXTURE_GOOD)
        self.assertEqual(data["agent_id"], "fixture-agent")

    def test_missing_required(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_instance({"agent_id": "x", "stance_vector": {}})

    def test_threshold_out_of_range(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_instance(
                {
                    "agent_id": "x",
                    "stance_vector": {"a": 0.5},
                    "olfactory_threshold": 1.5,
                }
            )

    def test_extra_property_rejected(self) -> None:
        with self.assertRaises(jsonschema.ValidationError):
            validate_instance(
                {
                    "agent_id": "x",
                    "stance_vector": {"a": 0.5},
                    "olfactory_threshold": 0.1,
                    "extra": 1,
                }
            )

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

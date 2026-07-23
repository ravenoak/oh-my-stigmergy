from __future__ import annotations

import json
import shutil
import unittest
from pathlib import Path

from transitions.artifact import (
    ARTIFACT_VERSION,
    build_transitions_artifact,
    render_transitions_artifact,
)


@unittest.skipUnless(shutil.which("allium"), "allium CLI not installed")
class TestTransitionsArtifact(unittest.TestCase):
    def setUp(self) -> None:
        root = Path(__file__).resolve().parents[3]
        self.spec = root / "spec"
        self.golden = root / "spec" / "transitions.json"

    def test_matches_committed_golden(self) -> None:
        live = render_transitions_artifact(self.spec)
        golden_text = self.golden.read_text(encoding="utf-8")
        self.assertEqual(live, golden_text, "spec/transitions.json is stale — regenerate it")

    def test_artifact_shape(self) -> None:
        artifact = build_transitions_artifact(self.spec)
        self.assertEqual(artifact["version"], ARTIFACT_VERSION)
        rows = artifact["transitions"]
        self.assertTrue(rows, "expected at least one transition graph")
        keys = [(r["entity"], r["field"]) for r in rows]
        self.assertEqual(keys, sorted(keys), "rows must be sorted by (entity, field)")
        for row in rows:
            self.assertIsInstance(row["edges"], list)
            self.assertIsInstance(row["terminals"], list)
            for edge in row["edges"]:
                self.assertEqual(set(edge), {"from", "to"})

    def test_known_graph_present(self) -> None:
        artifact = build_transitions_artifact(self.spec)
        rows = {(r["entity"], r["field"]): r for r in artifact["transitions"]}
        row = rows[("TraceabilityRow", "maturity")]
        self.assertIn({"from": "draft", "to": "published"}, row["edges"])
        self.assertEqual(row["terminals"], ["published"])

    def test_no_sdlc_phase_taxonomy_assumed(self) -> None:
        """Regression guard: this artifact mirrors spec/ as-is (governance workflows today),
        not an invented SDLC phase enum. See docs/planning/orchestrator-implementation-plan.md §7."""
        artifact = build_transitions_artifact(self.spec)
        entities = {r["entity"] for r in artifact["transitions"]}
        self.assertNotIn("WorkOrder", entities)

    def test_render_is_valid_json_with_trailing_newline(self) -> None:
        text = render_transitions_artifact(self.spec)
        self.assertTrue(text.endswith("\n"))
        json.loads(text)


if __name__ == "__main__":
    unittest.main()

"""Serialize the merged Allium transition model to a committed JSON artifact (FR-8.1).

This artifact mirrors whatever state machines exist in `spec/*.allium` today — it does not
assume or impose an SDLC phase taxonomy. See docs/planning/orchestrator-implementation-plan.md §7.
"""

from __future__ import annotations

import json
from pathlib import Path

from ._allium import load_merged_model

ARTIFACT_VERSION = 1


def build_transitions_artifact(spec_dir: Path) -> dict:
    """Build the transitions.json artifact dict from every `spec/*.allium`."""
    model = load_merged_model(spec_dir)
    rows: list[dict] = []
    for ent in model.get("entities", []):
        name = ent["name"]
        for tg in ent.get("transition_graphs", []):
            rows.append(
                {
                    "entity": name,
                    "field": tg["field"],
                    "edges": [{"from": e["from"], "to": e["to"]} for e in tg.get("edges", [])],
                    "terminals": sorted(tg.get("terminal", [])),
                }
            )
    rows.sort(key=lambda r: (r["entity"], r["field"]))
    return {"version": ARTIFACT_VERSION, "transitions": rows}


def render_transitions_artifact(spec_dir: Path) -> str:
    """Render the artifact as deterministic, newline-terminated JSON text."""
    artifact = build_transitions_artifact(spec_dir)
    return json.dumps(artifact, indent=2) + "\n"


__all__ = ["ARTIFACT_VERSION", "build_transitions_artifact", "render_transitions_artifact"]

"""Deterministic transition validation (FR-1.3) from `allium model` JSON."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from ._allium import AlliumModelError, load_merged_model
from .artifact import ARTIFACT_VERSION, build_transitions_artifact, render_transitions_artifact


class TransitionError(ValueError):
    """Raised when a state transition is not allowed by the Allium model."""


@dataclass(frozen=True)
class TransitionTable:
    """Maps (entity, field) to allowed edges and terminal states."""

    _edges: dict[tuple[str, str], set[tuple[str, str]]]
    _terminals: dict[tuple[str, str], set[str]]

    @classmethod
    def from_model_json(cls, data: dict) -> TransitionTable:
        edges: dict[tuple[str, str], set[tuple[str, str]]] = {}
        terminals: dict[tuple[str, str], set[str]] = {}
        for ent in data.get("entities", []):
            name = ent["name"]
            for tg in ent.get("transition_graphs", []):
                field = tg["field"]
                key = (name, field)
                edges[key] = {(e["from"], e["to"]) for e in tg.get("edges", [])}
                terminals[key] = set(tg.get("terminal", []))
        return cls(edges, terminals)

    @classmethod
    def from_allium_specs(cls, spec_dir: Path) -> TransitionTable:
        """Build from every `spec/*.allium` via `allium model` (vendor CLI)."""
        return cls.from_model_json(load_merged_model(spec_dir))

    @classmethod
    def from_json(cls, path: Path) -> TransitionTable:
        """Test-only: load the legacy sidecar format (deprecated)."""
        data = json.loads(path.read_text(encoding="utf-8"))
        rows = data["transitions"]
        edges: dict[tuple[str, str], set[tuple[str, str]]] = {}
        terminals: dict[tuple[str, str], set[str]] = {}
        for row in rows:
            key = (row["entity"], row["field"])
            edges[key] = {(a, b) for a, b in row["edges"]}
            terminals[key] = set(row.get("terminals", []))
        return cls(edges, terminals)

    def validate(self, entity: str, field: str, frm: str, to: str) -> None:
        key = (entity, field)
        if key not in self._edges:
            raise TransitionError(f"unknown transition graph {entity}.{field}")
        if frm not in {s for s, _ in self._edges[key]} and frm not in self._terminals[key]:
            all_states = {s for e in self._edges[key] for s in e} | self._terminals[key]
            if frm not in all_states:
                raise TransitionError(f"unknown from-state {frm!r} for {entity}.{field}")
        if frm in self._terminals[key]:
            raise TransitionError(f"cannot leave terminal state {frm!r} on {entity}.{field}")
        if (frm, to) not in self._edges[key]:
            raise TransitionError(f"disallowed edge {frm!r} -> {to!r} on {entity}.{field}")


__all__ = [
    "ARTIFACT_VERSION",
    "AlliumModelError",
    "TransitionError",
    "TransitionTable",
    "build_transitions_artifact",
    "load_merged_model",
    "render_transitions_artifact",
]

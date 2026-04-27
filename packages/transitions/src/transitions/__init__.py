"""Deterministic transition validation (FR-1.3 partial) driven by spec/transitions.json."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


class TransitionError(ValueError):
    """Raised when a state transition is not allowed by the sidecar table."""


@dataclass(frozen=True)
class TransitionTable:
    """Maps (entity, field) to allowed edges and terminal states."""

    _edges: dict[tuple[str, str], set[tuple[str, str]]]
    _terminals: dict[tuple[str, str], set[str]]

    @classmethod
    def from_json(cls, path: Path) -> TransitionTable:
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
            # allow starting from any declared state on first hop if it appears as a source or sink only
            all_states = {s for e in self._edges[key] for s in e} | self._terminals[key]
            if frm not in all_states:
                raise TransitionError(f"unknown from-state {frm!r} for {entity}.{field}")
        if frm in self._terminals[key]:
            raise TransitionError(f"cannot leave terminal state {frm!r} on {entity}.{field}")
        if (frm, to) not in self._edges[key]:
            raise TransitionError(f"disallowed edge {frm!r} -> {to!r} on {entity}.{field}")

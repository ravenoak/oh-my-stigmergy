"""Compile Allium `allium model` JSON to deterministic SMT-LIB (QF_UF) for transition graphs."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any, TypedDict

from crucible.errors import UnsupportedModelError


class AssertionLabel(TypedDict):
    name: str
    entity: str
    field: str
    kind: str


def _run_allium_model(allium_path: Path) -> dict[str, Any]:
    proc = subprocess.run(
        ["allium", "model", str(allium_path)],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr or proc.stdout or f"allium model failed ({proc.returncode})")
    return json.loads(proc.stdout)


def _safe_ident(*parts: str) -> bool:
    return all(p.replace("_", "").isalnum() for p in parts)


def _transition_field_names(ent: dict[str, Any]) -> set[str]:
    return {str(tg["field"]) for tg in (ent.get("transition_graphs") or [])}


def _emit_transition_graph_unnamed(
    lines: list[str],
    ent: dict[str, Any],
    tg: dict[str, Any],
) -> None:
    ename = str(ent["name"])
    field = str(tg["field"])
    states = list(tg.get("states") or [])
    edges = tg.get("edges") or []
    if not states:
        raise UnsupportedModelError(f"{ename}.{field}: no states")
    if not _safe_ident(ename, field, *states):
        raise UnsupportedModelError(f"unsupported identifiers in {ename}.{field}")
    sort_name = f"{ename}_{field}_State"
    lines.append(f"(declare-sort {sort_name} 0)")
    for st in states:
        lines.append(f"(declare-const {ename}_{field}_{st} {sort_name})")
    if len(states) >= 2:
        names = " ".join(f"{ename}_{field}_{s}" for s in states)
        lines.append(f"(assert (distinct {names}))")
    lines.append(f"(declare-fun step_{ename}_{field} ({sort_name} {sort_name}) Bool)")
    lines.append(f"(declare-const cur_{ename}_{field} {sort_name})")
    edge_sources = sorted({str(e["from"]) for e in edges})
    init = edge_sources[0] if edge_sources else sorted(states)[0]
    lines.append(f"(assert (= cur_{ename}_{field} {ename}_{field}_{init}))")
    for e in edges:
        a = f"{ename}_{field}_{e['from']}"
        b = f"{ename}_{field}_{e['to']}"
        lines.append(f"(assert (step_{ename}_{field} {a} {b}))")


def _emit_transition_graph_named(
    lines: list[str],
    labels: list[AssertionLabel],
    idx: list[int],
    ent: dict[str, Any],
    tg: dict[str, Any],
) -> None:
    ename = str(ent["name"])
    field = str(tg["field"])
    states = list(tg.get("states") or [])
    edges = tg.get("edges") or []
    if not states:
        raise UnsupportedModelError(f"{ename}.{field}: no states")
    if not _safe_ident(ename, field, *states):
        raise UnsupportedModelError(f"unsupported identifiers in {ename}.{field}")
    sort_name = f"{ename}_{field}_State"
    lines.append(f"(declare-sort {sort_name} 0)")
    for st in states:
        lines.append(f"(declare-const {ename}_{field}_{st} {sort_name})")
    if len(states) >= 2:
        names = " ".join(f"{ename}_{field}_{s}" for s in states)
        formula = f"(distinct {names})"
        name = f"crucible_{idx[0]}"
        idx[0] += 1
        labels.append({"name": name, "entity": ename, "field": field, "kind": "distinct"})
        lines.append(f"(assert (! {formula} :named {name}))")
    lines.append(f"(declare-fun step_{ename}_{field} ({sort_name} {sort_name}) Bool)")
    lines.append(f"(declare-const cur_{ename}_{field} {sort_name})")
    edge_sources = sorted({str(e["from"]) for e in edges})
    init = edge_sources[0] if edge_sources else sorted(states)[0]
    formula = f"(= cur_{ename}_{field} {ename}_{field}_{init})"
    name = f"crucible_{idx[0]}"
    idx[0] += 1
    labels.append({"name": name, "entity": ename, "field": field, "kind": "initial"})
    lines.append(f"(assert (! {formula} :named {name}))")
    for e in edges:
        a = f"{ename}_{field}_{e['from']}"
        b = f"{ename}_{field}_{e['to']}"
        formula = f"(step_{ename}_{field} {a} {b})"
        name = f"crucible_{idx[0]}"
        idx[0] += 1
        labels.append({"name": name, "entity": ename, "field": field, "kind": "step"})
        lines.append(f"(assert (! {formula} :named {name}))")


def _emit_standalone_field_unnamed(lines: list[str], ent: dict[str, Any], field: dict[str, Any]) -> None:
    """Emit SMT for fields not covered by transition_graphs (enum-only, bool, required)."""
    ename = str(ent["name"])
    fname = str(field["name"])
    ev = list(field.get("enum_values") or [])
    required = bool(field.get("required"))

    if ev == ["bool"]:
        if not _safe_ident(ename, fname):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        lines.append(f"(declare-const cur_{ename}_{fname} Bool)")
        lines.append(f"(assert (= cur_{ename}_{fname} true))")
    elif len(ev) >= 2 and all(_safe_ident(v) for v in ev):
        if not _safe_ident(ename, fname, *ev):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        sort_name = f"{ename}_{fname}_State"
        lines.append(f"(declare-sort {sort_name} 0)")
        for v in ev:
            lines.append(f"(declare-const {ename}_{fname}_{v} {sort_name})")
        if len(ev) >= 2:
            names = " ".join(f"{ename}_{fname}_{v}" for v in ev)
            lines.append(f"(assert (distinct {names}))")
        lines.append(f"(declare-const cur_{ename}_{fname} {sort_name})")
        default = sorted(ev)[0]
        lines.append(f"(assert (= cur_{ename}_{fname} {ename}_{fname}_{default}))")
    elif required:
        if not _safe_ident(ename, fname):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        lines.append(f"(declare-const defined_{ename}_{fname} Bool)")
        lines.append(f"(assert defined_{ename}_{fname})")
    else:
        return

    if required and (ev == ["bool"] or (len(ev) >= 2 and all(_safe_ident(v) for v in ev))):
        if not _safe_ident(ename, fname):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        lines.append(f"(declare-const defined_{ename}_{fname} Bool)")
        lines.append(f"(assert defined_{ename}_{fname})")


def _emit_standalone_field_named(
    lines: list[str],
    labels: list[AssertionLabel],
    idx: list[int],
    ent: dict[str, Any],
    field: dict[str, Any],
) -> None:
    ename = str(ent["name"])
    fname = str(field["name"])
    ev = list(field.get("enum_values") or [])
    required = bool(field.get("required"))

    if ev == ["bool"]:
        if not _safe_ident(ename, fname):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        lines.append(f"(declare-const cur_{ename}_{fname} Bool)")
        formula = f"(= cur_{ename}_{fname} true)"
        name = f"crucible_{idx[0]}"
        idx[0] += 1
        labels.append({"name": name, "entity": ename, "field": fname, "kind": "bool_initial"})
        lines.append(f"(assert (! {formula} :named {name}))")
    elif len(ev) >= 2 and all(_safe_ident(v) for v in ev):
        if not _safe_ident(ename, fname, *ev):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        sort_name = f"{ename}_{fname}_State"
        lines.append(f"(declare-sort {sort_name} 0)")
        for v in ev:
            lines.append(f"(declare-const {ename}_{fname}_{v} {sort_name})")
        if len(ev) >= 2:
            names = " ".join(f"{ename}_{fname}_{v}" for v in ev)
            formula = f"(distinct {names})"
            name = f"crucible_{idx[0]}"
            idx[0] += 1
            labels.append({"name": name, "entity": ename, "field": fname, "kind": "enum_distinct"})
            lines.append(f"(assert (! {formula} :named {name}))")
        lines.append(f"(declare-const cur_{ename}_{fname} {sort_name})")
        default = sorted(ev)[0]
        formula = f"(= cur_{ename}_{fname} {ename}_{fname}_{default})"
        name = f"crucible_{idx[0]}"
        idx[0] += 1
        labels.append({"name": name, "entity": ename, "field": fname, "kind": "enum_initial"})
        lines.append(f"(assert (! {formula} :named {name}))")
    elif required:
        if not _safe_ident(ename, fname):
            raise UnsupportedModelError(f"unsupported identifiers in {ename}.{fname}")
        lines.append(f"(declare-const defined_{ename}_{fname} Bool)")
        formula = f"(= defined_{ename}_{fname} true)"
        name = f"crucible_{idx[0]}"
        idx[0] += 1
        labels.append({"name": name, "entity": ename, "field": fname, "kind": "required_defined"})
        lines.append(f"(assert (! {formula} :named {name}))")
    else:
        return

    if required and (ev == ["bool"] or (len(ev) >= 2 and all(_safe_ident(v) for v in ev))):
        lines.append(f"(declare-const defined_{ename}_{fname} Bool)")
        formula = f"(= defined_{ename}_{fname} true)"
        name = f"crucible_{idx[0]}"
        idx[0] += 1
        labels.append({"name": name, "entity": ename, "field": fname, "kind": "required_defined"})
        lines.append(f"(assert (! {formula} :named {name}))")


def compile_model_json_to_smt(model: dict[str, Any], *, named: bool = False) -> str:
    """Emit deterministic SMT-LIB for transition graphs and standalone typed fields."""
    del named  # reserved; golden path is always unnamed
    lines: list[str] = [
        "; Generated by packages/crucible — deterministic Allium model -> SMT",
        "(set-logic QF_UF)",
    ]
    entities = model.get("entities") or []
    if not entities:
        lines += ["(check-sat)", "(exit)"]
        return "\n".join(lines) + "\n"

    for ent in sorted(entities, key=lambda e: str(e.get("name", ""))):
        ename = str(ent["name"])
        for tg in sorted(ent.get("transition_graphs") or [], key=lambda t: str(t.get("field", ""))):
            _emit_transition_graph_unnamed(lines, ent, tg)
        tg_fields = _transition_field_names(ent)
        for field in sorted(ent.get("fields") or [], key=lambda f: str(f.get("name", ""))):
            fname = str(field.get("name", ""))
            if fname in tg_fields:
                continue
            _emit_standalone_field_unnamed(lines, ent, field)

    lines.append("(check-sat)")
    lines.append("(exit)")
    return "\n".join(lines) + "\n"


def compile_named_model(model: dict[str, Any]) -> tuple[str, list[AssertionLabel]]:
    """Same as compile_model_json_to_smt but boolean asserts use :named for unsat cores."""
    lines: list[str] = [
        "; Generated by packages/crucible — named assertions for Z3 unsat cores",
        "(set-logic QF_UF)",
        "(set-option :produce-unsat-cores true)",
    ]
    labels: list[AssertionLabel] = []
    idx = [0]
    entities = model.get("entities") or []
    if not entities:
        lines += ["(check-sat)", "(exit)"]
        return "\n".join(lines) + "\n", []

    for ent in sorted(entities, key=lambda e: str(e.get("name", ""))):
        for tg in sorted(ent.get("transition_graphs") or [], key=lambda t: str(t.get("field", ""))):
            _emit_transition_graph_named(lines, labels, idx, ent, tg)
        tg_fields = _transition_field_names(ent)
        for field in sorted(ent.get("fields") or [], key=lambda f: str(f.get("name", ""))):
            fname = str(field.get("name", ""))
            if fname in tg_fields:
                continue
            _emit_standalone_field_named(lines, labels, idx, ent, field)

    lines.append("(check-sat)")
    lines.append("(exit)")
    return "\n".join(lines) + "\n", labels


def compile_allium_file(path: Path, *, named: bool = False) -> str:
    model = _run_allium_model(path)
    if named:
        smt, _labels = compile_named_model(model)
        return smt
    return compile_model_json_to_smt(model, named=named)


def compile_model_fixture(path: Path, *, named: bool = False) -> str:
    """Compile a `.allium` (via allium model) or `.model.json` (raw JSON) fixture."""
    if path.suffix == ".allium":
        return compile_allium_file(path, named=named)
    if path.name.endswith(".model.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        if named:
            smt, _labels = compile_named_model(data)
            return smt
        return compile_model_json_to_smt(data, named=named)
    raise ValueError(f"unsupported fixture type: {path}")


def compile_fixture_transitions(repo_root: Path) -> str:
    return compile_allium_file(repo_root / "tests" / "fixtures" / "crucible" / "transitions.allium")

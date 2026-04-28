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


def _default_field_map(model: dict[str, Any]) -> dict[tuple[str, str], Any]:
    out: dict[tuple[str, str], Any] = {}
    for block in model.get("defaults") or []:
        ent = str(block.get("entity") or "")
        fields = block.get("fields") or {}
        if not ent or not isinstance(fields, dict):
            continue
        for k, v in sorted(fields.items(), key=lambda kv: str(kv[0])):
            out[(ent, str(k))] = v
    return out


def _fields_needing_len(model: dict[str, Any]) -> set[tuple[str, str]]:
    need: set[tuple[str, str]] = set()
    for inv in model.get("invariants") or []:
        for clause in inv.get("all") or []:
            if clause.get("op") in ("len_gt", "len_eq"):
                need.add((str(clause.get("entity")), str(clause.get("field"))))
    return need


def _len_symbol(entity: str, field: str) -> str:
    return f"len_{entity}_{field}"


def _ensure_len_declared_unnamed(lines: list[str], declared: set[str], entity: str, field: str) -> str:
    sym = _len_symbol(entity, field)
    key = f"{entity}.{field}"
    if key not in declared:
        lines.append(f"(declare-const {sym} Int)")
        declared.add(key)
    return sym


def _ensure_len_declared_named(
    lines: list[str],
    labels: list[AssertionLabel],
    idx: list[int],
    declared: set[str],
    entity: str,
    field: str,
) -> str:
    sym = _len_symbol(entity, field)
    key = f"{entity}.{field}"
    if key not in declared:
        lines.append(f"(declare-const {sym} Int)")
        declared.add(key)
    return sym


def _emit_len_default_unnamed(
    lines: list[str],
    declared: set[str],
    entity: str,
    field: str,
    s: str,
) -> None:
    sym = _ensure_len_declared_unnamed(lines, declared, entity, field)
    n = len(s.encode("utf-8"))
    lines.append(f"(assert (= {sym} {n}))")


def _emit_len_default_named(
    lines: list[str],
    labels: list[AssertionLabel],
    idx: list[int],
    declared: set[str],
    entity: str,
    field: str,
    s: str,
) -> None:
    sym = _ensure_len_declared_named(lines, labels, idx, declared, entity, field)
    n = len(s.encode("utf-8"))
    formula = f"(= {sym} {n})"
    name = f"crucible_{idx[0]}"
    idx[0] += 1
    labels.append({"name": name, "entity": entity, "field": field, "kind": "str_len_default"})
    lines.append(f"(assert (! {formula} :named {name}))")


def _emit_invariants_unnamed(lines: list[str], model: dict[str, Any], declared_lens: set[str]) -> None:
    for inv in sorted(model.get("invariants") or [], key=lambda x: str(x.get("name", ""))):
        inv_name = str(inv.get("name") or "inv")
        clauses = inv.get("all") or []
        parts: list[str] = []
        for c in clauses:
            op = c.get("op")
            if op == "len_gt":
                ent = str(c.get("entity"))
                fld = str(c.get("field"))
                bound = int(c.get("bound", 0))
                sym = _ensure_len_declared_unnamed(lines, declared_lens, ent, fld)
                parts.append(f"(> {sym} {bound})")
            elif op == "len_eq":
                ent = str(c.get("entity"))
                fld = str(c.get("field"))
                val = int(c.get("value", 0))
                sym = _ensure_len_declared_unnamed(lines, declared_lens, ent, fld)
                parts.append(f"(= {sym} {val})")
            elif op == "enum_any_of":
                ent = str(c.get("entity"))
                fld = str(c.get("field"))
                vals = list(c.get("values") or [])
                if not _safe_ident(ent, fld, *vals):
                    raise UnsupportedModelError(f"unsupported identifiers in invariant {inv_name}")
                disj = " ".join(f"(= cur_{ent}_{fld} {ent}_{fld}_{v})" for v in vals)
                parts.append(f"(or {disj})")
            else:
                raise UnsupportedModelError(f"unsupported invariant op {op!r} in {inv_name}")
        if len(parts) == 1:
            lines.append(f"(assert {parts[0]})")
        else:
            joined = " ".join(parts)
            lines.append(f"(assert (and {joined}))")


def _emit_invariants_named(
    lines: list[str],
    labels: list[AssertionLabel],
    idx: list[int],
    model: dict[str, Any],
    declared_lens: set[str],
) -> None:
    for inv in sorted(model.get("invariants") or [], key=lambda x: str(x.get("name", ""))):
        inv_name = str(inv.get("name") or "inv")
        clauses = inv.get("all") or []
        for c in clauses:
            op = c.get("op")
            if op == "len_gt":
                ent = str(c.get("entity"))
                fld = str(c.get("field"))
                bound = int(c.get("bound", 0))
                sym = _ensure_len_declared_named(lines, labels, idx, declared_lens, ent, fld)
                formula = f"(> {sym} {bound})"
                name = f"crucible_{idx[0]}"
                idx[0] += 1
                labels.append({"name": name, "entity": ent, "field": fld, "kind": f"invariant_{inv_name}_len"})
                lines.append(f"(assert (! {formula} :named {name}))")
            elif op == "len_eq":
                ent = str(c.get("entity"))
                fld = str(c.get("field"))
                val = int(c.get("value", 0))
                sym = _ensure_len_declared_named(lines, labels, idx, declared_lens, ent, fld)
                formula = f"(= {sym} {val})"
                name = f"crucible_{idx[0]}"
                idx[0] += 1
                labels.append({"name": name, "entity": ent, "field": fld, "kind": f"invariant_{inv_name}_len_eq"})
                lines.append(f"(assert (! {formula} :named {name}))")
            elif op == "enum_any_of":
                ent = str(c.get("entity"))
                fld = str(c.get("field"))
                vals = list(c.get("values") or [])
                if not _safe_ident(ent, fld, *vals):
                    raise UnsupportedModelError(f"unsupported identifiers in invariant {inv_name}")
                disj = " ".join(f"(= cur_{ent}_{fld} {ent}_{fld}_{v})" for v in vals)
                formula = f"(or {disj})"
                name = f"crucible_{idx[0]}"
                idx[0] += 1
                labels.append({"name": name, "entity": ent, "field": fld, "kind": f"invariant_{inv_name}_enum"})
                lines.append(f"(assert (! {formula} :named {name}))")
            else:
                raise UnsupportedModelError(f"unsupported invariant op {op!r} in {inv_name}")


def merge_overlay_model(allium_path: Path, model: dict[str, Any]) -> dict[str, Any]:
    """Merge optional `<stem>.overlay.json` defaults/invariants into an allium model dict."""
    sidecar = allium_path.with_name(allium_path.stem + ".overlay.json")
    if not sidecar.is_file():
        return model
    overlay = json.loads(sidecar.read_text(encoding="utf-8"))
    out = dict(model)
    if "defaults" in overlay:
        out["defaults"] = list(overlay.get("defaults") or [])
    if "invariants" in overlay:
        out["invariants"] = list(overlay.get("invariants") or [])
    return out


def _emit_transition_graph_unnamed(
    lines: list[str],
    ent: dict[str, Any],
    tg: dict[str, Any],
    *,
    default_map: dict[tuple[str, str], Any],
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
    ov = default_map.get((ename, field))
    if ov is not None and str(ov) in states:
        init = str(ov)
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
    *,
    default_map: dict[tuple[str, str], Any],
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
    ov = default_map.get((ename, field))
    if ov is not None and str(ov) in states:
        init = str(ov)
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


def _emit_standalone_field_unnamed(
    lines: list[str],
    ent: dict[str, Any],
    field: dict[str, Any],
    *,
    default_map: dict[tuple[str, str], Any],
    len_needs: set[tuple[str, str]],
    declared_lens: set[str],
) -> None:
    """Emit SMT for fields not covered by transition_graphs (enum-only, bool, required, String len)."""
    ename = str(ent["name"])
    fname = str(field["name"])
    ev = list(field.get("enum_values") or [])
    required = bool(field.get("required"))
    type_expr = str(field.get("type_expr") or "")

    if not ev and type_expr == "String":
        key = (ename, fname)
        if key in default_map and isinstance(default_map[key], str):
            _emit_len_default_unnamed(lines, declared_lens, ename, fname, default_map[key])
        elif key in len_needs:
            sym = _ensure_len_declared_unnamed(lines, declared_lens, ename, fname)
            lines.append(f"(assert (> {sym} 0))")
        return

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
        override = default_map.get((ename, fname))
        default = (
            override
            if override is not None and str(override) in ev
            else sorted(ev)[0]
        )
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
    *,
    default_map: dict[tuple[str, str], Any],
    len_needs: set[tuple[str, str]],
    declared_lens: set[str],
) -> None:
    ename = str(ent["name"])
    fname = str(field["name"])
    ev = list(field.get("enum_values") or [])
    required = bool(field.get("required"))
    type_expr = str(field.get("type_expr") or "")

    if not ev and type_expr == "String":
        key = (ename, fname)
        if key in default_map and isinstance(default_map[key], str):
            _emit_len_default_named(lines, labels, idx, declared_lens, ename, fname, default_map[key])
        elif key in len_needs:
            sym = _ensure_len_declared_named(lines, labels, idx, declared_lens, ename, fname)
            formula = f"(> {sym} 0)"
            name = f"crucible_{idx[0]}"
            idx[0] += 1
            labels.append({"name": name, "entity": ename, "field": fname, "kind": "str_len_invariant"})
            lines.append(f"(assert (! {formula} :named {name}))")
        return

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
        override = default_map.get((ename, fname))
        default = (
            override
            if override is not None and str(override) in ev
            else sorted(ev)[0]
        )
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
        "(set-logic QF_UFLIA)",
    ]
    entities = model.get("entities") or []
    if not entities:
        lines += ["(check-sat)", "(exit)"]
        return "\n".join(lines) + "\n"

    default_map = _default_field_map(model)
    len_needs = _fields_needing_len(model)
    declared_lens: set[str] = set()

    for ent in sorted(entities, key=lambda e: str(e.get("name", ""))):
        ename = str(ent["name"])
        for tg in sorted(ent.get("transition_graphs") or [], key=lambda t: str(t.get("field", ""))):
            _emit_transition_graph_unnamed(lines, ent, tg, default_map=default_map)
        tg_fields = _transition_field_names(ent)
        for field in sorted(ent.get("fields") or [], key=lambda f: str(f.get("name", ""))):
            fname = str(field.get("name", ""))
            if fname in tg_fields:
                continue
            _emit_standalone_field_unnamed(
                lines,
                ent,
                field,
                default_map=default_map,
                len_needs=len_needs,
                declared_lens=declared_lens,
            )

    _emit_invariants_unnamed(lines, model, declared_lens)

    lines.append("(check-sat)")
    lines.append("(exit)")
    return "\n".join(lines) + "\n"


def compile_named_model(model: dict[str, Any]) -> tuple[str, list[AssertionLabel]]:
    """Same as compile_model_json_to_smt but boolean asserts use :named for unsat cores."""
    lines: list[str] = [
        "; Generated by packages/crucible — named assertions for Z3 unsat cores",
        "(set-logic QF_UFLIA)",
        "(set-option :produce-unsat-cores true)",
    ]
    labels: list[AssertionLabel] = []
    idx = [0]
    entities = model.get("entities") or []
    if not entities:
        lines += ["(check-sat)", "(exit)"]
        return "\n".join(lines) + "\n", []

    default_map = _default_field_map(model)
    len_needs = _fields_needing_len(model)
    declared_lens: set[str] = set()

    for ent in sorted(entities, key=lambda e: str(e.get("name", ""))):
        for tg in sorted(ent.get("transition_graphs") or [], key=lambda t: str(t.get("field", ""))):
            _emit_transition_graph_named(lines, labels, idx, ent, tg, default_map=default_map)
        tg_fields = _transition_field_names(ent)
        for field in sorted(ent.get("fields") or [], key=lambda f: str(f.get("name", ""))):
            fname = str(field.get("name", ""))
            if fname in tg_fields:
                continue
            _emit_standalone_field_named(
                lines,
                labels,
                idx,
                ent,
                field,
                default_map=default_map,
                len_needs=len_needs,
                declared_lens=declared_lens,
            )

    _emit_invariants_named(lines, labels, idx, model, declared_lens)

    lines.append("(check-sat)")
    lines.append("(exit)")
    return "\n".join(lines) + "\n", labels


def compile_allium_file(path: Path, *, named: bool = False) -> str:
    model = _run_allium_model(path)
    model = merge_overlay_model(path, model)
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

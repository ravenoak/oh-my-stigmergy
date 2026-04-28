"""Run Z3 on compiled SMT and map unsat cores to assertion labels."""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass
from pathlib import Path
from crucible.compile import _run_allium_model, compile_named_model, merge_overlay_model


@dataclass(frozen=True)
class SolveResult:
    status: str  # sat | unsat | unknown
    unsat_core: tuple[str, ...]
    raw_stdout: str


def run_z3(smt: str) -> SolveResult:
    proc = subprocess.run(
        ["z3", "-in"],
        input=smt,
        capture_output=True,
        text=True,
        check=False,
    )
    text = proc.stdout.strip()
    status = "unknown"
    for line in text.splitlines():
        s = line.strip()
        if s in ("sat", "unsat", "unknown"):
            status = s
            break
    core: list[str] = []
    if status == "unsat":
        lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
        if "unsat" in lines:
            i = lines.index("unsat")
            if i + 1 < len(lines):
                s = lines[i + 1]
                if s.startswith("(") and s.endswith(")") and "error" not in s.lower():
                    parts = s[1:-1].split()
                    if parts and all(re.match(r"^[a-zA-Z0-9_]+$", x) for x in parts):
                        core = parts
    return SolveResult(status=status, unsat_core=tuple(core), raw_stdout=text)


def explain_core(labels: list[dict[str, str]], unsat_core: tuple[str, ...], source: Path) -> str:
    by_name = {lb["name"]: lb for lb in labels}
    lines_out: list[str] = []
    src_lines = source.read_text(encoding="utf-8").splitlines()
    for name in unsat_core:
        lb = by_name.get(name)
        if lb is None:
            lines_out.append(f"- {name}: (unknown label)")
            continue
        lines_out.append(
            f"- {name}: entity {lb['entity']}.{lb['field']} kind={lb['kind']} — {source.name}"
        )
    lines_out.append("")
    lines_out.append("Source excerpt (first 40 lines):")
    for i, sl in enumerate(src_lines[:40], start=1):
        lines_out.append(f"  {i:3}| {sl}")
    return "\n".join(lines_out)


def solve_allium_file(path: Path) -> SolveResult:
    model = _run_allium_model(path)
    model = merge_overlay_model(path, model)
    smt, _labels = compile_named_model(model)
    return run_z3(smt)


def solve_allium_file_with_contradiction(path: Path, extra_named_assert: str) -> SolveResult:
    model = _run_allium_model(path)
    model = merge_overlay_model(path, model)
    smt, _labels = compile_named_model(model)
    smt = smt.replace("(check-sat)\n(exit)", "")
    smt += extra_named_assert.rstrip() + "\n(check-sat)\n(get-unsat-core)\n(exit)\n"
    return run_z3(smt)


def solve_spec_dir(spec_dir: Path) -> int:
    """Return 0 if every transition-bearing spec/*.allium model is sat under Z3."""
    failures = 0
    for path in sorted(spec_dir.glob("*.allium")):
        model = _run_allium_model(path)
        model = merge_overlay_model(path, model)
        entities = model.get("entities") or []
        if not any(e.get("transition_graphs") for e in entities):
            continue
        smt, _labels = compile_named_model(model)
        res = run_z3(smt)
        if res.status != "sat":
            print(f"FAIL {path.name}: {res.status}")
            print(res.raw_stdout)
            failures += 1
        else:
            print(f"OK {path.name}: sat")
    return 1 if failures else 0

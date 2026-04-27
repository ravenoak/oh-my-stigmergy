"""Load transition graphs from `allium model` JSON (single source of truth)."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path


class AlliumModelError(RuntimeError):
    """Raised when `allium model` fails or returns invalid JSON."""


def _run_model(allium_path: Path) -> dict:
    if not shutil.which("allium"):
        raise AlliumModelError("allium CLI not found on PATH")
    proc = subprocess.run(
        ["allium", "model", str(allium_path)],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise AlliumModelError(proc.stderr or proc.stdout or f"allium model failed ({proc.returncode})")
    return json.loads(proc.stdout)


def load_merged_model(spec_dir: Path) -> dict:
    """Merge entity lists from every `spec/*.allium` (per-file `allium model`)."""
    merged: dict = {"entities": [], "version": 3}
    seen: set[str] = set()
    paths = sorted(spec_dir.glob("*.allium"))
    if not paths:
        raise AlliumModelError(f"no .allium files under {spec_dir}")
    for path in paths:
        data = _run_model(path)
        for ent in data.get("entities", []):
            name = ent["name"]
            if name in seen:
                raise AlliumModelError(f"duplicate entity {name!r} across spec/*.allium merge")
            seen.add(name)
            merged["entities"].append(ent)
        ver = data.get("version")
        if ver is not None:
            merged["version"] = ver
    return merged

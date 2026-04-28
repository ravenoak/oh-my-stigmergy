"""Load allowed stance names from one or more validated config files."""

from __future__ import annotations

from pathlib import Path

from stance.validate import validate_file


def load_registry(path: Path | str) -> set[str]:
    """
    Return the sorted-iteration-stable union of keys in ``stance_vector``
    across JSON files.

    * If *path* is a file, that single file is validated and scanned.
    * If *path* is a directory, every ``*.json`` file in it (non-recursive) is
      validated and scanned, in lexicographic path order.
    """
    p = Path(path)
    keys: set[str] = set()
    if p.is_file():
        files = [p]
    elif p.is_dir():
        files = sorted(p.glob("*.json"))
        if not files:
            raise FileNotFoundError(f"stance registry directory has no *.json: {p}")
    else:
        raise FileNotFoundError(f"stance registry path not found: {p}")

    for fp in files:
        data = validate_file(fp)
        vec = data.get("stance_vector") or {}
        if not isinstance(vec, dict):
            continue
        for k in vec:
            keys.add(str(k))
    return keys

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Card:
    """Byte range for one source line (FR-2.1)."""

    file_path: str
    line: int  # 1-based
    char_start: int
    char_end: int
    text: str


def ingest_python_file(root: Path, file_path: Path) -> list[Card]:
    """Chunk file into one card per line with cumulative byte offsets."""
    rel = str(file_path.relative_to(root))
    raw = file_path.read_bytes()
    text = raw.decode("utf-8")
    cards: list[Card] = []
    offset = 0
    for i, line in enumerate(text.splitlines(keepends=True), start=1):
        start = offset
        offset += len(line.encode("utf-8"))
        end = offset
        cards.append(
            Card(
                file_path=rel,
                line=i,
                char_start=start,
                char_end=end,
                text=line.rstrip("\n"),
            )
        )
    return cards


_IMPORT_RE = re.compile(
    r"^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))",
    re.MULTILINE,
)


def extract_import_targets(source: str) -> list[str]:
    """Naive import targets for aspect graph (FR-2.2 MVP)."""
    out: list[str] = []
    for m in _IMPORT_RE.finditer(source):
        mod = m.group(1) or m.group(2)
        if mod:
            out.append(mod.split(".")[0])
    return out

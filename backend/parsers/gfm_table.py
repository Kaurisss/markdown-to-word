"""GFM table parsing — detection, parsing, and alignment extraction.

Extracted from parser.py to separate table-specific logic from inline
formatting parsing.  The shared markdown-it instance and inline token
reconstruction helper are imported from parser.py.
"""

import re
from typing import Any, Dict, Optional

from ..parser import _md, _reconstruct_raw_inline


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _split_table_row(line: str) -> list[str]:
    cells: list[str] = []
    current: list[str] = []
    i = 0
    while i < len(line):
        ch = line[i]
        if ch == "\\" and i + 1 < len(line) and line[i + 1] == "|":
            current.append("|")
            i += 2
            continue
        if ch == "|":
            cells.append("".join(current).strip())
            current = []
            i += 1
            continue
        current.append(ch)
        i += 1
    cells.append("".join(current).strip())
    return cells


def _parse_alignment_markers(cells: list[str]) -> Optional[list[Optional[str]]]:
    alignments: list[Optional[str]] = []
    for cell in cells:
        trimmed = cell.strip()
        if not trimmed or "-" not in trimmed or set(trimmed) - set("-:"):
            return None
        if trimmed.startswith(":") and trimmed.endswith(":"):
            alignments.append("center")
        elif trimmed.startswith(":"):
            alignments.append("left")
        elif trimmed.endswith(":"):
            alignments.append("right")
        else:
            alignments.append(None)
    return alignments


# ---------------------------------------------------------------------------
# Public: parse_gfm_table
# ---------------------------------------------------------------------------
def parse_gfm_table(lines: list[str]) -> Optional[Dict[str, Any]]:
    """
    Parse GFM table lines into a 2D list of cell contents.
    Returns None if the lines don't form a valid GFM table.

    Implementation: delegates to markdown-it-py's table plugin.

    Cell text is returned as raw markdown (preserving **bold**, `code`, etc.)
    so that downstream add_formatted_runs() can handle inline rendering.
    """
    if len(lines) < 2:
        return None

    src = "\n".join(lines)
    tokens = _md.parse(src)

    rows: list[list[str]] = []
    alignments: list[Optional[str]] = []
    current_row: list[str] = []
    current_alignments: list[Optional[str]] = []

    for tok in tokens:
        if tok.type == "tr_open":
            current_row = []
            current_alignments = []
        elif tok.type == "tr_close":
            if current_row:
                rows.append(current_row)
                if not alignments and current_alignments:
                    alignments = current_alignments
        elif tok.type in ("th_open", "td_open"):
            style = tok.attrGet("style") or ""
            if "text-align:center" in style:
                current_alignments.append("center")
            elif "text-align:right" in style:
                current_alignments.append("right")
            elif "text-align:left" in style:
                current_alignments.append("left")
            else:
                current_alignments.append(None)
        elif tok.type == "inline":
            children = tok.children or []
            raw = _reconstruct_raw_inline(children)
            current_row.append(raw)

    if not rows:
        return None

    return {"rows": rows, "alignments": alignments}


# ---------------------------------------------------------------------------
# Public: table-line detection (used by converter.py for buffering)
# ---------------------------------------------------------------------------
def is_table_line(line: str) -> bool:
    """Check if a line looks like part of a GFM table."""
    stripped = line.strip()
    if not stripped:
        return False
    if '|' in stripped and not stripped.startswith('```'):
        return True
    return False


def is_table_separator(line: str) -> bool:
    """Check if a line is a GFM table separator (e.g., |---|---|)."""
    separator_pattern = r'^\s*\|?\s*[-:]+[-|\s:]*\|?\s*$'
    return bool(re.match(separator_pattern, line.strip()))

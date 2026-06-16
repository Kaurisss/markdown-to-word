"""Inline formatting parser and GFM table parsing."""

import re
from typing import Any, Dict, Optional


def parse_inline_formatting(text: str) -> list[Dict[str, Any]]:
    """
    Parse inline formatting from text and return a list of segments.
    Each segment has: text, bold, italic, code, link (url or None)

    Supports: **bold**, *italic*, `code`, [text](url)
    """
    segments = []

    # Combined pattern for all inline formatting
    # Order matters: bold (**) before italic (*) to avoid conflicts
    # Using non-greedy matching and proper escaping
    pattern = r'(\*\*(.+?)\*\*)|(?<!\*)(\*([^*]+?)\*)(?!\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))'

    last_end = 0
    for match in re.finditer(pattern, text):
        # Add any text before this match as plain text
        if match.start() > last_end:
            plain_text = text[last_end:match.start()]
            if plain_text:
                segments.append({
                    'text': plain_text,
                    'bold': False,
                    'italic': False,
                    'code': False,
                    'link': None
                })

        # Determine which group matched
        if match.group(1):  # Bold: **text**
            segments.append({
                'text': match.group(2),
                'bold': True,
                'italic': False,
                'code': False,
                'link': None
            })
        elif match.group(3):  # Italic: *text*
            segments.append({
                'text': match.group(4),
                'bold': False,
                'italic': True,
                'code': False,
                'link': None
            })
        elif match.group(5):  # Code: `text`
            segments.append({
                'text': match.group(6),
                'bold': False,
                'italic': False,
                'code': True,
                'link': None
            })
        elif match.group(7):  # Link: [text](url)
            segments.append({
                'text': match.group(8),
                'bold': False,
                'italic': False,
                'code': False,
                'link': match.group(9)
            })

        last_end = match.end()

    # Add any remaining text after the last match
    if last_end < len(text):
        remaining = text[last_end:]
        if remaining:
            segments.append({
                'text': remaining,
                'bold': False,
                'italic': False,
                'code': False,
                'link': None
            })

    # If no formatting found, return the whole text as plain
    if not segments:
        segments.append({
            'text': text,
            'bold': False,
            'italic': False,
            'code': False,
            'link': None
        })

    return segments


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


def parse_gfm_table(lines: list[str]) -> Optional[Dict[str, Any]]:
    """
    Parse GFM table lines into a 2D list of cell contents.
    Returns None if the lines don't form a valid GFM table.
    """
    if len(lines) < 2:
        return None

    separator_line = lines[1].strip()
    if separator_line.startswith("|"):
        separator_line = separator_line[1:]
    if separator_line.endswith("|"):
        separator_line = separator_line[:-1]
    separator_cells = _split_table_row(separator_line)
    alignments = _parse_alignment_markers(separator_cells)
    if alignments is None:
        return None

    rows = []
    for i, line in enumerate(lines):
        if i == 1:  # Skip separator line
            continue
        # Parse cells from the line
        line = line.strip()
        if line.startswith('|'):
            line = line[1:]
        if line.endswith('|'):
            line = line[:-1]
        cells = _split_table_row(line)
        if cells:
            rows.append(cells)

    if not rows:
        return None
    return {"rows": rows, "alignments": alignments}


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

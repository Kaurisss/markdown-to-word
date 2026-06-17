"""Table conversion — detection, parsing, and DOCX rendering.

Centralises all table-specific logic that was previously scattered across
parser.py, elements.py, and converter.py.  Downstream code should import
from here for table operations; the original modules re-export for backward
compatibility.
"""

from typing import Any, Dict, Optional

from docx import Document

from ..parser import (
    parse_gfm_table,
    is_table_line,
    is_table_separator,
)
from ..elements import add_table


# ---------------------------------------------------------------------------
# Buffered processing — the table buffering loop previously in converter.py
# ---------------------------------------------------------------------------

def flush_table_buffer(
    doc: Document,
    table_buf: list[str],
    conf: Dict[str, Any],
) -> None:
    """Parse accumulated table lines and add the table to *doc*.

    Does nothing if *table_buf* is empty or the content is not a valid GFM
    table.
    """
    if not table_buf:
        return
    table_data = parse_gfm_table(table_buf)
    if table_data:
        add_table(doc, table_data["rows"], conf, table_data["alignments"])


def process_table_buffer(
    doc: Document,
    line: str,
    in_table: bool,
    table_buf: list[str],
    conf: Dict[str, Any],
    next_line: Optional[str] = None,
) -> tuple[bool, list[str], bool]:
    """Run one iteration of the table-buffer state machine.

    Parameters
    ----------
    doc : Document
        The Word document being built.
    line : str
        Current line (already ``rstrip("\\n")``).
    in_table : bool
        Whether we are currently inside a table.
    table_buf : list[str]
        Lines accumulated so far for the current table.
    conf : dict
        Style configuration.
    next_line : str or None
        The line following *line* (used for table-start lookahead).

    Returns
    -------
    (consumed, table_buf, in_table) : tuple
        *consumed* is ``True`` when *line* was handled (caller should skip
        further processing and advance).  *table_buf* and *in_table* are the
        updated state.
    """
    # --- detect table start ---
    if not in_table:
        if is_table_line(line) and next_line is not None and is_table_separator(next_line):
            return True, [line], True
        return False, table_buf, in_table

    # --- inside a table: accumulate or flush ---
    if is_table_line(line) or is_table_separator(line):
        table_buf.append(line)
        return True, table_buf, in_table

    # line is not a table row → flush and fall through
    flush_table_buffer(doc, table_buf, conf)
    return False, [], False


# ---------------------------------------------------------------------------
# Re-exports for backward compatibility
# ---------------------------------------------------------------------------
__all__ = [
    "parse_gfm_table",
    "is_table_line",
    "is_table_separator",
    "add_table",
    "flush_table_buffer",
    "process_table_buffer",
]

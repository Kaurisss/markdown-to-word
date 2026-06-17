"""Code-block conversion — fence detection and DOCX rendering.

Centralises code-block-specific logic so that converter.py does not need
to manage the buffering state machine directly.
"""

import re
from typing import Any, Dict, Tuple

from docx import Document

from ..elements import add_code_block


def flush_code_buffer(
    doc: Document,
    code_buf: list[str],
    conf: Dict[str, Any],
) -> None:
    """Render accumulated code lines to *doc*.

    Does nothing if *code_buf* is empty.
    """
    if not code_buf:
        return
    add_code_block(doc, code_buf, conf)


def is_fence(line: str) -> bool:
    """Return True when *line* is a code-fence delimiter (```` ``` ````)."""
    return bool(re.match(r"^```", line))


def process_code_buffer(
    doc: Document,
    line: str,
    in_code: bool,
    code_buf: list[str],
    conf: Dict[str, Any],
) -> Tuple[bool, list[str], bool]:
    """Run one iteration of the code-block state machine.

    Parameters
    ----------
    doc : Document
        The Word document being built.
    line : str
        Current line (already ``rstrip("\\n")``).
    in_code : bool
        Whether we are currently inside a code block.
    code_buf : list[str]
        Lines accumulated so far for the current code block.
    conf : dict
        Style configuration.

    Returns
    -------
    (consumed, code_buf, in_code) : tuple
        *consumed* is ``True`` when *line* was handled (caller should skip
        further processing and advance).  *code_buf* and *in_code* are the
        updated state.
    """
    # --- fence delimiter ---
    if is_fence(line):
        if in_code:
            # closing fence → flush
            flush_code_buffer(doc, code_buf, conf)
            return True, [], False
        else:
            # opening fence → start collecting
            return True, [], True

    # --- inside a code block: accumulate ---
    if in_code:
        code_buf.append(line)
        return True, code_buf, in_code

    # --- not in a code block: fall through ---
    return False, code_buf, in_code


__all__ = [
    "flush_code_buffer",
    "is_fence",
    "process_code_buffer",
]

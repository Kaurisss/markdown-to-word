"""Table of Contents conversion — detection and DOCX rendering.

Centralises TOC-specific logic so that converter.py does not need to
know the internals of TOC field injection.
"""

import sys
from typing import Any, Dict

from docx import Document

from ..elements import add_table_of_contents


def should_add_toc(conf: Dict[str, Any]) -> bool:
    """Return True when the configuration requests a Table of Contents."""
    return bool(conf.get("global", {}).get("includeTableOfContents", False))


def add_toc(doc: Document, conf: Dict[str, Any]) -> None:
    """Add a Table of Contents to *doc* if the config requests one.

    Errors are printed to stderr but do **not** abort the conversion —
    matching the previous behaviour in converter.py.
    """
    if not should_add_toc(conf):
        return
    try:
        add_table_of_contents(doc, conf)
    except Exception as e:
        print(f"Warning: Failed to add table of contents: {e}", file=sys.stderr)


__all__ = ["should_add_toc", "add_toc"]

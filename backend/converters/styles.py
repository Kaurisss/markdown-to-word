"""Style injection — OoXML paragraph/run formatting utilities.

Facade that re-exports the low-level helpers from styling.py so that
downstream code (elements, converter) imports from a single location
consistent with the other converter sub-modules.
"""

from ..styling import (  # noqa: F401
    hex_to_rgb,
    apply_paragraph_fmt,
    apply_run_fmt,
    _set_paragraph_shading,
    _set_run_shading,
    _get_alignment,
    _ensure_east_asia_font,
)

__all__ = [
    "hex_to_rgb",
    "apply_paragraph_fmt",
    "apply_run_fmt",
    "_set_paragraph_shading",
    "_set_run_shading",
    "_get_alignment",
    "_ensure_east_asia_font",
]

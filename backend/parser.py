"""Inline formatting parser and GFM table parsing.

Powered by markdown-it-py for robust CommonMark + GFM parsing.
Public API is unchanged — callers see the same dict/list shapes.
"""

import re
from typing import Any, Dict, Optional

from markdown_it import MarkdownIt

# ---------------------------------------------------------------------------
# Shared markdown-it instance (table + strikethrough plugins enabled)
# ---------------------------------------------------------------------------
_md = MarkdownIt().enable("table").enable("strikethrough")


# ---------------------------------------------------------------------------
# Internal: reconstruct raw markdown text from markdown-it inline tokens
# ---------------------------------------------------------------------------
def _reconstruct_raw_inline(children: list) -> str:
    """Walk markdown-it inline children and rebuild the original markdown text.

    This preserves formatting markers (**, *, ``, ~~, etc.) so that
    downstream consumers (e.g. add_formatted_runs) receive familiar syntax.
    """
    parts: list[str] = []
    link_stack: list[str] = []  # stack to handle nested/sequential links

    for tok in children:
        if tok.type == "text":
            parts.append(tok.content)
        elif tok.type == "code_inline":
            parts.append("`" + tok.content + "`")
        elif tok.type == "softbreak":
            parts.append(" ")
        elif tok.type == "hardbreak":
            parts.append("  \n")
        elif tok.type == "strong_open":
            parts.append("**")
        elif tok.type == "strong_close":
            parts.append("**")
        elif tok.type == "em_open":
            parts.append("*")
        elif tok.type == "em_close":
            parts.append("*")
        elif tok.type == "s_open":
            parts.append("~~")
        elif tok.type == "s_close":
            parts.append("~~")
        elif tok.type == "html_inline":
            parts.append(tok.content)
        elif tok.type == "link_open":
            link_stack.append(tok.attrGet("href") or "")
            parts.append("[")
        elif tok.type == "link_close":
            href = link_stack.pop() if link_stack else ""
            parts.append("](")
            parts.append(href)
            parts.append(")")

    return "".join(parts)


# ---------------------------------------------------------------------------
# Segment builder (unchanged helper)
# ---------------------------------------------------------------------------
def _inline_segment(
    text: str,
    *,
    bold: bool = False,
    italic: bool = False,
    code: bool = False,
    underline: bool = False,
    strike: bool = False,
    link: Optional[str] = None,
) -> Dict[str, Any]:
    return {
        "text": text,
        "bold": bold,
        "italic": italic,
        "code": code,
        "underline": underline,
        "strike": strike,
        "link": link,
    }


# ---------------------------------------------------------------------------
# Regex fallback (used when markdown-it-py html_inline is unavailable)
# ---------------------------------------------------------------------------
_UNDERLINE_RE = re.compile(r"<u>(.+?)</u>")


def _parse_inline_formatting_regex(text: str) -> list[Dict[str, Any]]:
    """Regex-based fallback — mirrors the original inline parser.

    Only used when markdown-it-py fails to produce html_inline tokens for <u>.
    """
    segments: list[Dict[str, Any]] = []

    pattern = (
        r"(~~(.+?)~~)"
        r"|(<u>(.+?)</u>)"
        r"|(\*\*(.+?)\*\*)"
        r"|(?<!\*)(\*([^*]+?)\*)(?!\*)"
        r"|(`([^`]+)`)"
        r"|(\[([^\]]+)\]\(([^)]+)\))"
    )

    last_end = 0
    for match in re.finditer(pattern, text):
        if match.start() > last_end:
            plain = text[last_end:match.start()]
            if plain:
                segments.append(_inline_segment(plain))
        if match.group(1):
            segments.append(_inline_segment(match.group(2), strike=True))
        elif match.group(3):
            segments.append(_inline_segment(match.group(4), underline=True))
        elif match.group(5):
            segments.append(_inline_segment(match.group(6), bold=True))
        elif match.group(7):
            segments.append(_inline_segment(match.group(8), italic=True))
        elif match.group(9):
            segments.append(_inline_segment(match.group(10), code=True))
        elif match.group(11):
            segments.append(_inline_segment(match.group(12), link=match.group(13)))
        last_end = match.end()

    if last_end < len(text):
        remaining = text[last_end:]
        if remaining:
            segments.append(_inline_segment(remaining))

    if not segments:
        segments.append(_inline_segment(text))

    return segments


# ---------------------------------------------------------------------------
# Public: parse_inline_formatting
# ---------------------------------------------------------------------------
def parse_inline_formatting(text: str) -> list[Dict[str, Any]]:
    """
    Parse inline formatting from text and return a list of segments.
    Each segment has: text, bold, italic, code, underline, strike, link

    Supports: ~~strike~~, <u>underline</u>, **bold**, *italic*, `code`, [text](url)

    Implementation: uses markdown-it-py for robust tokenisation, then converts
    tokens back to the legacy segment-dict format.
    """
    tokens = _md.parseInline(text)
    if not tokens:
        return [_inline_segment(text)]

    children = tokens[0].children or []
    if not children:
        return [_inline_segment(text)]

    # Defensive: if <u>…</u> underline pattern is present but markdown-it-py
    # didn't produce html_inline tokens (e.g. html option disabled), fall back
    # to regex.  Only match the full pattern to avoid false positives like
    # "**<u>**" where <u> is a literal HTML entity inside bold formatting.
    if _UNDERLINE_RE.search(text) and not any(c.type == "html_inline" for c in children):
        return _parse_inline_formatting_regex(text)

    segments: list[Dict[str, Any]] = []
    current_text: list[str] = []
    current_bold = False
    current_italic = False
    current_code = False
    current_strike = False
    current_underline = False
    current_link: Optional[str] = None
    underline_depth = 0  # track nested <u>…</u>

    def _flush():
        t = "".join(current_text)
        if t:
            segments.append(
                _inline_segment(
                    t,
                    bold=current_bold,
                    italic=current_italic,
                    code=current_code,
                    underline=current_underline,
                    strike=current_strike,
                    link=current_link,
                )
            )
            current_text.clear()

    for tok in children:
        if tok.type == "text":
            current_text.append(tok.content)

        elif tok.type == "code_inline":
            _flush()
            segments.append(_inline_segment(
                tok.content,
                code=True,
                bold=current_bold,
                italic=current_italic,
                underline=current_underline,
                strike=current_strike,
                link=current_link,
            ))

        elif tok.type == "strong_open":
            _flush()
            current_bold = True
        elif tok.type == "strong_close":
            _flush()
            current_bold = False

        elif tok.type == "em_open":
            _flush()
            current_italic = True
        elif tok.type == "em_close":
            _flush()
            current_italic = False

        elif tok.type == "s_open":
            _flush()
            current_strike = True
        elif tok.type == "s_close":
            _flush()
            current_strike = False

        elif tok.type == "html_inline":
            content = tok.content
            if content == "<u>":
                _flush()
                underline_depth += 1
                current_underline = True
            elif content == "</u>":
                _flush()
                underline_depth -= 1
                if underline_depth <= 0:
                    underline_depth = 0
                    current_underline = False
            else:
                current_text.append(content)

        elif tok.type == "link_open":
            _flush()
            current_link = tok.attrGet("href") or ""
        elif tok.type == "link_close":
            _flush()
            current_link = None

        elif tok.type == "softbreak":
            current_text.append(" ")
        elif tok.type == "hardbreak":
            current_text.append("\n")

    _flush()

    if not segments:
        segments.append(_inline_segment(text))

    return segments


# ---------------------------------------------------------------------------
# Legacy helpers (kept for backward compatibility, not used by new parse_gfm_table)
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

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
# Backward-compatible re-exports from parsers.gfm_table
# ---------------------------------------------------------------------------
from .parsers.gfm_table import (  # noqa: F401
    parse_gfm_table,
    is_table_line,
    is_table_separator,
)


"""Table of Contents conversion — detection and DOCX rendering.

Centralises TOC-specific logic so that converter.py does not need to
know the internals of TOC field injection.
"""

import sys
from typing import Any, Dict

from docx import Document
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT

from ..converters.styles import _ensure_east_asia_font


def should_add_toc(conf: Dict[str, Any]) -> bool:
    """Return True when the configuration requests a Table of Contents."""
    return bool(conf.get("global", {}).get("includeTableOfContents", False))


def add_table_of_contents(doc: Document, conf: Dict[str, Any]) -> None:
    """
    Add a Table of Contents field to the document.
    The TOC will be auto-updated when the document is opened in Word.
    """
    toc_title = doc.add_paragraph()
    toc_title.paragraph_format.space_before = Pt(12)
    toc_title.paragraph_format.space_after = Pt(12)
    toc_title.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    run = toc_title.add_run("目录")
    run.bold = True
    run.font.size = Pt(16)
    global_conf = conf.get("global", {})
    base_cn = global_conf.get("baseFontCn", "SimSun")
    base_en = global_conf.get("baseFontEn", "") or base_cn
    _ensure_east_asia_font(run, base_cn, base_en)

    toc_paragraph = doc.add_paragraph()

    run = toc_paragraph.add_run()
    fld_char_begin = OxmlElement('w:fldChar')
    fld_char_begin.set(qn('w:fldCharType'), 'begin')

    instr_text = OxmlElement('w:instrText')
    instr_text.set(qn('xml:space'), 'preserve')
    instr_text.text = ' TOC \\o "1-3" \\h \\z \\u '

    fld_char_separate = OxmlElement('w:fldChar')
    fld_char_separate.set(qn('w:fldCharType'), 'separate')

    fld_char_end = OxmlElement('w:fldChar')
    fld_char_end.set(qn('w:fldCharType'), 'end')

    run._r.append(fld_char_begin)
    run._r.append(instr_text)
    run._r.append(fld_char_separate)

    placeholder_run = toc_paragraph.add_run('右键点击并选择"更新域"，或按 Ctrl+A 然后 F9')
    placeholder_run.italic = True
    placeholder_run.font.color.rgb = RGBColor(128, 128, 128)
    placeholder_run.font.size = Pt(10)

    end_run = toc_paragraph.add_run()
    end_run._r.append(fld_char_end)

    doc.add_page_break()


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


__all__ = ["should_add_toc", "add_toc", "add_table_of_contents"]

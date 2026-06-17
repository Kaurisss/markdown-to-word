"""Document element builders: heading, body, quote, list, code, table, hr, toc."""

import re
from typing import Any, Dict, Optional

from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT

from .converters.styles import (
    apply_paragraph_fmt, apply_run_fmt, _ensure_east_asia_font,
    _set_run_shading, _get_alignment,
)
from .parser import parse_inline_formatting


def add_hyperlink(paragraph, url: str, text: str, style_config: Dict[str, Any], global_config: Dict[str, Any]):
    """Add a hyperlink to a paragraph."""
    part = paragraph.part
    r_id = part.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)

    run = paragraph.add_run(text)
    apply_run_fmt(run, style_config, global_config)

    run.font.color.rgb = RGBColor(0, 0, 255)
    run.underline = True

    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)
    hyperlink.append(run._r)
    paragraph._p.append(hyperlink)


def add_formatted_runs(paragraph, text: str, base_style: Dict[str, Any], global_config: Dict[str, Any], code_style: Dict[str, Any] = None) -> None:
    """Add text with inline formatting to a paragraph."""
    segments = parse_inline_formatting(text)

    for segment in segments:
        if segment['link']:
            add_hyperlink(paragraph, segment['link'], segment['text'], base_style, global_config)
        else:
            run = paragraph.add_run(segment['text'])

            if segment['code'] and code_style:
                apply_run_fmt(run, code_style, global_config)
            else:
                apply_run_fmt(run, base_style, global_config)

            if segment.get('bold'):
                run.bold = True
            if segment.get('italic'):
                run.italic = True
            if segment.get('underline'):
                run.underline = True
            if segment.get('strike'):
                run.font.strike = True
            if segment.get('code'):
                code_font = code_style.get('fontFamily', 'Courier New') if code_style else 'Courier New'
                run.font.name = code_font
                _ensure_east_asia_font(run, global_config.get('baseFontCn', 'SimSun'), code_font)
                if code_style:
                    bg_color = code_style.get('backgroundColor', '#F5F7F9')
                    _set_run_shading(run, bg_color)


def add_heading(doc: Document, text: str, level: int, conf: Dict[str, Any]) -> None:
    style = conf["styles"].get(f"h{level}", conf["styles"]["h1"])

    heading_style_map = {
        1: "Heading 1",
        2: "Heading 2",
        3: "Heading 3",
        4: "Heading 4",
        5: "Heading 5",
        6: "Heading 6",
    }

    builtin_style = heading_style_map.get(level, "Heading 1")
    try:
        p = doc.add_paragraph(style=builtin_style)
    except KeyError:
        p = doc.add_paragraph()

    apply_paragraph_fmt(p, style)
    code_style = conf["styles"].get("code", {})
    add_formatted_runs(p, text.strip(), style, conf["global"], code_style)


def add_body(doc: Document, text: str, conf: Dict[str, Any]) -> None:
    style = conf["styles"]["body"]
    p = doc.add_paragraph()
    apply_paragraph_fmt(p, style)

    stripped = text.lstrip()
    if re.match(r"^(\*\*|\*|`|\[|!\[)", stripped):
        p.paragraph_format.first_line_indent = 0

    code_style = conf["styles"].get("code", {})
    add_formatted_runs(p, text, style, conf["global"], code_style)


def add_quote(doc: Document, text: str, conf: Dict[str, Any]) -> None:
    style = conf["styles"]["quote"]
    p = doc.add_paragraph()
    apply_paragraph_fmt(p, style)
    try:
        p.paragraph_format.left_indent = Inches(0.25)
    except Exception:
        pass
    code_style = conf["styles"].get("code", {})
    add_formatted_runs(p, text, style, conf["global"], code_style)


def add_list_item(doc: Document, text: str, ordered: bool, conf: Dict[str, Any], level: int = 0) -> None:
    style = conf["styles"]["body"].copy()
    style["firstLineIndent"] = 0

    p = doc.add_paragraph()
    apply_paragraph_fmt(p, style)

    try:
        p.style = "List Number" if ordered else "List Bullet"
    except Exception:
        pass

    if level > 0:
        try:
            p.paragraph_format.left_indent = Inches(level * 0.5)
        except Exception:
            pass

    code_style = conf["styles"].get("code", {})
    add_formatted_runs(p, text, style, conf["global"], code_style)


def add_code_block(doc: Document, lines: list[str], conf: Dict[str, Any]) -> None:
    style = conf["styles"]["code"]
    for line in lines:
        p = doc.add_paragraph()
        apply_paragraph_fmt(p, style)
        run = p.add_run(line if line.strip() else " ")
        apply_run_fmt(run, style, conf["global"])


def add_horizontal_rule(doc: Document, conf: Dict[str, Any]) -> None:
    """Add a horizontal rule (line divider) to the document."""
    mode = conf.get("global", {}).get("horizontalRule", "default")

    if mode == "hidden":
        return

    if mode == "page_break":
        doc.add_page_break()
        return

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)

    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), 'CCCCCC')
    pBdr.append(bottom)
    pPr.append(pBdr)


def _set_cell_border(cell, border_color: str = "000000", border_size: int = 4) -> None:
    """Set borders for a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for border_name in ['top', 'left', 'bottom', 'right']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), str(border_size))
        border.set(qn('w:color'), border_color)
        tcBorders.append(border)
    tcPr.append(tcBorders)


def _set_cell_shading(cell, fill_color: str) -> None:
    """Set background shading for a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), fill_color)
    tcPr.append(shading)


def _set_cell_vertical_alignment(cell, align: str = "center") -> None:
    """Set vertical alignment for a table cell."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    vAlign = OxmlElement('w:vAlign')
    vAlign.set(qn('w:val'), align)
    tcPr.append(vAlign)


def add_table(doc: Document, table_data: list[list[str]], conf: Dict[str, Any], alignments: Optional[list[Optional[str]]] = None) -> None:
    """Add a table to the document with proper borders and header styling."""
    if not table_data or not table_data[0]:
        return

    num_rows = len(table_data)
    num_cols = max(len(row) for row in table_data)

    table = doc.add_table(rows=num_rows, cols=num_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    style = conf["styles"].get("body", {})
    global_conf = conf.get("global", {})

    for row_idx, row_data in enumerate(table_data):
        row = table.rows[row_idx]
        for col_idx in range(num_cols):
            cell = row.cells[col_idx]
            cell_text = row_data[col_idx] if col_idx < len(row_data) else ""

            _set_cell_border(cell)
            _set_cell_vertical_alignment(cell, "center")

            if row_idx == 0:
                _set_cell_shading(cell, "E5E7EB")

            paragraph = cell.paragraphs[0]

            table_style = style.copy()
            table_style["firstLineIndent"] = 0
            apply_paragraph_fmt(paragraph, table_style)

            code_style = conf["styles"].get("code", {})
            add_formatted_runs(paragraph, cell_text, table_style, global_conf, code_style)

            if alignments and col_idx < len(alignments):
                align = _get_alignment(alignments[col_idx])
                if align is not None:
                    paragraph.alignment = align

            if row_idx == 0:
                for run in paragraph.runs:
                    run.bold = True


def set_page_margins(doc: Document, margin_inch: float) -> None:
    for section in doc.sections:
        section.top_margin = Inches(margin_inch)
        section.bottom_margin = Inches(margin_inch)
        section.left_margin = Inches(margin_inch)
        section.right_margin = Inches(margin_inch)


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

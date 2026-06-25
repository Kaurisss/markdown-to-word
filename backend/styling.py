"""OoXML helpers and paragraph/run formatting utilities."""

from typing import Any, Dict, Optional

from docx.shared import Pt, Inches, RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT, WD_LINE_SPACING


def _set_paragraph_shading(paragraph, color_hex: str):
    """Set background shading for a paragraph."""
    if not color_hex:
        return
    fill_color = str(color_hex).strip().lstrip("#")

    pPr = paragraph._p.get_or_add_pPr()
    existing_shd = pPr.find(qn('w:shd'))
    if existing_shd is not None:
        pPr.remove(existing_shd)

    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_color)
    pPr.append(shd)


def hex_to_rgb(hex_str: str) -> RGBColor:
    s = hex_str.strip().lstrip("#")
    if len(s) == 3:
        try:
            r = int(s[0] * 2, 16)
            g = int(s[1] * 2, 16)
            b = int(s[2] * 2, 16)
            return RGBColor(r, g, b)
        except Exception:
            return RGBColor(0, 0, 0)
    if len(s) != 6:
        return RGBColor(0, 0, 0)
    try:
        r = int(s[0:2], 16)
        g = int(s[2:4], 16)
        b = int(s[4:6], 16)
        return RGBColor(r, g, b)
    except Exception:
        return RGBColor(0, 0, 0)


def _set_run_shading(run, color_hex: str) -> None:
    """Set background shading for a run (inline text)."""
    if not color_hex:
        return
    fill_color = str(color_hex).strip().lstrip("#")

    r = run._r
    rPr = r.get_or_add_rPr()

    existing_shd = rPr.find(qn('w:shd'))
    if existing_shd is not None:
        rPr.remove(existing_shd)

    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_color)
    rPr.append(shd)


def _get_alignment(value: Optional[str]) -> Optional[int]:
    if not value:
        return None
    m = {
        "left": WD_PARAGRAPH_ALIGNMENT.LEFT,
        "center": WD_PARAGRAPH_ALIGNMENT.CENTER,
        "right": WD_PARAGRAPH_ALIGNMENT.RIGHT,
        "justify": WD_PARAGRAPH_ALIGNMENT.JUSTIFY,
    }
    return m.get(value.lower())


def apply_paragraph_fmt(paragraph, style_config: Dict[str, Any]) -> None:
    pf = paragraph.paragraph_format
    line_spacing = style_config.get("lineSpacing")
    if line_spacing is not None:
        try:
            if isinstance(line_spacing, str) and str(line_spacing).lower().endswith("pt"):
                val = float(str(line_spacing).lower().replace("pt", "").strip())
                pf.line_spacing_rule = WD_LINE_SPACING.EXACTLY
                pf.line_spacing = Pt(val)
            else:
                pf.line_spacing = float(line_spacing)
        except Exception:
            pass
    space_before = style_config.get("spaceBefore")
    if space_before is not None:
        try:
            pf.space_before = Pt(float(space_before))
        except Exception:
            pass
    space_after = style_config.get("spaceAfter")
    if space_after is not None:
        try:
            pf.space_after = Pt(float(space_after))
        except Exception:
            pass
    align = _get_alignment(style_config.get("alignment"))
    if align is not None:
        pf.alignment = align
    first_indent_chars = style_config.get("firstLineIndent")
    if first_indent_chars is not None:
        try:
            inches = (float(first_indent_chars) * 12.0) / 72.0
            pf.first_line_indent = Inches(inches)
        except Exception:
            pass

    bg_color = style_config.get("backgroundColor")
    if bg_color:
        _set_paragraph_shading(paragraph, bg_color)


def _ensure_east_asia_font(run, cn_font: str, en_font: str) -> None:
    run.font.name = en_font
    r = run._element
    rPr = r.rPr
    if rPr is None:
        rPr = OxmlElement("w:rPr")
        r.append(rPr)
    rFonts = rPr.rFonts
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:eastAsia"), cn_font)
    rFonts.set(qn("w:ascii"), en_font)
    rFonts.set(qn("w:hAnsi"), en_font)


def apply_run_fmt(run, style_config: Dict[str, Any], global_config: Dict[str, Any]) -> None:
    font_size = style_config.get("fontSize")
    if font_size:
        try:
            run.font.size = Pt(float(font_size))
        except Exception:
            pass
    if style_config.get("bold") is not None:
        run.bold = bool(style_config.get("bold"))
    if style_config.get("italic") is not None:
        run.italic = bool(style_config.get("italic"))
    color_hex = style_config.get("color")
    if color_hex:
        run.font.color.rgb = hex_to_rgb(str(color_hex))

    base_cn = (global_config.get("baseFontCn") or "SimSun")
    base_en = (global_config.get("baseFontEn") or base_cn)

    ff = style_config.get("fontFamily")
    ff_en = style_config.get("fontFamilyEn")
    if ff:
        _ensure_east_asia_font(run, ff, ff_en or base_en or ff)
    else:
        _ensure_east_asia_font(run, base_cn, ff_en or base_en or base_cn)

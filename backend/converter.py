"""Markdown-to-Word document converter."""

import os
import re
import sys
from typing import Any, Dict

from docx import Document

from .errors import (
    FileError, PermissionError_, ConfigError,
    ConversionError, DocxGenerationError,
)
from .parser import parse_gfm_table, is_table_line, is_table_separator
from .elements import (
    add_heading, add_body, add_quote, add_list_item,
    add_code_block, add_horizontal_rule, add_table,
    set_page_margins, add_table_of_contents,
)


def _is_output_permission_error(error: Exception) -> bool:
    """Check if an exception is caused by output file permission/lock issues."""
    if isinstance(error, PermissionError):
        return True

    winerror = getattr(error, "winerror", None)
    if winerror in {5, 32}:
        return True

    errno = getattr(error, "errno", None)
    if errno in {13, 16}:
        return True

    text = str(error).lower()
    locked_markers = (
        "permission denied",
        "being used by another process",
        "另一个程序正在使用此文件",
        "拒绝访问",
    )
    return any(marker in text for marker in locked_markers)


def convert(input_path: str, output_path: str, conf: Dict[str, Any]) -> None:
    """Convert Markdown file to Word document with proper error handling."""
    if not os.path.exists(input_path):
        raise FileError(
            "Input file not found",
            path=input_path
        )

    output_dir = os.path.dirname(output_path) or '.'
    if not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir, exist_ok=True)
        except PermissionError as e:
            raise PermissionError_(
                "Cannot create output directory",
                path=output_dir,
                details=str(e)
            )

    try:
        doc = Document()
    except Exception as e:
        raise DocxGenerationError(
            "Failed to create Word document",
            details=str(e)
        )

    try:
        margin_value = float(conf.get("global", {}).get("pageMargin", 1.0))
    except Exception as e:
        raise ConfigError("Invalid pageMargin value", details=str(e))
    set_page_margins(doc, margin_value)

    if conf.get("global", {}).get("includeTableOfContents", False):
        try:
            add_table_of_contents(doc, conf)
        except Exception as e:
            print(f"Warning: Failed to add table of contents: {e}", file=sys.stderr)

    try:
        with open(input_path, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()
    except PermissionError as e:
        raise PermissionError_(
            "Permission denied reading input file",
            path=input_path,
            details=str(e)
        )
    except UnicodeDecodeError as e:
        raise ConversionError(
            "Failed to decode input file (expected UTF-8 encoding)",
            details=str(e)
        )

    in_code = False
    code_buf: list[str] = []
    in_table = False
    table_buf: list[str] = []

    i = 0
    while i < len(lines):
        line = lines[i].rstrip("\n")

        # Handle code blocks
        fence = re.match(r"^```", line)
        if fence:
            if in_table and table_buf:
                table_data = parse_gfm_table(table_buf)
                if table_data:
                    add_table(doc, table_data["rows"], conf, table_data["alignments"])
                table_buf = []
                in_table = False

            if in_code:
                add_code_block(doc, code_buf, conf)
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # Check for table start
        if not in_table and is_table_line(line) and i + 1 < len(lines) and is_table_separator(lines[i + 1]):
            in_table = True
            table_buf = [line]
            i += 1
            continue

        # Continue collecting table lines
        if in_table:
            if is_table_line(line) or is_table_separator(line):
                table_buf.append(line)
                i += 1
                continue
            else:
                table_data = parse_gfm_table(table_buf)
                if table_data:
                    add_table(doc, table_data["rows"], conf, table_data["alignments"])
                table_buf = []
                in_table = False

        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            level = len(m.group(1))
            text = m.group(2)
            add_heading(doc, text, level, conf)
            i += 1
            continue
        if re.match(r"^\s*>\s+(.*)$", line):
            text = re.sub(r"^\s*>\s+", "", line)
            add_quote(doc, text, conf)
            i += 1
            continue
        if re.match(r"^\s*([-*_])\s*\1\s*\1\s*$", line.strip()):
            add_horizontal_rule(doc, conf)
            i += 1
            continue
        ul_match = re.match(r"^(\s*)[-*+]\s+(.*)$", line)
        if ul_match:
            indent = ul_match.group(1)
            text = ul_match.group(2)
            indent_len = len(indent.replace('\t', '  '))
            level = indent_len // 2
            add_list_item(doc, text, ordered=False, conf=conf, level=level)
            i += 1
            continue
        ol_match = re.match(r"^(\s*)\d+\.\s+(.*)$", line)
        if ol_match:
            indent = ol_match.group(1)
            text = ol_match.group(2)
            indent_len = len(indent.replace('\t', '  '))
            level = indent_len // 2
            add_list_item(doc, text, ordered=True, conf=conf, level=level)
            i += 1
            continue
        if line.strip() == "":
            i += 1
            continue
        add_body(doc, line, conf)
        i += 1

    # Flush any remaining buffers
    if in_code and code_buf:
        add_code_block(doc, code_buf, conf)
    if in_table and table_buf:
        table_data = parse_gfm_table(table_buf)
        if table_data:
            add_table(doc, table_data["rows"], conf, table_data["alignments"])

    try:
        doc.save(output_path)
    except Exception as e:
        if _is_output_permission_error(e):
            raise PermissionError_(
                "Cannot write output file",
                path=output_path,
                details="The target file may be open in Word/WPS or locked by another application."
            )

        raise DocxGenerationError(
            "Failed to save Word document",
            details=str(e)
        )

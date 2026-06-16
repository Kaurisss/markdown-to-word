"""Markdown-to-Word converter — CLI entry point and public re-exports.

All implementation lives in focused modules:
  errors.py    – exception classes and exit codes
  config.py    – configuration validation and loading
  styling.py   – OoXML paragraph/run formatting helpers
  parser.py    – inline formatting parser and GFM table parsing
  elements.py  – document element builders (heading, body, quote, list, …)
  converter.py – main Markdown → DOCX conversion loop
"""

import argparse
import os
import sys

# Ensure both the backend/ directory and its parent are on sys.path so that
# relative imports within sub-modules always resolve, regardless of whether
# this file is run as a script (``python backend/backend.py``) or imported
# as part of the ``backend`` package.
_HERE = os.path.dirname(os.path.abspath(__file__))
_PARENT = os.path.dirname(_HERE)
for _p in (_HERE, _PARENT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

# When executed as a script (__name__ == "__main__"), relative imports
# (from .errors import …) are not available.  Force the package context
# so sub-modules with relative imports load correctly.
if __package__ is None:
    __package__ = "backend"

try:
    from .errors import (  # type: ignore[import-not-found]
        EXIT_FILE_NOT_FOUND, EXIT_PERMISSION_ERROR, EXIT_CONFIG_ERROR,
        EXIT_MARKDOWN_PARSE_ERROR, EXIT_DOCX_GENERATION_ERROR,
        ConversionError, FileError, PermissionError_, ConfigError, DocxGenerationError,
    )
    from .config import validate_config, load_config, REQUIRED_STYLE_KEYS
    from .styling import (
        hex_to_rgb, apply_paragraph_fmt, apply_run_fmt,
        _set_paragraph_shading, _set_run_shading, _get_alignment, _ensure_east_asia_font,
    )
    from .parser import parse_inline_formatting, parse_gfm_table, is_table_line, is_table_separator
    from .elements import (
        add_heading, add_body, add_quote, add_list_item, add_code_block,
        add_horizontal_rule, add_table, add_hyperlink, add_formatted_runs,
        set_page_margins, add_table_of_contents,
    )
    from .converter import convert
except (ImportError, AttributeError):
    # PyInstaller or other bundled execution — use absolute package imports.
    from backend.errors import (  # type: ignore[no-redef]
        EXIT_FILE_NOT_FOUND, EXIT_PERMISSION_ERROR, EXIT_CONFIG_ERROR,
        EXIT_MARKDOWN_PARSE_ERROR, EXIT_DOCX_GENERATION_ERROR,
        ConversionError, FileError, PermissionError_, ConfigError, DocxGenerationError,
    )
    from backend.config import validate_config, load_config, REQUIRED_STYLE_KEYS
    from backend.styling import (
        hex_to_rgb, apply_paragraph_fmt, apply_run_fmt,
        _set_paragraph_shading, _set_run_shading, _get_alignment, _ensure_east_asia_font,
    )
    from backend.parser import parse_inline_formatting, parse_gfm_table, is_table_line, is_table_separator
    from backend.elements import (
        add_heading, add_body, add_quote, add_list_item, add_code_block,
        add_horizontal_rule, add_table, add_hyperlink, add_formatted_runs,
        set_page_margins, add_table_of_contents,
    )
    from backend.converter import convert


def main():
    """Main entry point with comprehensive error handling."""
    parser = argparse.ArgumentParser(description="Markdown to Word (.docx) converter with style config")
    parser.add_argument("--input", "-i", required=True, help="输入的 Markdown 文件路径")
    parser.add_argument("--output", "-o", required=True, help="输出的 .docx 文件路径")
    parser.add_argument("--config", "-c", help="JSON 字符串形式的样式配置")
    parser.add_argument("--config-file", "-f", help="JSON 配置文件路径")
    args = parser.parse_args()

    try:
        conf = load_config(args)
        convert(args.input, args.output, conf)
    except PermissionError_ as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(e.exit_code)
    except FileError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(e.exit_code if hasattr(e, 'exit_code') else EXIT_FILE_NOT_FOUND)
    except ConfigError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(e.exit_code if hasattr(e, 'exit_code') else EXIT_CONFIG_ERROR)
    except ConversionError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(e.exit_code if hasattr(e, 'exit_code') else EXIT_MARKDOWN_PARSE_ERROR)
    except DocxGenerationError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(e.exit_code if hasattr(e, 'exit_code') else EXIT_DOCX_GENERATION_ERROR)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

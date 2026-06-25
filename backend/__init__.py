"""Re-export public API so that ``from backend import X`` works.

Import directly from sub-modules (not from backend.py) to avoid circular
imports when backend.py is executed as a script.
"""

from .errors import (  # noqa: F401
    EXIT_FILE_NOT_FOUND, EXIT_PERMISSION_ERROR, EXIT_CONFIG_ERROR,
    EXIT_MARKDOWN_PARSE_ERROR, EXIT_DOCX_GENERATION_ERROR,
    ConversionError, FileError, PermissionError_, ConfigError, DocxGenerationError,
)
from .config import validate_config, load_config, REQUIRED_STYLE_KEYS  # noqa: F401
from .parser import (  # noqa: F401
    parse_inline_formatting, parse_gfm_table, is_table_line, is_table_separator,
)
from .elements import (  # noqa: F401
    add_heading, add_body, add_quote, add_list_item, add_code_block, add_caption,
    add_horizontal_rule, add_table, add_hyperlink, add_formatted_runs,
    set_page_margins, add_table_of_contents,
)
from .converter import convert  # noqa: F401
from .converters.table import (  # noqa: F401
    flush_table_buffer, process_table_buffer,
)
from .converters.toc import add_toc, should_add_toc  # noqa: F401
from .converters.styles import (  # noqa: F401
    hex_to_rgb, apply_paragraph_fmt, apply_run_fmt,
    _set_paragraph_shading, _set_run_shading, _get_alignment,
    _ensure_east_asia_font,
)
from .converters.code_block import (  # noqa: F401
    flush_code_buffer, process_code_buffer,
)

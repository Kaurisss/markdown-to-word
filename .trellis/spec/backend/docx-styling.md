# DOCX Styling

## Paragraph And Run Formatting

OOXML formatting helpers live in `backend/styling.py` and are re-exported through `backend/backend.py` for compatibility.

Use these helpers rather than duplicating low-level XML setup:

- `apply_paragraph_fmt`
- `apply_run_fmt`
- `_ensure_east_asia_font`
- `_set_paragraph_shading`
- `_set_run_shading`
- `_get_alignment`

`apply_run_fmt` sets both western font names and East Asian font names. When applying code fonts, preserve the code-specific `fontFamily` and East Asian fallback behavior used in `backend/elements.py`.

## Document Elements

`backend/elements.py` owns the high-level builders:

- `add_heading`
- `add_body`
- `add_quote`
- `add_list_item`
- `add_code_block`
- `add_horizontal_rule`
- `add_caption`
- `add_formatted_runs`

Do not style paragraphs manually in `converter.py`; call an element builder or a focused converter.

## Tables

`backend/converters/table.py` owns table detection, parsing, cell borders, header shading, vertical alignment, cell text formatting, and alignment markers.

Rules:

- Parse GFM tables through `parse_gfm_table`, which delegates to `markdown-it-py`.
- Preserve inline Markdown inside table cells so formatted runs work.
- Use `styles.table` when present, falling back to `styles.body`.
- Respect `global.tableHeaderBold`; default behavior is controlled by config.

Tests:
- `backend/tests/test_table_converter.py`
- `backend/tests/test_table_property.py`
- `backend/tests/test_document_layout.py`

## Table Of Contents

`backend/converters/toc.py` injects a Word TOC field and styles `TOC 1`, `TOC 2`, etc. It also adds a new section when `bodyStart.restartPageNumberAfterToc` is enabled.

TOC failures are warnings and should not abort conversion; `add_toc` prints to stderr and continues.

When changing TOC fields or section behavior, update `backend/tests/test_toc_converter.py` and `backend/tests/test_document_layout.py`.

## Page Layout, Header, Footer

`backend/document_layout.py` applies page size, margins, header/footer distance, field-based page numbers, page-number restart, and `updateFields` after content is added.

Keep length units compatible:

- Plain numeric values are treated as inches for existing config.
- Dict values may specify centimetres with `unit: "cm"`.
- Front-end default page size uses centimetres, but `AdvancedPageSettingsDialog` normalizes edited custom sizes to inches.

Tests in `backend/tests/test_document_layout.py` check A4 size, margins, header/footer distance, title style, font mapping, TOC styles, table styles, and caption styles.

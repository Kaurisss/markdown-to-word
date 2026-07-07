# Backend Guidelines

Python Markdown-to-DOCX conversion engine. Read this layer before changing `backend/**` or backend tests.

## Pre-Development Checklist

- Read [Conversion Flow](./conversion-flow.md) before changing Markdown parsing, block detection, converter order, or document assembly.
- Read [Config And Errors](./config-and-errors.md) before changing CLI args, config validation, exit codes, or user-facing backend failures.
- Read [DOCX Styling](./docx-styling.md) before changing fonts, paragraph/run formatting, table rendering, TOC, header/footer, page size, or OOXML helpers.
- Read [Testing](./testing.md) before adding backend tests or changing behavior covered by pytest/hypothesis.
- For config fields shared with the front-end, also read `.trellis/spec/cross-layer/document-config-contract.md`.

## Quality Check

- Run `python -m pytest backend/tests` after backend changes.
- Use focused tests first when changing a converter, for example `python -m pytest backend/tests/test_table_converter.py`.
- Preserve public imports from `backend/backend.py`; tests and CLI harness import conversion helpers through this package boundary.
- Keep the backend dependency set small and reflected in `backend/requirements.txt` and `agent-harness/setup.py` when shared.

## Local Architecture Summary

- `backend/backend.py` is the CLI entry point and compatibility re-export module.
- `backend/converter.py` owns the main line-by-line Markdown conversion loop.
- `backend/parser.py` owns inline formatting and re-exports GFM table parsing.
- `backend/elements.py` owns document element builders for headings, body, quotes, lists, captions, links, and code.
- `backend/converters/` owns focused block converters: table, TOC, code block, and style helpers.
- `backend/document_layout.py` applies page size, margins, headers, footers, page fields, and field-update settings after content conversion.

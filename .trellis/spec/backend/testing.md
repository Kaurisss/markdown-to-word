# Backend Testing

## Test Frameworks

Backend tests use pytest and hypothesis. Run all backend tests with:

```powershell
python -m pytest backend/tests
```

Use focused commands while developing:

```powershell
python -m pytest backend/tests/test_table_converter.py
python -m pytest backend/tests/test_inline_formatting_property.py
python -m pytest backend/tests/test_document_layout.py
```

## Test Styles

- Converter state machines should have direct unit tests for each transition. See `backend/tests/test_table_converter.py`.
- Properties are used for broad input coverage. See `backend/tests/test_inline_formatting_property.py`, `test_error_handling_property.py`, and `test_table_property.py`.
- DOCX output behavior should be verified by opening the generated file with `python-docx` and checking paragraphs, runs, styles, sections, tables, or raw XML fields.
- File-system error behavior should be tested without depending on Word being installed. See `backend/tests/test_output_file_lock.py`.

## Config Fixtures

Several backend tests define a course-design-like config inline. If changing `DocumentConfig`, update those fixtures and the front-end default config together.

Avoid adding a separate backend-only default that drifts from the front-end or CLI harness defaults. If a default is needed for tests, use `backend.config.load_config` with empty args or copy the real default shape intentionally.

## Regression Tests

When fixing converter order or buffering bugs, add tests that inspect document order, not only table/paragraph counts. `TestTableBeforeCodeFence` checks the order of `w:tbl` and code paragraphs in the document body; use that pattern for order-sensitive regressions.

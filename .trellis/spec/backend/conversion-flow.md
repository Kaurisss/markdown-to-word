# Conversion Flow

## Main Loop Model

`backend/converter.py` does not walk a full Markdown AST. It reads UTF-8 Markdown into lines and processes them in order. Keep this order in mind when adding block behavior:

1. Flush an active table before a code fence so a table immediately followed by code keeps document order.
2. Process code-fence buffering with `backend/converters/code_block.py`.
3. Process table buffering with `backend/converters/table.py`.
4. Match headings, captions, quotes, horizontal rules, unordered lists, ordered lists, blank lines, then body text.
5. Flush any remaining code or table buffer.
6. Apply document layout and save the DOCX.

Reference files:
- `backend/converter.py`
- `backend/converters/code_block.py`
- `backend/converters/table.py`
- `backend/tests/test_table_converter.py`

## Adding A Block Type

Add a new block type only if it can be placed safely in the line-scanning order. Decide whether it needs buffering like code/table or immediate emission like headings/lists.

When adding buffering:

- Keep state-machine logic in `backend/converters/<feature>.py`.
- Return `(consumed, updated_buffer, updated_state)` like `process_code_buffer` and `process_table_buffer`.
- Add direct unit tests for start, accumulation, flush, EOF flush, and fallthrough behavior.

Avoid embedding large new state machines directly in `converter.py`.

## Inline Formatting

Inline formatting is parsed by `backend/parser.py` using `markdown-it-py` and converted to the legacy segment dict shape used by `elements.py` and table rendering.

Supported segments include bold, italic, inline code, underline via `<u>`, strikethrough, and links. `backend/tests/test_inline_formatting_property.py` covers both parser output and DOCX run formatting.

If adding inline syntax:

- Extend `parse_inline_formatting`.
- Update `add_formatted_runs` in `backend/elements.py`.
- Check the table-local formatted-runs copy in `backend/converters/table.py`.
- Add parser and DOCX output tests.

## Captions And Formal Chinese Output

`converter.py` auto-numbers lines beginning with `图`, `表`, or `公式` when they do not already include a number. The caption builder uses `styles.caption` when present.

`backend/text_normalization.py` converts half-width punctuation to full-width punctuation only when CJK text is present and skips URL-like spans. This is applied to normal runs, not code runs.

Do not normalize code or URLs.

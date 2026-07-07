# CLI Harness Testing

## Commands

Run all CLI harness tests with:

```powershell
python -m pytest agent-harness\cli_anything\markdown_to_word\tests
```

To force tests to use an installed console script instead of falling back to `python -m`, set:

```powershell
$env:CLI_ANYTHING_FORCE_INSTALLED='1'
python -m pytest agent-harness\cli_anything\markdown_to_word\tests -v -s
```

## Test Coverage Pattern

`test_core.py` covers pure and session-level behavior:

- project shape
- UTF-8 Markdown loading
- Markdown stats
- config validation and dotted-path mutation
- Session save/load
- undo/redo
- DOCX inspection failure cases
- repo root resolution

`test_full_e2e.py` covers real export and subprocess CLI workflows:

- `export_docx` creates a valid DOCX ZIP with `[Content_Types].xml` and `word/document.xml`.
- CLI help works.
- project -> content load -> export docx JSON workflow works.
- `--dry-run` does not persist content changes.

## Adding Tests

- For new pure helpers, add direct unit tests in `test_core.py` or a focused new file.
- For command behavior, prefer subprocess tests only when the Click boundary matters; they are slower and exercise installed/fallback command resolution.
- For export behavior, verify the output is a real DOCX package instead of only checking the command return code.

## Temporary Files

Use pytest `tmp_path` for project JSON, Markdown inputs, and DOCX outputs. Do not write test artifacts into the repository root or committed sample directories.

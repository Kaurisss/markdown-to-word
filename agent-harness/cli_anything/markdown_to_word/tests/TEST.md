# CLI-Anything Markdown-to-Word Test Plan

## Test Inventory Plan

- `test_core.py`: 14 unit tests planned.
- `test_full_e2e.py`: 7 E2E and subprocess tests planned.

## Unit Test Plan

### `core.project`

- Create default project with version, name, empty content, default config, no export.
- Load Markdown content from UTF-8 file.
- Set Markdown content directly.
- Compute content stats for characters, lines, words, headings, tables, code fences.
- Load config from JSON file and validate it with the existing backend validator.
- Update nested config values using dotted paths.
- Reject invalid config sections.

### `core.session`

- Save and load project JSON.
- Track modified state.
- Maintain undo and redo stacks.
- Preserve JSON writes with the locked-save helper.
- Auto-save one-shot mutations through CLI integration.
- Suppress persistence with `--dry-run`.

### `core.preview`

- Inspect Markdown stats.
- Inspect valid DOCX ZIP/OOXML structure.
- Report invalid DOCX structure.

## E2E Test Plan

### Workflow: create and export report

Simulates an agent creating a Markdown report, saving it to a project, and exporting a DOCX file.

Operations:

1. Create project.
2. Load Markdown.
3. Export DOCX.
4. Inspect DOCX.

Verified:

- DOCX file exists.
- DOCX file size is greater than 1000 bytes.
- ZIP contains `[Content_Types].xml` and `word/document.xml`.

### Workflow: subprocess JSON mode

Simulates an installed command used by another agent.

Operations:

1. Invoke `cli-anything-markdown-to-word --help`.
2. Invoke project creation with `--json`.
3. Invoke content loading with `--json`.
4. Invoke DOCX export with `--json`.

Verified:

- JSON output parses.
- `ok` is true for successful commands.
- Installed command resolution works with `CLI_ANYTHING_FORCE_INSTALLED=1`.

## Test Results

```text
============================= test session starts =============================
platform win32 -- Python 3.11.0, pytest-9.1.0, pluggy-1.6.0 -- C:\Users\Logic\AppData\Local\Programs\Python\Python311\python.exe
cachedir: .pytest_cache
hypothesis profile 'default'
rootdir: C:\Users\Logic\Desktop\markdown-to-word\agent-harness
plugins: anyio-4.13.0, hypothesis-6.155.3
collecting ... [_resolve_cli] Using installed command: C:\Users\Logic\AppData\Local\Programs\Python\Python311\Scripts\cli-anything-markdown-to-word.EXE
collected 16 items

agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_create_project_has_default_shape PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_load_markdown_file_reads_utf8 PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_markdown_stats_counts_document_features PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_load_config_file_validates_backend_shape PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_set_config_value_updates_nested_path PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_set_config_value_rejects_unknown_root PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_session_save_and_load_round_trip PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_session_undo_and_redo_content_change PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_session_dry_run_does_not_write PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_inspect_markdown_returns_stats PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_inspect_docx_reports_invalid_file PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_core.py::test_resolve_repo_root_finds_backend PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_full_e2e.py::test_export_docx_uses_real_backend
  DOCX: C:\Users\Logic\AppData\Local\Temp\pytest-of-Logic\pytest-11\test_export_docx_uses_real_bac0\report.docx (39,192 bytes)
PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_full_e2e.py::TestCLISubprocess::test_help PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_full_e2e.py::TestCLISubprocess::test_project_content_export_json_workflow PASSED
agent-harness\cli_anything\markdown_to_word\tests\test_full_e2e.py::TestCLISubprocess::test_dry_run_does_not_persist_content PASSED

============================= 16 passed in 2.51s ==============================
```

## Coverage Notes

- Unit tests cover project, config, session, undo/redo, and inspection helpers.
- E2E tests cover real DOCX export through the existing backend.
- Subprocess tests cover the installed `cli-anything-markdown-to-word` command.
- Visual screenshot previews are not covered because this harness intentionally exposes structural inspection only.

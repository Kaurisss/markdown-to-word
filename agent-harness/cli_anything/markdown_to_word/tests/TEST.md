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

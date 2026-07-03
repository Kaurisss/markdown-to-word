# CLI-Anything Markdown-to-Word Harness Design

## Goal

Build a CLI-Anything harness for the current `markdown-to-word` project so agents can operate the document conversion engine from the command line without opening the Tauri UI.

The harness must expose a real command-line interface to the existing Python Markdown-to-DOCX backend. It must not reimplement the converter or fake export behavior.

## Scope

The first version focuses on Markdown authoring state, style configuration, DOCX export, and inspectable output. It does not automate the React/Tauri UI, AI style generation, or visual preview pane.

Supported surfaces:

- Create and manage a file-backed CLI project session.
- Load, set, show, and inspect Markdown content.
- Load, show, modify, validate, and save style configuration.
- Export a real `.docx` by calling the existing Python conversion engine.
- Inspect generated DOCX files through structural OOXML checks.
- Provide one-shot commands, default REPL mode, JSON output, undo/redo, auto-save, and `--dry-run`.
- Ship CLI-Anything documentation, tests, local installation metadata, and a CLI-specific `SKILL.md`.

Out of scope for this version:

- Driving the Tauri desktop window.
- Recreating the React preview renderer.
- Calling AI model APIs or editing AI provider settings.
- Rendering screenshot-like previews. The first version only provides truthful file/content inspection.
- Publishing to PyPI.

## Architecture

Add a standard CLI-Anything harness under `agent-harness/`.

```text
agent-harness/
├── MARKDOWN_TO_WORD.md
├── setup.py
└── cli_anything/
    └── markdown_to_word/
        ├── README.md
        ├── __init__.py
        ├── __main__.py
        ├── markdown_to_word_cli.py
        ├── core/
        ├── utils/
        ├── skills/
        └── tests/
```

The top-level `cli_anything/` directory remains a PEP 420 namespace package and must not contain `__init__.py`.

The package installs a console command:

```text
cli-anything-markdown-to-word
```

The canonical skill file lives at:

```text
skills/cli-anything-markdown-to-word/SKILL.md
```

A packaged compatibility copy lives at:

```text
agent-harness/cli_anything/markdown_to_word/skills/SKILL.md
```

## Backend Integration

The harness uses the repository's existing Python backend as the hard dependency:

- `backend.config.validate_config`
- `backend.config.load_config` where useful
- `backend.converter.convert`
- `backend.backend.main` behavior as the CLI compatibility reference

`utils/markdown_to_word_backend.py` resolves the repository root and imports the existing `backend` package. Export commands write the current session content and configuration to temporary files, then call `convert(input_path, output_path, config)`.

The backend wrapper returns structured results with:

- output path
- file size
- backend method
- timing
- error category and details on failure

The wrapper must preserve the backend's existing locked-output-file behavior and surface clear messages when a `.docx` cannot be written because Word/WPS or another process is using it.

## Data Model

The CLI project is a JSON file managed by `core/project.py`.

```json
{
  "version": 1,
  "name": "example",
  "content": "# Title\n\nBody",
  "config": {
    "global": {},
    "styles": {}
  },
  "last_export": {
    "output": "C:/path/out.docx",
    "file_size": 12345,
    "created_at": "2026-07-03T00:00:00Z"
  },
  "history": []
}
```

`core/session.py` owns current project state, dirty tracking, undo/redo snapshots, file-backed persistence, and locked JSON writes. It follows the CLI-Anything `_locked_save_json` pattern: open with `r+`, acquire an exclusive lock when available, then truncate inside the lock.

One-shot mutations auto-save unless `--dry-run` is present. REPL mode accepts `--dry-run`, but explicit save commands control persistence.

## Command Design

The CLI uses Click and defaults to REPL mode when invoked without a subcommand.

Global options:

- `--project PATH` loads a project session.
- `--json` emits machine-readable output.
- `--dry-run` runs one-shot mutations without saving.

Command groups:

```text
project new
project status
project save
project history
project undo
project redo

content load
content set
content show
content stats

config default
config load
config show
config set
config validate
config save

export docx

preview inspect
```

`preview inspect` is intentionally structural. It reports Markdown statistics, project state, and DOCX facts such as whether the output is a ZIP/OOXML document and whether required members like `[Content_Types].xml` and `word/document.xml` exist.

## REPL

The REPL uses the CLI-Anything shared `ReplSkin` copied into:

```text
agent-harness/cli_anything/markdown_to_word/utils/repl_skin.py
```

The REPL supports the same command vocabulary as one-shot mode, plus help, status, save, and exit. It displays the CLI skill path in the banner so agents can discover full usage instructions.

## Error Handling

All commands fail loudly and clearly.

Human output should be concise and actionable. JSON output should include:

```json
{
  "ok": false,
  "error": "Cannot write output file",
  "details": "The target file may be open in Word/WPS or locked by another application."
}
```

The harness must distinguish these cases:

- Missing project file.
- Invalid project JSON.
- Invalid configuration JSON.
- Missing Markdown input file.
- Empty content export attempt.
- Backend conversion failure.
- Locked or unwritable output file.

## Testing

Write `agent-harness/cli_anything/markdown_to_word/tests/TEST.md` before implementation tests.

Required tests:

- Unit tests for project creation, content updates, config validation, session save/load, undo/redo, and locked JSON save behavior.
- E2E tests that export a real `.docx` using the existing backend and verify the file is a valid ZIP/OOXML document.
- Subprocess tests using `_resolve_cli("cli-anything-markdown-to-word")`.
- JSON output tests for key one-shot commands.
- `--dry-run` tests proving one-shot mutation output does not persist.

Validation commands:

```powershell
python -m pytest backend/tests
python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
python -m pip install -e agent-harness
cli-anything-markdown-to-word --help
$env:CLI_ANYTHING_FORCE_INSTALLED='1'; python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
```

The final `TEST.md` must append the passing pytest output and summarize any remaining coverage gaps.

## Documentation

Create these documents:

- `agent-harness/MARKDOWN_TO_WORD.md`: project-specific analysis and CLI SOP.
- `agent-harness/cli_anything/markdown_to_word/README.md`: install, usage, command examples, backend dependency notes, and test instructions.
- `agent-harness/cli_anything/markdown_to_word/tests/TEST.md`: test plan and results.
- `skills/cli-anything-markdown-to-word/SKILL.md`: self-contained agent skill.
- `agent-harness/cli_anything/markdown_to_word/skills/SKILL.md`: packaged copy.

The skill must document JSON-first usage for agents and include at least one full workflow:

```powershell
cli-anything-markdown-to-word --project .tmp/report.json project new --name Report
cli-anything-markdown-to-word --project .tmp/report.json content load .tmp/report.md
cli-anything-markdown-to-word --project .tmp/report.json export docx .tmp/report.docx --json
cli-anything-markdown-to-word preview inspect .tmp/report.docx --json
```

## Success Criteria

- `cli-anything-markdown-to-word` installs locally and is available on PATH.
- Running the command with no arguments enters REPL mode.
- One-shot project/content/config/export commands work in human and JSON mode.
- `export docx` produces a real `.docx` through the existing backend.
- DOCX output is programmatically verified in E2E tests.
- One-shot mutations auto-save and `--dry-run` suppresses saving.
- Undo/redo works for project mutations.
- README, TEST.md, setup.py, and both skill files exist.
- Force-installed subprocess tests pass with `CLI_ANYTHING_FORCE_INSTALLED=1`.

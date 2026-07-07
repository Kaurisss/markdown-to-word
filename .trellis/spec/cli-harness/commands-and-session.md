# Commands And Session

## CLI Entry Point

The console script is declared in `agent-harness/setup.py`:

```text
cli-anything-markdown-to-word=cli_anything.markdown_to_word.markdown_to_word_cli:main
```

`markdown_to_word_cli.py` uses Click groups:

- `project`: create, status, save, history, undo, redo.
- `content`: load, set, show, stats.
- `config`: default, load, show, set, validate, save.
- `export`: docx.
- `preview`: inspect.
- no subcommand: REPL.

Keep command handlers thin. They should parse CLI inputs, call `Session` or core helpers, then emit output through `utils/output.py`.

## JSON Mode

The top-level `--json` flag changes command output to machine-readable JSON. New commands must return structured dictionaries through `emit`, not ad hoc prints.

The REPL is interactive and uses `ReplSkin`; one-shot commands should remain script-friendly.

## Project File Shape

`core/project.py` creates version-1 project files with:

- `version`
- `name`
- `content`
- `config`
- `last_export`
- `history`

`core/session.py` validates version and required fields when loading. If adding fields, keep old version-1 files loadable unless intentionally introducing a migration.

## Session Rules

`Session` owns:

- current project data
- project path
- modified flag
- undo stack
- redo stack
- save/load behavior

Mutating operations should call `snapshot()` before changing project data and `mark_modified()` after. Dry-run behavior relies on the top-level result callback skipping auto-save when `--dry-run` is present.

## Export Must Reuse The Real Backend

`utils/markdown_to_word_backend.py` writes Markdown to a temp file and calls `backend.converter.convert(content, output, config)`. This harness must not reimplement Markdown-to-DOCX conversion.

If backend config requirements change, update:

- `core/project.py` default config.
- backend config validation.
- CLI tests that create projects and export DOCX.

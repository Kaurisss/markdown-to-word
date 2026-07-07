# CLI Harness Guidelines

Command-line harness for automated use of the Markdown-to-Word conversion engine. Read this layer before changing `agent-harness/**`.

## Pre-Development Checklist

- Read [Commands And Session](./commands-and-session.md) before changing Click commands, project JSON, undo/redo, REPL, or export behavior.
- Read [Testing](./testing.md) before changing CLI tests or subprocess workflows.
- For backend conversion assumptions, also read `.trellis/spec/backend/index.md`.

## Quality Check

- Run `python -m pytest agent-harness\cli_anything\markdown_to_word\tests`.
- Preserve the rule that DOCX export calls the repository's real `backend.converter.convert`.
- Keep package dependencies in `agent-harness/setup.py` aligned with backend dependencies used by the harness.

## Local Architecture Summary

- `agent-harness/cli_anything/markdown_to_word/markdown_to_word_cli.py` defines Click command groups and REPL.
- `core/project.py` defines project JSON shape, default config, stats, config loading, and dotted-path config mutation.
- `core/session.py` owns project loading/saving, modified state, undo/redo, and export metadata.
- `core/preview.py` inspects Markdown stats or DOCX ZIP structure.
- `utils/markdown_to_word_backend.py` resolves the repo root and calls the real backend converter.

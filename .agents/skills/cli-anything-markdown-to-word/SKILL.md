---
name: "cli-anything-markdown-to-word"
description: "Operate the markdown-to-word conversion engine from the command line: manage Markdown projects, style config, DOCX export, JSON output, and REPL sessions."
---

# CLI-Anything Markdown-to-Word

Use this skill when you need to create, inspect, configure, or export Markdown-to-Word documents from the command line.

## Install

```powershell
python -m pip install -e agent-harness
```

## Command

```powershell
cli-anything-markdown-to-word [--json] [--project PATH] [--dry-run] COMMAND
```

Run without a command to enter REPL mode.

## Agent Rules

- Prefer `--json` for machine-readable output.
- Use `--project PATH` for stateful workflows.
- Use `--dry-run` before risky one-shot mutations when you need to inspect the result without saving.
- `export docx` uses the real repository backend and writes a real DOCX file.
- `preview inspect` validates Markdown or DOCX structure; it does not create screenshot previews.

## Common Workflow

```powershell
cli-anything-markdown-to-word --json --project .tmp/report.json project new --name Report
cli-anything-markdown-to-word --json --project .tmp/report.json content load .tmp/report.md
cli-anything-markdown-to-word --json --project .tmp/report.json config set styles.body.fontSize 12
cli-anything-markdown-to-word --json --project .tmp/report.json export docx .tmp/report.docx
cli-anything-markdown-to-word --json preview inspect .tmp/report.docx
```

## Command Groups

- `project`: `new`, `status`, `save`, `history`, `undo`, `redo`
- `content`: `load`, `set`, `show`, `stats`
- `config`: `default`, `load`, `show`, `set`, `validate`, `save`
- `export`: `docx`
- `preview`: `inspect`

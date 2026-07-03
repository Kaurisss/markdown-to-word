# cli-anything-markdown-to-word

Command-line harness for the `markdown-to-word` conversion engine.

## Install

```powershell
python -m pip install -e agent-harness
```

## Basic Workflow

```powershell
cli-anything-markdown-to-word --project .tmp/report.json project new --name Report
cli-anything-markdown-to-word --project .tmp/report.json content load .tmp/report.md
cli-anything-markdown-to-word --project .tmp/report.json export docx .tmp/report.docx --json
cli-anything-markdown-to-word preview inspect .tmp/report.docx --json
```

## JSON Mode

Pass `--json` before the command group to receive machine-readable output.

## REPL

Run with no subcommand:

```powershell
cli-anything-markdown-to-word
```

## Tests

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
$env:CLI_ANYTHING_FORCE_INSTALLED='1'; python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
```

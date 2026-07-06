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

## Command Groups

### project

- `project new --name NAME`
- `project status`
- `project save [PATH]`
- `project history`
- `project undo`
- `project redo`

### content

- `content load PATH`
- `content set TEXT`
- `content show`
- `content stats`

### config

- `config default`
- `config load PATH`
- `config show`
- `config set PATH VALUE`
- `config validate`
- `config save PATH`

### export

- `export docx OUTPUT`

### preview

- `preview inspect [PATH]`

## Backend Notes

DOCX export calls `backend.converter.convert`. If export fails because a target `.docx` is open in Word/WPS or locked by another process, close the target file or choose another output path.

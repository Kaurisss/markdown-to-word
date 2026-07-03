# Markdown-to-Word CLI-Anything Harness

## Backend

This harness uses the repository's real Python backend:

- `backend.config.validate_config`
- `backend.converter.convert`
- `backend.errors`

The harness writes Markdown content and style configuration to a project JSON file, then calls `convert(input_path, output_path, config)` to produce a real DOCX file.

## Native Format

The CLI project format is JSON. The rendered output format is DOCX, verified as a ZIP/OOXML package.

## Hard Dependency

The harness must run from this repository or from an environment where the repository root can be resolved. It does not reimplement Markdown-to-DOCX conversion.

## Commands

- `project`: create, save, inspect, history, undo, redo
- `content`: load, set, show, stats
- `config`: default, load, show, set, validate, save
- `export`: render DOCX through the real backend
- `preview`: inspect Markdown or DOCX structure

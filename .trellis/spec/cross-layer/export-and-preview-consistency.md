# Export And Preview Consistency

The preview should approximate Word output closely enough for users to trust it. It does not need to be a perfect DOCX renderer, but supported Markdown and style controls should not drift without an explicit reason.

## Scenario: Adding Or Changing Exported Markdown Behavior

### 1. Scope / Trigger

This applies when changing Markdown syntax support, preview rendering, DOCX rendering, export temp-file handling, or user-visible export errors.

### 2. Signatures

- Preview renderer: `Preview({ markdown, cfg })` in `src/components/preview/Preview.tsx`
- Export hook: `useExport({ content, cfg, showToast })` in `src/features/export/useExport.ts`
- Sidecar call: `exportWithPython(options: ExportOptions)` in `src/features/export/pythonBackend.ts`
- Backend CLI: `backend/backend.py --input --output --config-file`
- Backend converter: `convert(input_path, output_path, conf)` in `backend/converter.py`

### 3. Contracts

- `ExportOptions.markdown`: non-empty Markdown string
- `ExportOptions.outputPath`: user-selected `.docx` path
- `ExportOptions.config`: serialized `DocumentConfig`
- Backend stdout/stderr and exit code are interpreted by `pythonBackend.ts`
- Temporary Markdown and config files live in Tauri `BaseDirectory.AppCache` and are removed in `finally`

### 4. Validation & Error Matrix

- Empty Markdown -> front-end returns `success: false` with `内容为空`
- Missing output path -> front-end returns `success: false` with `输出路径无效`
- Backend exit code 1 -> file-not-found message
- Backend exit code 2 + locked-file markers -> `无法写入目标文件`
- Backend exit code 3 -> config error message
- Backend exit code 4 -> Markdown parse failure message
- Backend exit code 5 -> DOCX generation failure message
- Invalid UTF-8 error from shell plugin -> neutral export failure with likely file-lock hint

### 5. Good / Base / Bad Cases

- Good: Add support for a Markdown construct in both `Preview.tsx` and `backend/converter.py`, with DOM and DOCX tests.
- Base: Add preview-only safety handling for raw HTML and clearly keep backend behavior unchanged.
- Bad: Render a feature in preview that users reasonably expect to appear in exported Word, but leave the backend unchanged.

### 6. Tests Required

- Preview DOM behavior: `test/components/preview/Preview.test.tsx`
- Export error mapping: `test/features/export/pythonBackend.test.ts`
- Backend DOCX output: targeted tests under `backend/tests/`
- CLI harness real export when project defaults or backend conversion are affected: `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`

### 7. Wrong vs Correct

Wrong: Add a new `react-markdown` component override and assume export works.

Correct: trace preview, config, backend parser/converter, DOCX styling, and tests before calling the behavior supported.

## Shared Behaviors

Keep these front-end and backend behaviors aligned:

- Headings: first H1 can become document title when `bodyStart.firstHeadingAsTitle` is enabled.
- Body paragraphs: body style, first-line indent, line spacing, margins.
- Code: inline code and fenced code use code style and background.
- Quotes: quote style and left indent.
- Horizontal rules: `default`, `page_break`, and `hidden`.
- Tables: GFM tables, header background, cell borders, alignments, `tableHeaderBold`.
- Captions: lines starting with `图`, `表`, or `公式` auto-number in backend and are styled as captions in preview.
- Underline: front-end inline formatting produces `<u>`, preview allows `<u>`, backend parser converts `<u>` to underlined runs.

Reference files:
- `src/components/preview/Preview.tsx`
- `src/components/preview/sanitizeSchema.ts`
- `backend/converter.py`
- `backend/parser.py`
- `backend/elements.py`
- `backend/converters/table.py`

## When Adding Markdown Support

For a new Markdown construct:

1. Decide whether it is preview-only or export-supported.
2. If export-supported, add backend parsing/rendering and tests.
3. Add preview rendering and sanitize schema changes if raw HTML is involved.
4. Add tests for both preview DOM behavior and DOCX output.
5. Update user-facing controls only after the conversion path exists.

Do not add preview support that implies export support unless the backend can actually render it.

## Export Flow

`src/features/export/useExport.ts` chooses a default filename from the first H1, opens a Tauri save dialog, then calls `exportWithPython`.

`src/features/export/pythonBackend.ts`:

- writes Markdown to `BaseDirectory.AppCache`
- writes config JSON to `BaseDirectory.AppCache`
- executes sidecar `binaries/md2word`
- maps backend exit codes to user-facing errors
- removes temp files in `finally`

`backend/backend.py` accepts `--input`, `--output`, and `--config-file`, then calls `convert`.

Do not bypass this flow from UI components.

## Known Limitations

The backend line scanner supports a practical subset of Markdown. It does not currently model arbitrary nested block structures. When documenting or adding features, be clear whether the limitation is in preview, backend export, or both.

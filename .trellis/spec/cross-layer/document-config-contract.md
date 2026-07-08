# Document Config Contract

`DocumentConfig` is the most important shared contract in this repository. It appears in front-end TypeScript, persisted local storage, preview rendering, Python validation/rendering, backend tests, and CLI harness defaults.

## Scenario: Changing DocumentConfig

### 1. Scope / Trigger

This applies whenever a task adds, removes, renames, changes units for, or changes defaults for any field under `DocumentConfig`.

### 2. Signatures

- TypeScript contract: `DocumentConfig` in `src/types/config.ts`
- Front-end default object: `DEFAULT_CONFIG` in `src/config/defaultConfig.ts`
- Backend validation entry: `validate_config(conf: Dict[str, Any])` in `backend/config.py`
- Backend conversion entry: `convert(input_path: str, output_path: str, conf: Dict[str, Any])` in `backend/converter.py`
- CLI project default: `DEFAULT_CONFIG` in `agent-harness/cli_anything/markdown_to_word/core/project.py`

### 3. Contracts

- `global.pageMargin`: `number | { top: number; bottom: number; left: number; right: number }`
- `global.pageSize`: optional `{ width: number; height: number; unit?: "in" | "cm" }`
- `global.baseFontCn`: Chinese font family string
- `global.baseFontEn`: western font family string; empty values fall back to Chinese font in preview/backend behavior
- `global.horizontalRule`: `"default" | "page_break" | "hidden"`
- `global.includeTableOfContents`: boolean
- `global.header` / `global.footer`: optional header/footer config used by `document_layout.py`
- `global.tableOfContents`: optional TOC style and max-level config
- `global.bodyStart`: optional title/page-number restart behavior
- `styles`: style map for headings, body, code, quote, plus optional title/table/caption styles

### 4. Validation & Error Matrix

- Missing `global` or non-object `global` -> `ConfigError`
- Missing `styles` or non-object `styles` -> `ConfigError`
- Missing required style keys `h1`, `h2`, `h3`, `body`, `code`, `quote` -> `ConfigError`
- Required style value is not an object -> `ConfigError`
- Negative or non-numeric `pageMargin` value -> `ConfigError`
- Malformed front-end local-storage JSON -> fall back to `DEFAULT_CONFIG`, not an export-time crash

### 5. Good / Base / Bad Cases

- Good: Add `styles.caption.backgroundColor`, update TypeScript type/default, preview style mapping if visible, backend caption rendering, CLI default, and tests.
- Base: Add an optional backend-only fallback for a style key while preserving older saved configs.
- Bad: Add a field only to `DEFAULT_CONFIG` and UI controls while backend silently ignores it during export.

### 6. Tests Required

- Front-end config normalization: `test/config/documentConfigStorage.test.ts`
- Front-end default shape: `test/config/defaultConfig.test.ts`
- Export serialization or error mapping when relevant: `test/features/export/pythonBackend.test.ts`
- Backend layout/rendering: targeted tests under `backend/tests/`
- CLI export defaults: `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`

### 7. Wrong vs Correct

Wrong: update `src/types/config.ts` and `HomeTab.tsx` for a new style field, then stop.

Correct: search the field across all layers, update front-end type/default/storage/preview, backend validation/rendering, CLI default config, and tests together.

## Source Files To Check

When changing a config field, inspect and update all relevant files:

- Type shape: `src/types/config.ts`
- Front-end defaults: `src/config/defaultConfig.ts`
- Storage migration/default merge: `src/config/documentConfigStorage.ts`
- Preview rendering path: `src/components/preview/Preview.tsx`, `src/components/preview/DocxRenderPreview.tsx`, and `src/features/preview/useExportPreview.ts`
- Editing UI: `src/components/header/tabs/HomeTab.tsx`, `LayoutTab.tsx`, `layout/AdvancedPageSettingsDialog.tsx`
- Export serialization: `src/features/export/pythonBackend.ts`
- Backend validation/defaults: `backend/config.py`
- Backend rendering: `backend/converter.py`, `backend/elements.py`, `backend/document_layout.py`, `backend/converters/*.py`
- CLI harness defaults: `agent-harness/cli_anything/markdown_to_word/core/project.py`
- Tests: `test/config/*`, `test/features/export/pythonBackend.test.ts`, `backend/tests/*`, `agent-harness/**/tests/*`

## Required Style Keys

Backend validation currently requires only:

- `h1`
- `h2`
- `h3`
- `body`
- `code`
- `quote`

Front-end and CLI defaults also include `documentTitle`, `table`, and `caption`. These optional keys must have renderer fallbacks until backend validation and all stored config migration paths intentionally make them required.

## Units And Compatibility

- `pageMargin` supports both a number and an object with side-specific numeric values.
- Plain numeric lengths in backend layout helpers are treated as inches.
- `pageSize` can specify `unit: "cm"` or `unit: "in"`.
- `lineSpacing` can be a number or an exact-point string like `"22pt"`.
- `firstLineIndent` is configured in characters and converted approximately to inches in Python.

Do not silently change units. If unit semantics change, update labels, storage migration, preview CSS conversion, backend conversion, and tests.

## Safe Change Process

1. Search the field name across `src`, `backend`, `agent-harness`, and tests.
2. Update TypeScript types and defaults.
3. Update storage normalization so older saved configs still load.
4. Update preview rendering.
5. Update backend validation and DOCX rendering.
6. Update CLI harness default config if exports should match app defaults.
7. Add or update tests in every affected layer.

Avoid adding UI-only config fields to `DocumentConfig` if they do not affect preview/export. Put app preferences in `AppSettings` instead.

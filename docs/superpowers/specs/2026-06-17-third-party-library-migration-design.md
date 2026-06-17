# Third-Party Library Migration Design

## Goal

Reduce self-maintained infrastructure in the Markdown-to-Word app by replacing narrow, error-prone custom logic with mature third-party libraries while preserving current product behavior.

The migration should be conservative: each step must be independently testable and reversible, and existing user data, export semantics, and UI workflows must continue to work.

## Chosen Approach

Use a staged, low-risk migration.

1. Replace backend Markdown inline/table parsing internals with a Markdown parser library while preserving the current public parser API.
2. Replace preview heading slug generation with a rehype plugin while preserving the current preview styling components.
3. Replace custom React external-store persistence with Zustand while preserving existing store hook return shapes and localStorage keys.

This avoids the larger risks of a CodeMirror editor migration or a Pandoc-based conversion pipeline in the first pass.

## Non-Goals

- Do not migrate the editor to CodeMirror in this plan.
- Do not introduce Pandoc or pypandoc as the conversion engine.
- Do not remove `python-docx`.
- Do not rewrite Tauri file handling, sidecar invocation, or window behavior.
- Do not rewrite `src/services/docxGenerator.ts`; it is not the current primary export path.
- Do not rebuild or commit `src-tauri/binaries/` as part of the design-only step. A later implementation can rebuild the sidecar only if backend dependencies are actually changed.

## Stage 1: Backend Markdown Parser Library

### Current State

`backend/parser.py` uses regular expressions and small custom helpers for:

- inline formatting: bold, italic, inline code, links, strikethrough, underline
- GFM table detection and splitting

`backend/converter.py` still performs line-level block detection for headings, lists, quotes, code fences, horizontal rules, and tables. `backend/elements.py` applies Word styling via `python-docx`.

### Design

Use `markdown-it-py` as the preferred parser library for this stage. It provides token-based parsing for CommonMark/GFM-adjacent constructs and can reduce hand-written regex logic without forcing a full conversion-pipeline rewrite.

Keep the current exported functions in `backend/parser.py`:

- `parse_inline_formatting(text)`
- `parse_gfm_table(lines)`
- `is_table_line(line)`
- `is_table_separator(line)`

The implementation changes internally:

- `parse_inline_formatting(text)` parses inline content through the library and maps tokens back into the existing segment shape:
  - `text`
  - `bold`
  - `italic`
  - `code`
  - `underline`
  - `strike`
  - `link`
- `parse_gfm_table(lines)` uses parser output or library-compatible tokenization to return the same shape currently consumed by `converter.py`:
  - `{ "rows": list[list[str]], "alignments": list[Optional[str]] }`
- `is_table_line()` and `is_table_separator()` remain compatibility helpers for the current line-level converter loop.

Underline is the only intentionally custom inline format because Markdown has no native underline syntax. Preserve support for `<u>text</u>`. If the parser exposes it as inline HTML, map only simple `<u>...</u>` spans to `underline=True`; do not broaden raw HTML support.

### Compatibility Constraints

- Existing backend tests should continue to pass.
- Existing DOCX output for supported syntax should remain behaviorally equivalent.
- Table alignment markers must remain available to `add_table()`.
- Invalid or unsupported Markdown should degrade to plain text rather than raising broad conversion failures.

## Stage 2: Preview Heading Slug Library

### Current State

`src/components/Preview.tsx` manually extracts heading text and generates heading IDs with `extractText()` and `createHeadingComponent()`.

The preview already uses:

- `react-markdown`
- `remark-gfm`
- `rehype-raw`
- `rehype-sanitize`

### Design

Add `rehype-slug` and move heading ID generation into the Markdown pipeline.

Keep custom heading components for styling, but stop generating `id` manually inside them. The heading components should render the props provided by `react-markdown`, including the plugin-generated `id`.

The rehype plugin order should preserve the current safety model:

1. `rehypeRaw`
2. `rehypeSanitize` with the restrictive local schema
3. `rehypeSlug`

The sanitize schema must allow heading `id` attributes for `h1` through `h6`; otherwise `rehype-slug` output will be stripped or unavailable depending on ordering.

### Compatibility Constraints

- Preview must continue to render `<u>` safely.
- Script, image, input, video, and other disallowed raw HTML must remain stripped.
- Existing heading styles must remain unchanged.
- Duplicate heading IDs should be handled by the plugin rather than a local counter.

## Stage 3: Zustand Store Migration

### Current State

`src/services/settingsStore.ts` and `src/services/aiConfigStore.ts` manually implement module-level state with:

- `useSyncExternalStore`
- localStorage serialization
- synthetic `StorageEvent`
- BroadcastChannel for settings sync

### Design

Add `zustand` and migrate both stores to Zustand while preserving their public hook contracts.

`useSettingsStore()` must still return:

```ts
{
  settings,
  updateSettings,
}
```

`useAIConfigStore()` must still return:

```ts
{
  providers,
  updateProviders,
  selectedModel,
  updateSelectedModel,
}
```

Persisted key compatibility is mandatory:

- `md2word_settings`
- `app_theme`
- `md2word_auto_save_content`
- `md2word_custom_providers`
- `md2word_builtin_config`
- `md2word_selected_model`

The settings store should preserve migration from the legacy `app_theme` key when no `md2word_settings` object exists.

The AI config store should preserve the current split persistence model:

- built-in provider overrides go to `md2word_builtin_config`
- custom providers go to `md2word_custom_providers`
- selected model goes to `md2word_selected_model`

Cross-window behavior should stay intact. Zustand can own local React subscriptions, but storage events and/or BroadcastChannel should still update other windows.

### Compatibility Constraints

- Existing components should not need call-site changes.
- Existing user settings and AI provider configuration must load after migration.
- Auto-save helper functions remain plain exports:
  - `loadAutoSavedContent()`
  - `saveAutoSaveContent()`
  - `clearAutoSaveContent()`

## Testing And Validation

### Backend

Run:

```bash
python -m pytest backend/tests
```

Backend tests should cover:

- inline formatting segment shape for bold, italic, code, links, strikethrough, underline
- DOCX run formatting for supported inline formats
- table structure and alignment preservation
- existing error handling

Add focused regression cases if the parser library changes behavior around nested inline formatting, escaped pipes in tables, or `<u>` handling.

### Frontend

Run:

```bash
pnpm run typecheck
pnpm test
```

Frontend tests should cover:

- Preview still strips disallowed raw HTML.
- Preview still renders `<u>` safely.
- Heading IDs are present for headings.
- Settings store loads legacy keys and persists updates.
- AI config store preserves built-in/custom provider split and selected model persistence.

### Build

Run:

```bash
pnpm run build
```

If backend dependencies change during implementation, also run:

```bash
pnpm run build:backend
```

Only commit the rebuilt sidecar binary if the implementation task explicitly includes backend packaging.

## Rollout Order

1. Add dependencies and lockfile changes.
2. Migrate backend parser internals behind the existing parser API.
3. Migrate preview slug generation.
4. Migrate settings store to Zustand.
5. Migrate AI config store to Zustand.
6. Run backend tests, frontend tests, typecheck, and frontend build.

This order keeps the highest-risk parser changes isolated before touching frontend state, and it preserves a clear rollback point after each stage.

## Risks

- `markdown-it-py` may not parse GFM tables with the exact same defaults expected by the current tests. The implementation should explicitly enable table support or keep a small compatibility adapter.
- `<u>` underline support is custom and must be deliberately preserved.
- Zustand persistence must not collapse the AI config split-storage model, or existing custom providers may fail to load.
- Cross-window sync can regress if storage events are removed too aggressively.
- `rehype-slug` may generate slightly different heading IDs from the current local algorithm. This is acceptable unless existing tests or user workflows depend on exact IDs.

## Acceptance Criteria

- The design remains scoped to conservative third-party migration.
- Current public APIs for parser functions and store hooks remain stable.
- Existing persisted user configuration remains readable.
- All backend tests pass.
- Frontend typecheck and tests pass.
- Frontend production build succeeds.
- No CodeMirror or Pandoc migration is included in this implementation.

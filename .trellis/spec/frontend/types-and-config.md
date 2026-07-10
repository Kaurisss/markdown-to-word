# Types And Config

## Shared Types

Shared TypeScript contracts live in `src/types/`:

- `config.ts` defines `DocumentConfig`, `ElementStyle`, page/header/footer/TOC/body-start config, and `ConfigStyleKey`.
- `ai.ts` defines `AIProvider` and `AIModel`.
- `editor.ts` defines editor/preview/header prop contracts and `ViewMode`.
- `index.ts` re-exports common types.

Use local component prop interfaces for one-component props, but move contracts to `src/types/` when they cross feature boundaries.

## DocumentConfig Rules

`DocumentConfig` drives both preview and export. Before changing it, read `.trellis/spec/cross-layer/document-config-contract.md`.

Front-end sources that must stay aligned:

- `src/types/config.ts`: TypeScript shape.
- `src/config/defaultConfig.ts`: default values.
- `src/config/documentConfigStorage.ts`: storage migration and default merging.
- `src/components/preview/Preview.tsx`, `src/components/preview/DocxRenderPreview.tsx`, and `src/features/preview/useExportPreview.ts`: DOCX preview generation/rendering.
- `src/components/header/tabs/HomeTab.tsx`, `LayoutTab.tsx`, and `layout/AdvancedPageSettingsDialog.tsx`: editing UI.
- `test/config/defaultConfig.test.ts` and `test/config/documentConfigStorage.test.ts`: migration and default coverage.

Storage normalization intentionally deep-merges old saved config with `DEFAULT_CONFIG`. Preserve numeric `pageMargin` compatibility; `documentConfigStorage.test.ts` covers that behavior.

## AI Config Types

AI platform configuration assumes OpenAI-compatible chat completion and model-list endpoints:

- Built-in providers and storage migrations are in `src/features/ai/store.ts`.
- Provider/model form validation uses Zod in `src/features/ai/validation.ts`.
- Connectivity and remote model fetching live in `src/features/ai/aiApi.ts`.

When adding a provider field, update the storage split/merge logic in `store.ts`, validation/default form helpers if user-editable, and tests under `test/features/ai/`.

## Settings Types

`AppSettings` in `src/features/settings/store.ts` is the source of truth for persisted app preferences. New settings must define:

- Type field in `AppSettings`.
- Default value in `DEFAULT_SETTINGS`.
- Migration behavior through `normalizeSettings`.
- UI control in `src/components/settings/*Section.tsx` when user-facing.
- Test coverage in `test/features/settings/store.test.ts`.

Keyboard shortcut types and helpers are in `keyboardShortcuts.ts`; update `ShortcutActionId`, metadata, defaults, and conflict tests together.

## Type Safety

- Prefer concrete TypeScript interfaces for public feature boundaries.
- Runtime validation is used where users can input arbitrary AI provider/model forms (`zod` in `validation.ts`).
- Avoid adding new `[key: string]: any` patterns. Keep editor/preview prop contracts concrete unless an external package type forces a wider boundary.
- Dynamic imports should be typed through the package exports rather than hand-written `any` wrappers when practical.

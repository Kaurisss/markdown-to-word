# Directory Structure

## Source Layout

- `src/App.tsx` composes the main window, URL-param window routing, editor/preview panes, status bar, context menu, selection toolbar, and export wiring.
- `src/components/` contains rendered UI. Subdirectories are grouped by surface: `header/`, `editor/`, `preview/`, `settings/`, `ai/`, `shell/`, and shared `ui/`.
- `src/features/` contains behavior and state. Current feature groups are `editor`, `export`, `settings`, and `ai`.
- `src/config/` contains document-style defaults and local-storage normalization for `DocumentConfig`.
- `src/types/` contains shared TypeScript contracts. UI-only local prop types may stay beside the component, but cross-module types belong here.
- `src/utils/` holds pure helpers such as `inlineFormat.ts`.
- `src/design/tokens.json` is the source for generated CSS variables in `src/index.css`.
- Frontend tests live in `test/` and mirror source ownership: `test/components/**`, `test/features/**`, `test/config/**`, and `test/utils/**`.

## Placement Rules

- Put UI rendering in `src/components/**`. For example, `src/components/header/Header.tsx` chooses which ribbon tab component to show, while tab implementations live under `src/components/header/tabs/**`.
- Put reusable stateful logic in `src/features/**` hooks. For example, `src/features/editor/useSearchReplace.ts` owns search state and mutations, and `SearchPopover` only renders controls.
- Put pure feature operations beside the feature, not in components. Examples: `src/features/ai/providerActions.ts`, `src/features/ai/modelActions.ts`, and `src/features/ai/validation.ts`.
- Keep shared primitive UI wrappers under `src/components/ui/**`. Follow the existing Radix-style wrapper pattern used by `dialog.tsx`, `popover.tsx`, `tabs.tsx`, and `Select.tsx`.
- Keep Tauri integration at feature boundaries. `src/features/export/pythonBackend.ts` owns sidecar invocation; UI components call `useExport` rather than importing shell/fs APIs directly.

## Naming

- React component files use `PascalCase.tsx`: `Header.tsx`, `SettingsWindow.tsx`, `AIConfigWindow.tsx`.
- Hooks use `useX.ts`: `useEditorState.ts`, `useFileDrop.ts`, `useTheme.ts`.
- Pure action modules use lower camel descriptive names: `modelActions.ts`, `providerActions.ts`, `keyboardShortcuts.ts`.
- Tests mirror the source filename and use `.test.ts` or `.test.tsx`.

## Avoid

- Do not add more behavior to `App.tsx` when a feature hook already exists or can own the behavior locally.
- Do not import from `test/` in production code except the existing dev-only `test/sample.md?raw` path in `useEditorState.ts`; that import is guarded by `import.meta.env.DEV`.
- Do not create a second location for document defaults. Keep `src/config/defaultConfig.ts` as the front-end default source and update cross-layer specs when fields change.

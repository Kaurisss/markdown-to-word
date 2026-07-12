# Hooks And State

## Custom Hooks Own Stateful Behavior

Feature hooks under `src/features/**` are the main place for interaction state and side effects:

- `useEditorState.ts` owns editor content, undo/redo stacks, auto-save initial content, and editor undo/redo shortcuts.
- `useSearchReplace.ts` owns search query, replace state, regex construction, match index, and replace operations.
- `useFileDrop.ts` owns browser drag/drop and Tauri webview file-drop integration.
- `useGlobalShortcuts.ts` owns document-level shortcuts and guards editable targets.
- `useExport.ts` owns save dialog flow and user-facing export toasts.
- `useTheme.ts` owns DOM theme classes and Tauri window background synchronization.

When adding behavior, first check whether an existing hook owns the interaction surface. Extend that hook if the new state is part of the same workflow.

## Store Boundaries

This project uses Zustand only for app-wide persisted settings:

- `src/features/settings/store.ts` stores app settings, migrates old keys, persists to `localStorage`, and broadcasts changes across windows.
- `src/features/ai/store.ts` stores AI providers and selected model, splitting built-in provider config from custom providers in storage.

Keep transient UI state local. Examples: `Header.tsx` keeps the active ribbon tab and active document style locally; `AIConfigWindow.tsx` keeps popover visibility locally.

## Cross-Window Synchronization

Settings must sync between the main window and secondary windows:

- `settings/store.ts` writes `md2word_settings` and legacy `app_theme`.
- Settings and AI stores use Zustand `persist`, then notify peers through `BroadcastChannel`.
- Both stores retain a `storage` event fallback that calls `persist.rehydrate()`.
- `useTheme.ts` reads settings changes in the main window and applies the theme to DOM and Tauri window APIs.

When adding persisted settings, update `AppSettings`, defaults, the relevant Zod schema/migration, tests in `test/features/settings/store.test.ts`, and relevant settings UI.

## Tauri Dynamic Imports

Do not statically import Tauri APIs in modules that should run in browser-mode tests. Existing modules dynamically import Tauri APIs inside functions or effects:

- `App.tsx` and `Header.tsx` import `WebviewWindow` only when opening a window.
- `useFileDrop.ts` imports `getCurrentWebview` and `readTextFile` inside setup.
- `useShowWindowAfterFirstRender.ts` imports `@tauri-apps/api/window` inside an effect.
- `pythonBackend.ts` is the exception for export-specific Tauri plugin APIs because it is tested through pure exported helpers rather than full sidecar execution.

## Pure Helpers

Keep pure operations testable:

- Inline format mutations are in `src/utils/inlineFormat.ts` and covered by `test/utils/inlineFormat.test.ts`.
- AI provider/model array operations are in `providerActions.ts` and `modelActions.ts`.
- AI form normalization is in `validation.ts` with Zod schemas.
- Keyboard shortcut parsing and conflict detection are in `keyboardShortcuts.ts`.

Avoid embedding these transformations inside JSX handlers when they can be tested as pure functions.

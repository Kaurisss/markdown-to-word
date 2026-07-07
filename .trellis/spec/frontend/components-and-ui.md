# Components And UI

## App Shell And Windows

`src/App.tsx` uses URL search params to choose between the main editor, settings window, and AI config window. Keep that routing simple:

- `?window=settings` renders `src/components/settings/SettingsWindow.tsx`.
- `?window=config` renders `src/components/ai/AIConfigWindow.tsx`.
- The default route renders the editor, preview, header, status bar, context menu, selection toolbar, and link dialog.

When opening secondary windows, follow the dynamic import pattern in `Header.tsx` and `App.tsx`: import `@tauri-apps/api/webviewWindow` inside the click handler, set the theme and background color, and fall back to focusing an existing window on creation error.

## Ribbon UI

The header is Word-ribbon inspired:

- `src/components/header/Header.tsx` owns active ribbon tab and passes callbacks down.
- Tab bodies live in `src/components/header/tabs/*Tab.tsx`.
- Shared ribbon class strings live in `src/components/header/constants/styles.ts`.
- Font and size option lists live in `src/components/header/constants/fonts.ts`.

When adding controls, use the existing icon-button and grouped-ribbon style. Use `@mingcute/react` icons because the rest of the header and status bar already use that library.

## Preview Rendering

`src/components/preview/Preview.tsx` is not a generic HTML renderer. It renders Markdown as an A4-like Word preview:

- Markdown parsing uses `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-sanitize`, and `rehype-slug`.
- Allowed raw HTML is restricted by `src/components/preview/sanitizeSchema.ts`; currently underline `<u>` is intentionally allowed, while arbitrary tags like `script`, `img`, and `input` are stripped.
- CSS conversion helpers live in `src/components/preview/previewStyle.ts`.
- Heading IDs get the `user-content-` prefix; tests in `test/components/preview/Preview.test.tsx` protect this.

If a Markdown feature should also export to Word, update both preview rendering and the Python backend, then read `.trellis/spec/cross-layer/export-and-preview-consistency.md`.

## Editor Surface

`src/components/editor/Editor.tsx` uses a textarea plus a mirrored highlight overlay for search matches. The overlay must keep text layout properties synced with the textarea: font size, line height, padding, wrapping, scroll positions, and trailing-newline behavior.

Selection formatting UI is split across:

- `src/features/editor/useSelectionToolbar.ts`
- `src/components/editor/SelectionToolbar.tsx`
- `src/components/editor/LinkDialog.tsx`
- `src/utils/inlineFormat.ts`

Keep Markdown text mutations in utilities or hooks; components should not locally splice editor content.

## Dialogs And Forms

Settings and AI config windows are dense utility surfaces, not marketing pages. Existing patterns:

- Sidebar navigation in `SettingsWindow.tsx` and `AIConfigWindow.tsx`.
- Field sections implemented as focused components such as `AppearanceSection.tsx`, `EditorSection.tsx`, and `ApiConfigFields.tsx`.
- Dialog state and form normalization usually live in a feature hook (`useAIConfig.ts`) or the owning component, not in global state.

## Accessibility And Safety

- Use `aria-label` for icon-only switches and status bar buttons. Tests use role/name queries, for example `getByRole('switch', { name: '表头加粗' })`.
- External preview links must ask for confirmation and open through Tauri shell when available; see `Preview.tsx`.
- Do not broaden the sanitize schema without tests that prove unsafe tags remain stripped.

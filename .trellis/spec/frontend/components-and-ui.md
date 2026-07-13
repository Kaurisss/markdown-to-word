# Components And UI

## App Shell And Pages

`src/App.tsx` owns the single main-window page state:

```ts
type AppPage = 'editor' | 'ai-config' | 'settings';
```

- Keep all three page layers mounted so editor DOM state, Ribbon state, AI provider selection, and settings section selection survive navigation.
- Inactive layers must be `aria-hidden`, inert, invisible, and non-interactive while retaining layout dimensions.
- `Header.tsx` receives `onOpenAIConfig` and `onOpenSettings`; it must not create Tauri Webview windows.
- `AIConfigPage.tsx` and `SettingsPage.tsx` use `AppPageHeader.tsx` for back navigation, drag region, and main-window controls.
- AI page exit must clear transient dialogs/forms and sensitive API-key visibility without changing persisted providers or the selected provider.

## Ribbon UI

The header is Word-ribbon inspired:

- `src/components/header/Header.tsx` owns active ribbon tab and passes callbacks down.
- Tab bodies live in `src/components/header/tabs/*Tab.tsx`.
- Shared ribbon class strings live in `src/components/header/constants/styles.ts`.
- Font and size option lists live in `src/components/header/constants/fonts.ts`.

When adding controls, use the existing icon-button and grouped-ribbon style. Use `@mingcute/react` icons because the rest of the header and status bar already use that library.

## Preview Rendering

`src/components/preview/Preview.tsx` is not a Markdown HTML renderer. It is a state shell for the export-grade DOCX preview:

- `Preview.tsx` calls `useExportPreview({ markdown, cfg })` and renders `DocxRenderPreview` when DOCX bytes are ready.
- `DocxRenderPreview.tsx` dynamically imports `docx-renderer@0.2.0` and calls `render(docxBytes, body, style, { breakPages: true })` against staged containers before swapping the successful render into view.
- Generation/render failures show export-preview status UI. If a newer render fails after a successful DOCX preview, keep the previous DOCX DOM visible. Do not reintroduce the old Markdown DOM fallback without a new product decision.
- External links rendered inside the DOCX preview must ask for confirmation and open through Tauri shell when available; this belongs in `DocxRenderPreview.tsx`.

If a Markdown feature should also export to Word, update both preview rendering and the Python backend, then read `.trellis/spec/cross-layer/export-and-preview-consistency.md`.

## Editor Surface

`src/components/editor/Editor.tsx` adapts `@uiw/react-md-editor` and keeps the Markdown value controlled by the app. The toolbar contains the formatting commands and the left-pane Markdown edit/preview toggle. The toggle command must use a `keyCommand` containing `preview` or `fullscreen`, because `@uiw/react-md-editor` disables other toolbar commands while its `preview` prop is `preview`.

Selection formatting UI is split across:

- `src/features/editor/useSelectionToolbar.ts`
- `src/components/editor/SelectionToolbar.tsx`
- `src/components/editor/LinkDialog.tsx`
- `src/utils/inlineFormat.ts`

Keep Markdown text mutations in utilities or hooks; components should not locally splice editor content.

## Dialogs And Forms

Settings and AI config pages are dense utility surfaces, not marketing pages. Existing patterns:

- Sidebar navigation in `SettingsPage.tsx` and `AIConfigPage.tsx`.
- Field sections implemented as focused components such as `AppearanceSection.tsx`, `EditorSection.tsx`, and `ApiConfigFields.tsx`.
- Dialog state and form normalization usually live in a feature hook (`useAIConfig.ts`) or the owning component, not in global state.

## Accessibility And Safety

- Use `aria-label` for icon-only switches and status bar buttons. Tests use role/name queries, for example `getByRole('switch', { name: '表头加粗' })`.
- External preview links must ask for confirmation and open through Tauri shell when available; see `DocxRenderPreview.tsx`.

# Tauri Shell

## Rust Boundary

The Rust layer is intentionally thin:

- `src-tauri/src/main.rs` contains only the release console suppression attribute and `app_lib::run()`.
- `src-tauri/src/lib.rs` builds the Tauri app, installs `tauri_plugin_shell`, `tauri_plugin_dialog`, `tauri_plugin_fs`, and installs logging only in debug builds.

Do not move product behavior into Rust unless it truly needs native APIs that cannot live in the existing front-end or Python sidecar boundary.

## Window Visibility

The main Tauri window starts with `visible: false` in `tauri.conf.json`. Front-end hooks show windows after first paint to avoid flash:

- Main window: `src/features/settings/useTheme.ts` calls `getCurrentWindow().show()` after syncing theme and background.
- Secondary windows: `src/components/shell/useShowWindowAfterFirstRender.ts` shows settings and AI config windows after first render.

When creating new windows, follow the current pattern: set background color at creation, use frameless decorations when matching existing settings/config windows, and show after first render.

## Dynamic Front-End Tauri APIs

Most Tauri APIs are dynamically imported from React code so browser-mode tests do not fail:

- `Header.tsx` and `App.tsx` dynamically import `WebviewWindow`.
- `Preview.tsx` dynamically imports dialog and shell plugins for external link confirmation/opening.
- `useFileDrop.ts` dynamically imports webview and fs APIs.

Keep this pattern for optional desktop behavior.

## Drag And Drop

The app supports both browser file-drop and Tauri webview file-drop. `useFileDrop.ts` handles both paths and supports `.md`, `.markdown`, and `.txt`.

If changing drag/drop support, update both browser and Tauri branches and keep the UI overlay in `App.tsx` in sync.

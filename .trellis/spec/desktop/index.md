# Desktop Guidelines

Tauri desktop shell and packaging rules. Read this layer before changing `src-tauri/**`, sidecar execution, or build scripts.

## Pre-Development Checklist

- Read [Tauri Shell](./tauri-shell.md) before changing Rust app setup, windows, plugins, or front-end Tauri API usage.
- Read [Build And Permissions](./build-and-permissions.md) before changing sidecar names, capabilities, PyInstaller, installer scripts, or packaging.
- For export behavior, also read `.trellis/spec/cross-layer/export-and-preview-consistency.md`.

## Quality Check

- Keep Rust shell changes minimal; most app behavior belongs in React or Python.
- Confirm capability changes match actual front-end API calls.
- For full app packaging changes, use `pnpm run build:tauri` when feasible.
- For sidecar-only changes, run `pnpm run build:backend` and backend tests.

## Local Architecture Summary

- `src-tauri/src/lib.rs` registers Tauri plugins and starts the app.
- `src-tauri/src/main.rs` only delegates to `app_lib::run()` and hides the console in release Windows builds.
- `src-tauri/tauri.conf.json` defines the app window, dev URL, dist path, product metadata, and external sidecar binary.
- `src-tauri/capabilities/default.json` grants window, dialog, shell, and filesystem permissions.

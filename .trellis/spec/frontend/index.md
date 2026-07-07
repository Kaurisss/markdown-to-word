# Frontend Guidelines

React + TypeScript front-end for the Markdown-to-Word desktop app. Read this layer before changing anything under `src/` or `test/`.

## Pre-Development Checklist

- Read [Directory Structure](./directory-structure.md) when adding files or moving behavior between modules.
- Read [Components And UI](./components-and-ui.md) before editing `src/components/**`, ribbon tabs, dialogs, preview, or shell chrome.
- Read [Hooks And State](./hooks-and-state.md) before editing `src/features/**` hooks or Zustand stores.
- Read [Types And Config](./types-and-config.md) before changing `DocumentConfig`, AI provider types, settings defaults, or local storage migrations.
- Read [Testing And Quality](./testing-and-quality.md) before adding or updating Vitest coverage.
- For export, preview, or style config work, also read `.trellis/spec/cross-layer/index.md`.

## Quality Check

- Keep UI state changes inside the owning hook/store and keep components mostly orchestration and rendering.
- Verify TypeScript with `pnpm run typecheck`.
- Run targeted Vitest files first, then `pnpm test` when the change touches shared UI, config, stores, or export behavior.
- DOM tests that render React components must include `// @vitest-environment jsdom`.
- Do not change `src/index.css` token blocks by hand when the value belongs in `src/design/tokens.json`; run `pnpm run generate:tokens`.

## Local Architecture Summary

- `src/App.tsx` is the top-level orchestrator for the main editor window and the URL-param routed settings / AI config windows.
- `src/components/` owns UI surfaces. `src/features/` owns stateful behavior, pure feature operations, and custom hooks.
- `DocumentConfig` from `src/types/config.ts` is the core front-end contract shared with preview and Python export.
- Tauri APIs are dynamically imported at usage points so browser-mode tests and Vite builds do not eagerly require the desktop runtime.

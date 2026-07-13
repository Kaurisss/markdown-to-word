# Cross-Layer Guidelines

Read this layer before changing behavior shared across React, Python backend, Tauri, config defaults, export, or preview.

## Pre-Development Checklist

- Read [Document Config Contract](./document-config-contract.md) before changing `DocumentConfig`, style defaults, page layout fields, or config validation.
- Read [Export And Preview Consistency](./export-and-preview-consistency.md) before changing Markdown rendering, DOCX output, preview styles, or supported syntax.
- Read [Storage Errors And Generated Assets](./storage-errors-and-generated-assets.md) before changing local storage, AI/settings persistence, sidecar temp files, error mapping, or generated CSS tokens.

## Quality Check

- Search all layers for the field or behavior you are changing before editing.
- For config changes, update front-end types/defaults/storage, preview mapping, backend validation/rendering, and tests together.
- Run cross-layer validation appropriate to the change: front-end typecheck/tests, backend pytest, and export-specific tests.

## Core Cross-Layer Flow

1. User edits Markdown and style config in React.
2. `Preview.tsx` renders Markdown with the current `DocumentConfig`.
3. Export writes Markdown and config JSON into Tauri app cache.
4. Tauri shell executes the `binaries/md2word` Python sidecar.
5. Python validates config, converts Markdown to DOCX, applies layout, and saves to the chosen path.
6. Front-end maps backend exit codes and stderr into user-facing toasts.

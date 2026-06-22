# Repository Guidelines

## Project Structure & Module Organization

- `src/`: React + TypeScript UI (Vite): `components/`, `features/` (ai, editor, export, settings), `hooks/`, `interfaces/`, `config/`, `types/`, `utils/`.
- `backend/`: Python conversion engine (`backend/backend.py`), `backend/converters/` (table, toc), `backend/parsers/`, and `backend/tests/`.
- `src-tauri/`: Tauri (Rust) desktop shell; `src-tauri/binaries/` holds the packaged Python executable.
- `scripts/`: build/packaging helpers (PyInstaller, Inno Setup).
- `test/`: frontend test files mirroring `src/` structure (`test/components/`, `test/features/`, `test/utils/`) + fixtures (`test/config.json`, `test/sample.md`).
- Generated/ignored: `dist/`, `build/`, `src-tauri/target/`.

## Build, Test, and Development Commands

```bash
pnpm install
pnpm run dev             # Vite dev server
pnpm run dev:tauri       # run desktop app

pnpm run build           # Vite production build -> dist/
pnpm run build:tauri     # build desktop bundles
pnpm run build:installer # build Windows installer (requires iscc)

pnpm test                # Vitest (one-shot)
pnpm run lint            # ESLint for .ts/.tsx
pnpm run typecheck       # tsc --noEmit

pnpm run build:backend   # PyInstaller backend -> src-tauri/binaries/
```

## Coding Style & Naming Conventions

- TypeScript/React: 2-space indentation, `PascalCase` components/files (e.g., `Header.tsx`), `camelCase` functions/vars, `useX` hooks.
- Python: 4-space indentation, `snake_case`; keep changes testable (pure functions where practical).

## Testing Guidelines

- Frontend: Vitest + fast-check; test files live in `test/` mirroring `src/` structure (e.g., `test/features/ai/store.test.ts`).
- Frontend test imports use the `@/` alias (resolving to `src/`), not relative paths — including dynamic `import()` calls.
- Default vitest environment is `node`; tests needing DOM must opt in with `// @vitest-environment jsdom` at the top of the file.
- Backend: pytest + hypothesis in `backend/tests/`: `python -m pytest backend/tests`

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`; optional scope is common (e.g., `feat(ai-tab): ...`).
- PRs include: what/why, how to test, and screenshots/GIFs for UI changes.
- If you change `backend/`, rebuild and commit the updated binary in `src-tauri/binaries/` (`pnpm run build:backend`), and note it in the PR.
- Do not commit generated output (`dist/`, `build/`, `src-tauri/target/`, `*.docx`).

## Security & Configuration

- Treat API keys as secrets. Keep them out of git; `.env*` is ignored.

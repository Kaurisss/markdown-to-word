# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx`, `index.tsx`, and `index.css` are the app entry points and global styles.
- `components/` holds React UI pieces (Editor, Preview, Header, StyleEditor).
- `services/` contains core logic and the Python bridge (e.g., `pythonBackend.ts`).
- `config/`, `interfaces/`, `types.ts`, and `constants.ts` define shared config and types.
- `backend/` is the Python conversion engine (`backend.py`) with tests in `backend/tests/`.
- `src-tauri/` holds the Rust/Tauri desktop shell and config.
- `test/` is the frontend test area; `assets/` stores static assets; `dist/` is build output.

## Build, Test, and Development Commands
- `npm install` installs JavaScript dependencies.
- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production web bundle in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run tauri:dev` runs the desktop app in dev mode.
- `npm run tauri:build` outputs installers under `src-tauri/target/release/bundle/`.
- `npm run test` runs Vitest once (non-watch).
- `npm run build:python` packages the Python backend.
- `npm run clean` / `npm run rebuild` perform clean or full rebuilds.
- Python CLI example: `python backend/backend.py input.md output.docx --config-file config.json`.

## Coding Style & Naming Conventions
- TypeScript + React with 2-space indentation and semicolons.
- Components use `PascalCase` filenames (`StyleEditor.tsx`); utilities use `camelCase` (`pythonBackend.ts`).
- Tailwind classes live in JSX; keep class lists readable and grouped.
- No repo-wide formatter script is defined; match existing file style.

## Testing Guidelines
- Frontend: Vitest in `test/` and `*.test.ts(x)`; run `npm run test`.
- Backend: `cd backend` then `pytest tests/`.
- Add or update tests for Markdown parsing and style configuration changes.

## Commit & Pull Request Guidelines
- Commit messages are short and action-oriented; conventional prefixes like `feat:` appear in history.
- Keep one topic per commit; English or Chinese is acceptable if consistent within a commit.
- PRs should include a summary, testing notes, and screenshots/GIFs for UI changes; link related issues.

## Configuration & Security Notes
- Style and conversion defaults live under `config/`; avoid hard-coded absolute paths.
- Conversion runs locally; avoid adding network calls without a clear need.

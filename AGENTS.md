# Repository Guidelines

## Communication
- Use Chinese in responses and documentation updates within this repository.

## Project Structure & Module Organization
- `App.tsx`, `index.tsx`, `index.css`: React entry, app shell, and global styles.
- `components/`: UI pieces such as `Editor`, `Preview`, `Header`, and status/search widgets.
- `services/`: app logic and platform bridges, including `pythonBackend.ts` and the Vitest suite `*.test.ts`.
- `config/` and `interfaces/`: default config and shared TypeScript types.
- `backend/`: Python conversion engine (`backend.py`) plus `backend/tests/` for pytest.
- `src-tauri/`: Tauri (Rust) desktop wrapper and configuration.
- `assets/`, `docs/`, `scripts/`: static assets, documentation, and build helpers.

## Build, Test, and Development Commands
- `npm run dev`: start the Vite web dev server.
- `npm run build`: production web build to `dist/`.
- `npm run preview`: preview the production build locally.
- `npm run tauri:dev`: run the desktop app in dev mode.
- `npm run tauri:build`: build desktop installers (outputs under `src-tauri/target/`).
- `npm run test`: run Vitest (`**/*.test.ts`).
- `npm run build:python`: package the Python backend.
- `npm run clean`: remove build artifacts and caches.

Example Python CLI usage:
```bash
python backend/backend.py input.md output.docx
```

## Coding Style & Naming Conventions
- TypeScript/React with ES modules; follow existing 2-space indentation and import grouping.
- Tests use `*.test.ts` for Vitest and `test_*.py` for pytest.
- Prefer descriptive component and service names (`Header`, `pythonBackend`) that match file names.

## Testing Guidelines
- Frontend/unit tests: Vitest, configured in `vitest.config.ts`.
- Backend tests: pytest in `backend/tests/`.
- Add or update tests for new conversion behavior or UI features where practical.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits (e.g., `feat: ...`, `fix(Header): ...`, `refactor: ...`).
- Keep subjects short and action-oriented; Chinese or English is both used in history.
- PRs should include: summary of changes, testing performed, and screenshots for UI changes.

## Security & Configuration Tips
- Do not commit generated artifacts from `dist/` or `src-tauri/target/`.
- Local config should live in `config/` or be passed via CLI flags when testing.

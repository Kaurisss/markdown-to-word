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
<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

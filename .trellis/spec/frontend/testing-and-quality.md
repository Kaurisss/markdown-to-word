# Testing And Quality

## Test Layout

Frontend tests live under `test/` and mirror ownership:

- Components: `test/components/**`
- Feature hooks and pure modules: `test/features/**`
- Config: `test/config/**`
- Utilities: `test/utils/**`

Use the `@/` alias in tests, including dynamic imports. This matches `vitest.config.ts`.

## Environments

Vitest defaults to the `node` environment. Any test that renders React components, uses DOM APIs, or touches `localStorage` must start with:

```ts
// @vitest-environment jsdom
```

Examples:

- `test/components/preview/Preview.test.tsx`
- `test/features/settings/store.test.ts`
- `test/features/ai/useAIConfig.test.tsx`

Pure utility tests such as `test/utils/inlineFormat.test.ts` can stay in the default node environment.

## What To Test

- For components, prefer user-observable roles, labels, text, and DOM effects. `AdvancedPageSettingsDialog.test.tsx` uses switch role/name queries for settings toggles.
- For hooks, use `renderHook` and wrap state updates in `act`, as in `test/features/ai/useAIConfig.test.tsx`.
- For persisted stores, reset `localStorage` and reload modules with `vi.resetModules()` when import-time store initialization matters.
- Persisted Store tests cover loading, migration, malformed storage, and writes. There is no cross-window adapter in the single-window architecture.
- Main-window navigation tests must assert that editor, AI config, and settings layers remain mounted while `aria-hidden` changes, and that representative local state survives a round trip.
- For pure helpers, test edge cases and round trips. `pythonBackend.test.ts` uses fast-check for config serialization and explicit error mapping tests.
- For preview safety, keep tests that assert unsafe raw HTML is stripped and generated heading IDs are prefixed.

## Commands

- `pnpm run typecheck`
- `pnpm test`
- `pnpm run lint`

For narrow work, run the directly affected test file first. Run full `pnpm test` for shared config, preview, stores, UI primitives, or export changes.

## Current Known State

At the time this spec was written, `pnpm run typecheck` passed. `pnpm test` had one known failure in `test/components/header/tabs/layout/AdvancedPageSettingsDialog.test.tsx`: the test searches for the old placeholder text `留空则不显示文字`, while the component uses `留空则不显示`. Do not treat that failure as a desired behavior; fix it in a product/test task, not while bootstrapping specs.

## Generated CSS Tokens

`pnpm run dev` and `pnpm run build` run `generate:tokens` before Vite. If changing design tokens:

- Edit `src/design/tokens.json`.
- Run `pnpm run generate:tokens`.
- Review the generated `:root` and `.dark` blocks in `src/index.css`.

Do not manually edit generated token values in `src/index.css` unless you are also updating the generator.

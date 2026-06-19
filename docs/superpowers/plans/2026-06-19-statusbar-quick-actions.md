# Statusbar Quick Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the bottom status bar into a compact left/right quick-action surface with search/replace on the left and view/export/settings controls on the right.

**Architecture:** Keep `StatusBar` as a presentational React component that receives document content, view state, and callbacks from `App.tsx`. Reuse the existing `ViewMode` type and existing action callbacks instead of introducing new stores or duplicating Header behavior. Add focused jsdom tests for rendering, click callbacks, disabled export behavior, and active view indication.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, Tailwind utility classes, `@mingcute/react` icons.

---

## File Structure

- Modify: `src/components/shell/StatusBar.tsx`
  - Responsibility: render document stats plus left/right quick actions.
  - New props: `onReplaceClick`, `viewMode`, `onViewModeChange`, `onExport`, `isExporting`, `onSettingsClick`.
- Create: `src/components/shell/StatusBar.test.tsx`
  - Responsibility: cover the statusbar public behavior through DOM text, accessible names, and click callbacks.
- Modify: `src/App.tsx`
  - Responsibility: pass existing app actions into `StatusBar`; add a local `openSettingsWindow` callback mirroring the Header settings window behavior.

## Scope Decisions

- Left side contains document stats first, then editing quick actions: search and replace.
- Right side contains workflow quick actions: editor/split/preview view buttons, export, and settings.
- Buttons use icons with `aria-label` and `title`; no visible explanatory text is added.
- Export button is disabled while `isExporting` is true.
- No new settings toggle is added. The existing `showStatusBar` setting continues to control visibility.
- No import button is added to the status bar, because import needs the hidden file input owned by Header and would make this change larger than requested.

---

### Task 1: Add StatusBar Behavior Tests

**Files:**
- Create: `src/components/shell/StatusBar.test.tsx`
- Test: `src/components/shell/StatusBar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/shell/StatusBar.test.tsx` with:

```tsx
// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusBar } from './StatusBar';

vi.mock('@mingcute/react', () => {
  const React = require('react');
  const MockIcon = ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'statusbar-icon' });

  return {
    Search2Line: MockIcon,
    TransferHorizontalLine: MockIcon,
    EditLine: MockIcon,
    Columns2Line: MockIcon,
    Eye2Line: MockIcon,
    Download2Line: MockIcon,
    Settings3Line: MockIcon,
  };
});

describe('StatusBar', () => {
  it('renders document stats and the left/right quick action groups', () => {
    render(
      <StatusBar
        content={'# Title\n\nBody text'}
        viewMode="split"
        onSearchClick={vi.fn()}
        onReplaceClick={vi.fn()}
        onViewModeChange={vi.fn()}
        onExport={vi.fn()}
        onSettingsClick={vi.fn()}
      />
    );

    expect(screen.getByText('字符: 18')).toBeDefined();
    expect(screen.getByText('字符(不含空格): 14')).toBeDefined();
    expect(screen.getByText('行数: 3')).toBeDefined();
    expect(screen.getByText('段落: 2')).toBeDefined();
    expect(screen.getByRole('button', { name: '搜索' })).toBeDefined();
    expect(screen.getByRole('button', { name: '替换' })).toBeDefined();
    expect(screen.getByRole('button', { name: '编辑器视图' })).toBeDefined();
    expect(screen.getByRole('button', { name: '双栏视图' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '预览视图' })).toBeDefined();
    expect(screen.getByRole('button', { name: '导出 Word' })).toBeDefined();
    expect(screen.getByRole('button', { name: '设置' })).toBeDefined();
  });

  it('calls action callbacks from statusbar buttons', () => {
    const onSearchClick = vi.fn();
    const onReplaceClick = vi.fn();
    const onViewModeChange = vi.fn();
    const onExport = vi.fn();
    const onSettingsClick = vi.fn();

    render(
      <StatusBar
        content="body"
        viewMode="editor"
        onSearchClick={onSearchClick}
        onReplaceClick={onReplaceClick}
        onViewModeChange={onViewModeChange}
        onExport={onExport}
        onSettingsClick={onSettingsClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '搜索' }));
    fireEvent.click(screen.getByRole('button', { name: '替换' }));
    fireEvent.click(screen.getByRole('button', { name: '双栏视图' }));
    fireEvent.click(screen.getByRole('button', { name: '导出 Word' }));
    fireEvent.click(screen.getByRole('button', { name: '设置' }));

    expect(onSearchClick).toHaveBeenCalledTimes(1);
    expect(onReplaceClick).toHaveBeenCalledTimes(1);
    expect(onViewModeChange).toHaveBeenCalledWith('split');
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('disables export while exporting', () => {
    const onExport = vi.fn();

    render(
      <StatusBar
        content="body"
        viewMode="preview"
        onViewModeChange={vi.fn()}
        onExport={onExport}
        isExporting
      />
    );

    const exportButton = screen.getByRole('button', { name: '正在导出' });
    expect((exportButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(exportButton);
    expect(onExport).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
pnpm exec vitest run src/components/shell/StatusBar.test.tsx
```

Expected: FAIL because `StatusBar` does not yet accept `viewMode`, `onReplaceClick`, `onViewModeChange`, `onExport`, `isExporting`, or `onSettingsClick`, and does not render these accessible buttons.

- [ ] **Step 3: Commit failing test**

```powershell
git add src/components/shell/StatusBar.test.tsx
git commit -m "test: cover statusbar quick actions"
```

---

### Task 2: Implement Left/Right Quick Actions in StatusBar

**Files:**
- Modify: `src/components/shell/StatusBar.tsx`
- Test: `src/components/shell/StatusBar.test.tsx`

- [ ] **Step 1: Replace StatusBar implementation**

Replace `src/components/shell/StatusBar.tsx` with:

```tsx
import React, { useMemo } from 'react';
import {
  Columns2Line,
  Download2Line,
  EditLine,
  Eye2Line,
  Search2Line,
  Settings3Line,
  TransferHorizontalLine,
} from '@mingcute/react';
import { ViewMode } from '../../types';

interface StatusBarProps {
  content: string;
  viewMode: ViewMode;
  onSearchClick?: () => void;
  onReplaceClick?: () => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onExport?: () => void;
  isExporting?: boolean;
  onSettingsClick?: () => void;
}

interface StatusBarButtonProps {
  label: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const statusButtonClass =
  'grid h-5 w-5 place-items-center rounded text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100';
const activeButtonClass = 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100';

const StatusBarButton: React.FC<StatusBarButtonProps> = ({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active || undefined}
    title={title ?? label}
    disabled={disabled}
    onClick={onClick}
    className={`${statusButtonClass} ${active ? activeButtonClass : ''}`}
  >
    {children}
  </button>
);

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  viewMode,
  onSearchClick,
  onReplaceClick,
  onViewModeChange,
  onExport,
  isExporting = false,
  onSettingsClick,
}) => {
  const stats = useMemo(() => {
    const chars = content.length;
    const charsNoSpace = content.replace(/\s/g, '').length;
    const lines = content ? content.split('\n').length : 0;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    return { chars, charsNoSpace, lines, paragraphs };
  }, [content]);

  return (
    <div className="h-6 flex-shrink-0 bg-[#f3f3f3] dark:bg-[#252526] border-t border-[#e5e5e5] dark:border-[#3c3c3c] flex items-center justify-between gap-3 px-3 text-xs text-gray-600 dark:text-gray-400 select-none">
      <div className="flex min-w-0 items-center gap-4 overflow-hidden">
        <span className="whitespace-nowrap">字符: {stats.chars}</span>
        <span className="hidden whitespace-nowrap sm:inline">字符(不含空格): {stats.charsNoSpace}</span>
        <span className="whitespace-nowrap">行数: {stats.lines}</span>
        <span className="hidden whitespace-nowrap sm:inline">段落: {stats.paragraphs}</span>
        <div className="ml-1 flex items-center gap-1 border-l border-gray-300 pl-2 dark:border-gray-700">
          <StatusBarButton label="搜索" onClick={onSearchClick}>
            <Search2Line className="h-3.5 w-3.5" />
          </StatusBarButton>
          <StatusBarButton label="替换" onClick={onReplaceClick}>
            <TransferHorizontalLine className="h-3.5 w-3.5" />
          </StatusBarButton>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <StatusBarButton
          label="编辑器视图"
          active={viewMode === 'editor'}
          onClick={() => onViewModeChange?.('editor')}
        >
          <EditLine className="h-3.5 w-3.5" />
        </StatusBarButton>
        <StatusBarButton
          label="双栏视图"
          active={viewMode === 'split'}
          onClick={() => onViewModeChange?.('split')}
        >
          <Columns2Line className="h-3.5 w-3.5" />
        </StatusBarButton>
        <StatusBarButton
          label="预览视图"
          active={viewMode === 'preview'}
          onClick={() => onViewModeChange?.('preview')}
        >
          <Eye2Line className="h-3.5 w-3.5" />
        </StatusBarButton>
        <div className="mx-1 h-3.5 w-px bg-gray-300 dark:bg-gray-700" />
        <StatusBarButton
          label={isExporting ? '正在导出' : '导出 Word'}
          title={isExporting ? '正在导出' : '导出 Word'}
          disabled={isExporting}
          onClick={onExport}
        >
          <Download2Line className="h-3.5 w-3.5" />
        </StatusBarButton>
        <StatusBarButton label="设置" onClick={onSettingsClick}>
          <Settings3Line className="h-3.5 w-3.5" />
        </StatusBarButton>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Run StatusBar test**

Run:

```powershell
pnpm exec vitest run src/components/shell/StatusBar.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit component implementation**

```powershell
git add src/components/shell/StatusBar.tsx src/components/shell/StatusBar.test.tsx
git commit -m "feat: add statusbar quick actions"
```

---

### Task 3: Wire Existing App Actions Into StatusBar

**Files:**
- Modify: `src/App.tsx`
- Test: `src/components/shell/StatusBar.test.tsx`

- [ ] **Step 1: Add settings window callback in App**

In `src/App.tsx`, after the existing `showToast` callback, add:

```tsx
  const openSettingsWindow = useCallback(async () => {
    try {
      const label = 'settings';
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const isDark = theme === 'dark';
      const windowBg = isDark ? '#1e1e1e' : '#f9fafb';

      const url = `/?window=settings&theme=${encodeURIComponent(theme)}`;
      const webview = new WebviewWindow(label, {
        url,
        title: '设置',
        width: 580,
        height: 720,
        decorations: false,
        resizable: false,
        center: true,
        visible: false,
        theme,
        backgroundColor: windowBg,
      });

      webview.once('tauri://created', function () {
        void webview.setBackgroundColor(windowBg);
      });

      webview.once('tauri://error', function () {
        import('@tauri-apps/api/window').then(({ Window }) => {
          const win = new Window(label);
          win.setFocus();
        });
      });
    } catch (e) {
      console.error('Failed to open settings window:', e);
    }
  }, [theme]);
```

This duplicates the existing Header-local settings behavior in `App.tsx` so `StatusBar` can trigger settings without reaching into Header internals.

- [ ] **Step 2: Update StatusBar usage**

Replace the current statusbar render in `src/App.tsx`:

```tsx
          {appSettings.showStatusBar && (
            <StatusBar content={content} onSearchClick={() => setShowSearch(true)} />
          )}
```

with:

```tsx
          {appSettings.showStatusBar && (
            <StatusBar
              content={content}
              viewMode={viewMode}
              onSearchClick={() => setShowSearch(true)}
              onReplaceClick={() => {
                setShowSearch(true);
                setShowReplace(true);
              }}
              onViewModeChange={setViewMode}
              onExport={handleExport}
              isExporting={isExporting}
              onSettingsClick={openSettingsWindow}
            />
          )}
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
pnpm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 4: Run focused tests**

Run:

```powershell
pnpm exec vitest run src/components/shell/StatusBar.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit app wiring**

```powershell
git add src/App.tsx src/components/shell/StatusBar.tsx src/components/shell/StatusBar.test.tsx
git commit -m "feat: wire statusbar quick actions"
```

---

### Task 4: Final Validation

**Files:**
- Verify: `src/App.tsx`
- Verify: `src/components/shell/StatusBar.tsx`
- Verify: `src/components/shell/StatusBar.test.tsx`

- [ ] **Step 1: Run lint**

Run:

```powershell
pnpm run lint
```

Expected: PASS.

- [ ] **Step 2: Run full frontend tests**

Run:

```powershell
pnpm test
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```powershell
pnpm run build
```

Expected: PASS and Vite writes the production build to `dist/`.

- [ ] **Step 4: Manual UI smoke test**

Run:

```powershell
pnpm run dev
```

Expected:
- Vite serves the app on `http://localhost:3000`.
- Bottom statusbar shows stats on the left.
- Search and replace buttons appear to the right of stats.
- Editor, split, and preview buttons appear on the far right and switch the main view.
- Export button starts the existing Word export flow and becomes disabled while exporting.
- Settings button opens the existing settings window in Tauri; in browser-only dev mode it may log a Tauri API error, which is acceptable for non-Tauri smoke testing.

- [ ] **Step 5: Commit validation notes if implementation changed during validation**

If validation required code changes, commit them:

```powershell
git add src/App.tsx src/components/shell/StatusBar.tsx src/components/shell/StatusBar.test.tsx
git commit -m "fix: polish statusbar quick actions"
```

If validation required no changes, do not create an empty commit.

---

## Self-Review

- Spec coverage: The user selected option C, shortcut/function enhancement, and requested left/right layout. Tasks implement left editing actions and right workflow actions.
- Placeholder scan: No deferred implementation steps remain.
- Type consistency: `ViewMode` is imported from `../../types`, and `StatusBar` receives the same `viewMode` and `setViewMode` values already used by `App.tsx` and Header.
- Scope check: This is a single UI component enhancement plus app wiring. It does not require backend, Tauri Rust, or settings-store changes.

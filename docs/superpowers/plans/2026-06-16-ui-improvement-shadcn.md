# UI Improvement Shadcn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace fragile custom UI primitives with shadcn/Radix-backed primitives while preserving the desktop editor layout and current visual identity.

**Architecture:** Keep product-specific surfaces such as the ribbon header, Tauri window controls, editor, and Word preview as application code. Introduce shadcn only at the reusable interaction layer: select, context menu, button, separator, tooltip, switch, dialog, and toast. Existing app-level components compose those primitives through thin compatibility wrappers so the first migration stays small and reversible.

**Tech Stack:** React 19, Vite, Tailwind CSS v4, shadcn/ui, Radix primitives, TypeScript, Vitest, Tauri.

---

## File Structure

- Create: `components.json` for shadcn project configuration.
- Create: `src/lib/utils.ts` for the `cn()` class merge helper used by shadcn components.
- Create: `src/components/ui/button.tsx`, `src/components/ui/select.tsx`, `src/components/ui/context-menu.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/tooltip.tsx`, `src/components/ui/switch.tsx`, `src/components/ui/dialog.tsx` via `npx shadcn@latest add`.
- Create: `src/components/ui/sonner.tsx` if the toast migration is included.
- Modify: `src/index.css` to add shadcn semantic tokens while mapping them close to the existing gray/brand/dark palette.
- Modify: `src/components/ui/Select.tsx` to become a compatibility wrapper around shadcn select.
- Modify: `src/components/ui/ContextMenu.tsx` to become a compatibility wrapper around shadcn context menu.
- Modify: `src/App.tsx` and `src/components/Toast.tsx` only if replacing the current toast component with sonner.
- Modify: `src/components/SettingsWindow.tsx`, `src/components/header/tabs/LayoutTab.tsx`, and `src/components/header/tabs/HomeTab.tsx` only where existing `Select` usage needs wrapper-compatible prop cleanup.
- Test: `npm run typecheck`, `npm test`, and targeted browser/Tauri visual QA for main editor, settings window, and AI config window.

## Non-Goals

- Do not redesign the ribbon toolbar into generic shadcn cards.
- Do not replace the editor with CodeMirror in this plan.
- Do not change markdown preview rendering or Python DOCX generation.
- Do not move state stores to Zustand in this plan.
- Do not overwrite the current visual theme with a stock shadcn look.

---

### Task 1: Initialize shadcn Config

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `src/index.css`
- Modify: `package.json`

- [ ] **Step 1: Inspect shadcn project detection**

Run:

```bash
npx shadcn@latest info --json
```

Expected: the command may report that the project is not initialized because `components.json` does not exist. If it already detects a config, stop and inspect it before continuing.

- [ ] **Step 2: Initialize shadcn for this Vite project**

Run:

```bash
npx shadcn@latest init
```

Use these answers if prompted:

```text
Style: New York or Default
Base color: zinc
CSS variables: yes
Tailwind CSS file: src/index.css
Components alias: @/components
Utils alias: @/lib/utils
RSC: no
```

Expected: `components.json`, `src/lib/utils.ts`, and package dependency changes are created.

- [ ] **Step 3: Verify `components.json` paths**

Ensure `components.json` has Vite-compatible aliases:

```json
{
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Expected: aliases match the existing `tsconfig.json` path alias where `@/*` points to `./src/*`.

- [ ] **Step 4: Verify `src/lib/utils.ts`**

The file should contain this helper or an equivalent shadcn-generated version:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Expected: `clsx` and `tailwind-merge` are present in `package.json`.

- [ ] **Step 5: Run baseline checks**

Run:

```bash
npm run typecheck
npm test
```

Expected: both commands pass before adding components.

- [ ] **Step 6: Commit initialization**

Run:

```bash
git add components.json src/lib/utils.ts src/index.css package.json pnpm-lock.yaml package-lock.json
git commit -m "chore(ui): initialize shadcn"
```

If this repo is using only `pnpm-lock.yaml`, do not add `package-lock.json`.

---

### Task 2: Add shadcn Primitive Set

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/context-menu.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/switch.tsx`
- Create: `src/components/ui/dialog.tsx`
- Optional create: `src/components/ui/sonner.tsx`

- [ ] **Step 1: Read component docs**

Run:

```bash
npx shadcn@latest docs button select context-menu separator tooltip switch dialog sonner
```

Expected: docs URLs are printed. Open the docs for `select` and `context-menu` before writing wrappers.

- [ ] **Step 2: Preview component additions**

Run:

```bash
npx shadcn@latest add button select context-menu separator tooltip switch dialog --dry-run
```

Expected: the CLI lists new files and dependencies without overwriting existing uppercase wrapper files `src/components/ui/Select.tsx` and `src/components/ui/ContextMenu.tsx`.

- [ ] **Step 3: Add components**

Run:

```bash
npx shadcn@latest add button select context-menu separator tooltip switch dialog
```

Expected: lowercase shadcn components are added under `src/components/ui/`.

- [ ] **Step 4: Add sonner only if toast migration is included**

Run:

```bash
npx shadcn@latest add sonner
```

Expected: `src/components/ui/sonner.tsx` is created and `sonner` is added to dependencies.

- [ ] **Step 5: Run checks**

Run:

```bash
npm run typecheck
npm test
```

Expected: both commands pass with no app-level imports changed.

- [ ] **Step 6: Commit primitive additions**

Run:

```bash
git add src/components/ui package.json pnpm-lock.yaml package-lock.json
git commit -m "chore(ui): add shadcn primitives"
```

If this repo is using only `pnpm-lock.yaml`, do not add `package-lock.json`.

---

### Task 3: Migrate Existing Select Wrapper

**Files:**
- Modify: `src/components/ui/Select.tsx`
- Read call sites: `src/components/SettingsWindow.tsx`, `src/components/header/tabs/LayoutTab.tsx`, `src/components/header/tabs/HomeTab.tsx`

- [ ] **Step 1: Preserve the existing public interface**

Keep the exported types compatible:

```ts
export interface SelectOption {
  label: string;
  value: string | number;
  fontFamily?: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
  optionClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
}
```

Expected: existing call sites do not need bulk prop rewrites.

- [ ] **Step 2: Replace implementation with shadcn select**

Implement `src/components/ui/Select.tsx` as a wrapper around lowercase `select.tsx`:

```tsx
import React from 'react';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string | number;
  fontFamily?: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
  optionClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  triggerClassName = '',
  optionClassName = '',
  placeholder = '请选择',
  disabled = false,
  variant = 'default',
}) => {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn('relative', className)}>
      <ShadcnSelect
        value={String(value)}
        onValueChange={(nextValue) => {
          const option = options.find((item) => String(item.value) === nextValue);
          onChange(option ? option.value : nextValue);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            'h-7 text-[13px]',
            variant === 'ghost' && 'border-transparent bg-transparent shadow-none hover:bg-gray-100 dark:hover:bg-dark-element-hover',
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder}>
            <span style={selected?.fontFamily ? { fontFamily: `"${selected.fontFamily}"` } : undefined}>
              {selected?.label ?? placeholder}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                className={cn('text-[13px]', optionClassName)}
              >
                <span style={option.fontFamily ? { fontFamily: `"${option.fontFamily}"` } : undefined}>
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </ShadcnSelect>
    </div>
  );
};
```

Expected: callers continue importing `Select` from `./ui/Select`.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors. If numeric `value` call sites fail because of `String(value)`, fix inside the wrapper, not at every caller.

- [ ] **Step 4: Visual QA select menus**

Run:

```bash
npm run dev
```

Open the app and check:

```text
Layout tab font selects open and close.
Settings window font and view mode selects work.
Keyboard arrow navigation works inside the dropdown.
Dark mode dropdown background and text remain readable.
```

- [ ] **Step 5: Commit select migration**

Run:

```bash
git add src/components/ui/Select.tsx
git commit -m "refactor(ui): wrap selects with shadcn"
```

---

### Task 4: Migrate Shared Context Menu Wrapper

**Files:**
- Modify: `src/components/ui/ContextMenu.tsx`
- Read: `src/hooks/useContextMenu.tsx`
- Read: `src/hooks/useInputContextMenu.tsx`
- Read: `src/components/AIConfigWindow.tsx`
- Read: `src/components/AIConfigModal.tsx`

- [ ] **Step 1: Keep the existing menu item interface**

Preserve this interface:

```ts
export interface ContextMenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  checked?: boolean;
  icon?: React.ReactNode;
  danger?: boolean;
  submenu?: ContextMenuItem[];
}
```

Expected: context-menu producers do not need to change in this task.

- [ ] **Step 2: Replace rendering with shadcn context-menu primitives**

Implement `src/components/ui/ContextMenu.tsx` as a compatibility renderer:

```tsx
import React, { useEffect, useMemo, useRef } from 'react';
import {
  ContextMenu as ShadcnContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem as ShadcnContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  checked?: boolean;
  icon?: React.ReactNode;
  danger?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  items,
  onClose,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => {
      triggerRef.current?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          clientX: x,
          clientY: y,
        }),
      );
    });
    return () => cancelAnimationFrame(frame);
  }, [visible, x, y]);

  const renderedItems = useMemo(() => items.map((item, index) => {
    if (item.separator) {
      return <ContextMenuSeparator key={index} />;
    }

    const content = (
      <>
        <span className="flex items-center gap-2">
          {item.icon}
          <span>{item.label}</span>
        </span>
        {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
      </>
    );

    const className = cn(item.danger && 'text-red-600 focus:text-red-600');

    if (item.checked !== undefined) {
      return (
        <ContextMenuCheckboxItem
          key={index}
          checked={item.checked}
          disabled={item.disabled}
          className={className}
          onSelect={() => {
            item.action?.();
            onClose();
          }}
        >
          {content}
        </ContextMenuCheckboxItem>
      );
    }

    return (
      <ShadcnContextMenuItem
        key={index}
        disabled={item.disabled}
        className={className}
        onSelect={() => {
          item.action?.();
          onClose();
        }}
      >
        {content}
      </ShadcnContextMenuItem>
    );
  }), [items, onClose]);

  return (
    <ShadcnContextMenu
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ContextMenuTrigger asChild>
        <div
          ref={triggerRef}
          className="fixed size-px"
          style={{ left: x, top: y }}
          aria-hidden="true"
        />
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-[160px]">
        {renderedItems}
      </ContextMenuContent>
    </ShadcnContextMenu>
  );
};
```

Expected: the old state shape remains usable, while positioning/focus/menu semantics move to Radix.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 4: Manual QA context menus**

Run:

```bash
npm run dev
```

Check:

```text
Right-click editor shows undo/redo/copy/cut/paste/select all.
Right-click inputs in AI config shows copy/cut/paste/select all.
Right-click model items still shows test/delete actions.
Menu closes on outside click, Escape, scroll, and action select.
Menu does not render off-screen near right/bottom edges.
```

- [ ] **Step 5: Commit context menu migration**

Run:

```bash
git add src/components/ui/ContextMenu.tsx
git commit -m "refactor(ui): wrap context menus with shadcn"
```

---

### Task 5: Migrate Toast to sonner

**Files:**
- Modify: `src/App.tsx`
- Modify or delete: `src/components/Toast.tsx`
- Modify imports in: `src/hooks/useExport.ts`, `src/hooks/useFileDrop.ts`, `src/hooks/useContextMenu.tsx`

- [ ] **Step 1: Add a compatibility toast function**

Create a small helper in `src/components/Toast.tsx` so existing `ToastType` users still compile:

```tsx
import { toast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info';

export function showAppToast(message: string, type: ToastType = 'success') {
  if (type === 'error') {
    toast.error(message);
    return;
  }
  if (type === 'info') {
    toast.info(message);
    return;
  }
  toast.success(message);
}
```

Expected: hooks can keep using `ToastType` while rendering moves to sonner.

- [ ] **Step 2: Add the Toaster to App**

Update `src/App.tsx`:

```tsx
import { Toaster } from '@/components/ui/sonner';
import { showAppToast, ToastType } from './components/Toast';
```

Replace local toast state:

```tsx
const showToast = useCallback((message: string, type: ToastType = 'success') => {
  showAppToast(message, type);
}, []);
```

Render once near the app root:

```tsx
<Toaster richColors position="bottom-right" />
```

Expected: remove the old `<Toast ... />` render block from `App.tsx`.

- [ ] **Step 3: Run typecheck and tests**

Run:

```bash
npm run typecheck
npm test
```

Expected: both pass.

- [ ] **Step 4: Manual QA toast flows**

Run:

```bash
npm run dev
```

Check:

```text
Copy action shows success toast.
Export failure shows error toast.
Unsupported file drop shows error toast.
Toasts are readable in light and dark mode.
```

- [ ] **Step 5: Commit toast migration**

Run:

```bash
git add src/App.tsx src/components/Toast.tsx src/components/ui/sonner.tsx package.json pnpm-lock.yaml package-lock.json
git commit -m "refactor(ui): use sonner for toasts"
```

If this repo is using only `pnpm-lock.yaml`, do not add `package-lock.json`.

---

### Task 6: Replace Obvious Separators, Tooltips, and Switches

**Files:**
- Modify: `src/components/SearchPopover.tsx`
- Modify: `src/components/SettingsWindow.tsx`
- Modify: `src/components/AIConfigWindow.tsx`
- Modify: `src/components/AIConfigModal.tsx`
- Modify: `src/components/header/tabs/*.tsx` as needed

- [ ] **Step 1: Replace hand-rolled separators**

Use:

```tsx
import { Separator } from '@/components/ui/separator';
```

Replace visual separator divs:

```tsx
<Separator orientation="vertical" className="h-4" />
```

Expected: no raw `div` separator remains in newly touched UI surfaces.

- [ ] **Step 2: Replace binary toggles where labels already exist**

Use:

```tsx
import { Switch } from '@/components/ui/switch';
```

For settings-style boolean fields:

```tsx
<Switch
  checked={settings.autoSave}
  onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
/>
```

Expected: do not replace compact editor toolbar icon toggles in this task.

- [ ] **Step 3: Wrap icon-only controls with tooltips**

Use:

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
```

Pattern:

```tsx
<TooltipProvider delayDuration={300}>
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" aria-label="关闭">...</button>
    </TooltipTrigger>
    <TooltipContent>关闭</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Expected: only icon-only buttons with unclear labels get tooltips. Do not wrap every text button.

- [ ] **Step 4: Run checks**

Run:

```bash
npm run typecheck
npm test
```

Expected: both pass.

- [ ] **Step 5: Commit polish primitives**

Run:

```bash
git add src/components src/hooks
git commit -m "refactor(ui): use shared shadcn controls"
```

---

### Task 7: Final Verification and Cleanup

**Files:**
- Review: `src/components/ui/`
- Review: `src/index.css`
- Review: `package.json`
- Review: `pnpm-lock.yaml`

- [ ] **Step 1: Search for old duplicated primitives**

Run:

```bash
rg -n "WINDOW_ICON_FONT_FAMILY|WINDOW_ICON_CLASS|animate-menu-in|animate-menu-out|role=\"menu\"|aria-haspopup|document.addEventListener\\('mousedown'" src/components src/hooks
```

Expected: no stale menu positioning code remains outside places intentionally kept custom.

- [ ] **Step 2: Run full frontend checks**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all pass.

- [ ] **Step 3: Run backend checks only if backend files changed**

Run:

```bash
python -m pytest backend/tests
```

Expected: document the known `test_table_structure_preservation` failure if still present. Do not block UI migration on this pre-existing backend test contract mismatch.

- [ ] **Step 4: Manual UI QA matrix**

Run:

```bash
npm run dev
```

Check:

```text
Main window opens in light mode.
Main window opens in dark mode.
Ribbon tabs remain compact and do not gain card-like spacing.
Layout tab selects work.
Home tab selects work.
Settings window selects and toggles work.
AI config window context menus work.
Editor context menu works.
Search popover still fits within the main window.
No overlay appears behind the preview page or window chrome.
```

- [ ] **Step 5: Cleanup generated or accidental files**

Run:

```bash
git status --short
```

Expected: do not stage local reports such as `architecture-review-20260616.html`, generated `dist/`, `build/`, `src-tauri/target/`, or `*.docx`.

- [ ] **Step 6: Final commit**

Run:

```bash
git add src components.json package.json pnpm-lock.yaml
git commit -m "refactor(ui): migrate base controls to shadcn"
```

Expected: commit contains only UI migration files and dependency/config updates.

---

## Self-Review

- Spec coverage: The plan covers shadcn initialization, component installation, Select migration, ContextMenu migration, toast migration, smaller control cleanup, and final verification.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: Existing compatibility exports preserve `Select`, `SelectOption`, `ContextMenu`, `ContextMenuItem`, and `ToastType` for current callers.
- Scope check: Editor replacement, backend converter changes, and state-store replacement are intentionally out of scope.

# UI Typography And Platform Font Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the application chrome typography look more refined on Windows, macOS, and common Linux distributions without changing editor content, preview rendering, or exported Word fonts.

**Architecture:** Treat the UI font system as an app-chrome concern. Add a global platform-aware UI font stack in `src/index.css`, then tune the highest-impact window headings, labels, buttons, and compact form text in small passes. Keep editor and preview typography governed by their existing classes/config so document semantics stay untouched.

**Tech Stack:** React 19, Vite 6, Tailwind CSS v4, Tauri, Vitest, TypeScript, browser visual verification.

---

## File Structure

- Modify: `src/index.css`
  - Owns the global app-chrome font stack, rendering hints, and reusable UI typography classes.
- Modify: `src/components/SettingsWindow.tsx`
  - Applies refined title, sidebar, label, and selected-option typography to the settings window.
- Modify: `src/components/AIConfigWindow.tsx`
  - Applies the same title, sidebar, label, and form typography to the AI configuration window.
- Modify: `src/components/AIConfigModal.tsx`
  - Removes overly tiny/heavy text from the compact AI configuration modal.
- Optional modify after inspection: `src/components/header/WindowBar.tsx`
  - Only if the top window title still looks too light or too cramped after the global stack lands.
- Do not modify: `src/components/Editor.tsx`
  - The editor intentionally uses `font-mono text-[15px] leading-8`.
- Do not modify: `src/components/Preview.tsx`
  - The preview intentionally uses document config via `buildFontFamily(...)`.
- Do not modify: `src/config/defaultConfig.ts`
  - Exported Word font choices stay separate from app UI font choices.

Before implementation, run:

```powershell
git status --short --branch
```

Expected: note any existing modified files. Do not overwrite user changes. If `SettingsWindow.tsx`, `AIConfigWindow.tsx`, or `AIConfigModal.tsx` already contain user edits, read them first and apply typography changes on top of the current working tree.

---

### Task 1: Add The Cross-Platform UI Font Baseline

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add CSS variables for the app UI font stack**

Insert this block after the existing `@variant dark (&:where(.dark, .dark *));` line:

```css
:root {
  --font-ui:
    -apple-system,
    BlinkMacSystemFont,
    "SF Pro Text",
    "Segoe UI Variable Text",
    "Segoe UI",
    "PingFang SC",
    "Microsoft YaHei UI",
    "Microsoft YaHei",
    "Noto Sans CJK SC",
    "Noto Sans SC",
    "Source Han Sans SC",
    "WenQuanYi Micro Hei",
    sans-serif;
}
```

Rationale:
- macOS resolves Latin UI text through SF and Chinese UI text through PingFang.
- Windows resolves through Segoe UI / Microsoft YaHei UI.
- Linux has fallbacks for Noto CJK, Source Han Sans, and WenQuanYi.
- No bundled font is introduced in this task, so package size stays unchanged.

- [ ] **Step 2: Apply the font stack and rendering hints to the app body**

Change the existing `body` rule from:

```css
body {
  background-color: #f9fafb;
  color: #111827;
  -webkit-font-smoothing: antialiased;
}
```

to:

```css
body {
  background-color: #f9fafb;
  color: #111827;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 400;
  font-kerning: normal;
  font-optical-sizing: auto;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 3: Make form controls inherit the UI font**

Add this block after the `body` and `.dark body` rules:

```css
button,
input,
textarea,
select {
  font: inherit;
}
```

Expected behavior:
- Native controls stop falling back to browser defaults.
- `Editor.tsx` still uses its explicit `font-mono` class because Tailwind utility classes override inherited body font.
- `Preview.tsx` still uses inline `fontFamily` from document config.

- [ ] **Step 4: Run a fast type/build check**

Run:

```powershell
pnpm run typecheck
pnpm run build
```

Expected:
- `tsc --noEmit` exits successfully.
- `vite build` exits successfully.

- [ ] **Step 5: Commit Task 1**

Only stage the CSS file:

```powershell
git add src/index.css
git commit -m "style(ui): add platform-aware font stack"
```

---

### Task 2: Add Reusable Refined Typography Classes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add focused app-chrome typography classes**

Add this block before the `@theme` block in `src/index.css`:

```css
/* App chrome typography */
.ui-page-title {
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  letter-spacing: 0;
  color: #111827;
}

.dark .ui-page-title {
  color: #f3f4f6;
}

.ui-section-title {
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  letter-spacing: 0;
  color: #111827;
}

.dark .ui-section-title {
  color: #f3f4f6;
}

.ui-sidebar-kicker {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #6b7280;
}

.dark .ui-sidebar-kicker {
  color: #9ca3af;
}

.ui-field-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0;
  color: #374151;
}

.dark .ui-field-label {
  color: #d1d5db;
}

.ui-caption {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  letter-spacing: 0;
  color: #6b7280;
}

.dark .ui-caption {
  color: #9ca3af;
}

.ui-compact-text {
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  letter-spacing: 0;
}
```

Rationale:
- `font-bold` is avoided for app chrome headings.
- Small Chinese labels avoid `text-xs font-semibold`.
- Letter spacing stays at `0` except for the all-caps sidebar kicker, where a small positive value is intentional.

- [ ] **Step 2: Run CSS/build check**

Run:

```powershell
pnpm run build
```

Expected: Vite build succeeds and Tailwind does not reject the new CSS.

- [ ] **Step 3: Commit Task 2**

```powershell
git add src/index.css
git commit -m "style(ui): add typography primitives"
```

---

### Task 3: Refine Settings Window Typography

**Files:**
- Modify: `src/components/SettingsWindow.tsx`

- [ ] **Step 1: Replace the sidebar kicker typography**

Change:

```tsx
<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">设置</h2>
```

to:

```tsx
<h2 className="ui-sidebar-kicker">设置</h2>
```

- [ ] **Step 2: Replace the page title typography**

Change:

```tsx
<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{activeSectionLabel}</h3>
```

to:

```tsx
<h3 className="ui-page-title">{activeSectionLabel}</h3>
```

- [ ] **Step 3: Replace settings field labels**

Replace each settings label shaped like this:

```tsx
<label className="text-[13px] font-medium text-gray-700 dark:text-gray-300">主题模式</label>
```

with:

```tsx
<label className="ui-field-label">主题模式</label>
```

Apply the same replacement to these labels in `SettingsWindow.tsx`:
- `主题模式`
- `默认视图模式`
- `默认中文字体`
- `默认英文字体`
- `默认字号`

- [ ] **Step 4: Keep selected segmented controls medium, not bold**

Confirm selected option buttons continue to use `font-medium`, not `font-semibold` or `font-bold`:

```tsx
? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400 font-medium shadow-sm'
```

Expected: no change if this exact pattern is already present.

- [ ] **Step 5: Run checks**

Run:

```powershell
pnpm run typecheck
pnpm run build
```

Expected: both pass.

- [ ] **Step 6: Commit Task 3**

```powershell
git add src/components/SettingsWindow.tsx
git commit -m "style(settings): refine typography weights"
```

---

### Task 4: Refine AI Configuration Window Typography

**Files:**
- Modify: `src/components/AIConfigWindow.tsx`

- [ ] **Step 1: Replace the sidebar kicker typography**

Change:

```tsx
<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">AI 平台</h2>
```

to:

```tsx
<h2 className="ui-sidebar-kicker">AI 平台</h2>
```

- [ ] **Step 2: Replace the provider page title typography**

Change:

```tsx
<h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{selectedProvider.name}</h3>
```

to:

```tsx
<h3 className="ui-page-title">{selectedProvider.name}</h3>
```

- [ ] **Step 3: Replace section headings**

Change:

```tsx
<h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">API 配置</h4>
```

to:

```tsx
<h4 className="ui-section-title">API 配置</h4>
```

Change:

```tsx
<h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">模型管理</h4>
```

to:

```tsx
<h4 className="ui-section-title">模型管理</h4>
```

- [ ] **Step 4: Replace AI config field labels**

Change labels like:

```tsx
<Label className="text-xs font-medium text-gray-700 dark:text-gray-300">API Key</Label>
```

to:

```tsx
<Label className="ui-field-label">API Key</Label>
```

Apply the same pattern to:
- `API Key`
- `Base URL`
- `模型 ID`
- `显示名称`

For required labels, keep the red asterisk inside:

```tsx
<Label className="ui-field-label">模型 ID <span className="text-red-500">*</span></Label>
```

- [ ] **Step 5: Run checks**

Run:

```powershell
pnpm run typecheck
pnpm run build
```

Expected: both pass.

- [ ] **Step 6: Commit Task 4**

```powershell
git add src/components/AIConfigWindow.tsx
git commit -m "style(ai-config): refine window typography"
```

---

### Task 5: Refine Compact AI Modal Typography

**Files:**
- Modify: `src/components/AIConfigModal.tsx`

- [ ] **Step 1: Replace the modal header text**

Change:

```tsx
<h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 pointer-events-none">AI 平台管理</h2>
```

to:

```tsx
<h2 className="text-[14px] font-medium leading-5 text-gray-700 dark:text-gray-200 pointer-events-none">AI 平台管理</h2>
```

- [ ] **Step 2: Replace compact dialog titles**

For each compact dialog title such as:

```tsx
<h3 className="text-sm font-semibold mb-4 text-gray-800 dark:text-gray-100">添加自定义平台</h3>
```

change to:

```tsx
<h3 className="text-[14px] font-medium leading-5 mb-4 text-gray-800 dark:text-gray-100">添加自定义平台</h3>
```

Apply this to:
- `添加自定义平台`
- `添加模型`
- `编辑模型`

- [ ] **Step 3: Replace raw compact input text size**

Change raw input class fragments from:

```tsx
text-xs
```

to:

```tsx
text-[13px]
```

Apply only to raw `<input>` elements inside the compact modal dialogs. Do not change icon-only buttons or hidden utility text.

- [ ] **Step 4: Replace compact modal button text size**

Change dialog action button class fragments from:

```tsx
px-3 py-1.5 text-xs
```

to:

```tsx
px-3 py-1.5 text-[13px]
```

Apply to the `取消` and `确定` buttons inside compact modal dialogs.

- [ ] **Step 5: Run checks**

Run:

```powershell
pnpm run typecheck
pnpm run build
```

Expected: both pass.

- [ ] **Step 6: Commit Task 5**

```powershell
git add src/components/AIConfigModal.tsx
git commit -m "style(ai-config): refine compact modal typography"
```

---

### Task 6: Visual Verification On Current Platform

**Files:**
- No code changes unless screenshots reveal a regression.

- [ ] **Step 1: Start the dev server**

Run:

```powershell
pnpm run dev
```

Expected:

```text
Local:   http://localhost:3000/
```

- [ ] **Step 2: Verify computed font stack**

Open `http://localhost:3000/` and run this in DevTools:

```js
getComputedStyle(document.body).fontFamily
```

Expected: the value begins with the app UI stack, including `-apple-system`, `BlinkMacSystemFont`, `"SF Pro Text"`, and `"Segoe UI Variable Text"`.

- [ ] **Step 3: Capture the main editor UI**

Open:

```text
http://localhost:3000/
```

Check:
- Header and status bar text are readable, not over-bold.
- Editor text still appears monospace.
- Preview text still follows document config, not the app UI class.

- [ ] **Step 4: Capture the settings window**

Open:

```text
http://localhost:3000/?window=settings
```

Check:
- Left navigation labels no longer look cramped or overly heavy.
- The page title is refined but still clearly dominant.
- Form labels are readable at small size.

- [ ] **Step 5: Capture the AI config window**

Open:

```text
http://localhost:3000/?window=config
```

Check:
- Provider title is not `font-bold`.
- Section titles and labels match settings window hierarchy.
- Add/edit dialog text does not look tiny or harsh.

- [ ] **Step 6: Run final validation**

Stop the dev server, then run:

```powershell
pnpm test
pnpm run typecheck
pnpm run build
```

Expected:
- All Vitest tests pass.
- Typecheck passes.
- Build passes.

- [ ] **Step 7: Commit visual verification notes if screenshots or notes are added**

If no screenshot files or notes are intentionally added, do not commit anything for this task.

---

### Task 7: Linux Font Fallback Decision Check

**Files:**
- No immediate code changes.

- [ ] **Step 1: Test the Linux fallback stack when a Linux environment is available**

On Ubuntu, Fedora, Debian, Arch, or the target Linux distribution, run the app and inspect:

```js
getComputedStyle(document.body).fontFamily
```

Expected acceptable CJK fallback names include at least one of:
- `Noto Sans CJK SC`
- `Noto Sans SC`
- `Source Han Sans SC`
- `WenQuanYi Micro Hei`

- [ ] **Step 2: Decide whether bundled fonts are needed**

Use this rule:

```text
If Linux screenshots look refined and the computed font stack resolves to an acceptable CJK font, do not bundle fonts.
If Linux screenshots show rough fallback glyphs, missing Chinese glyphs, or inconsistent weight rendering, create a separate follow-up plan to bundle a subset or variable build of Noto Sans SC for Linux app chrome only.
```

This task intentionally does not add bundled fonts because:
- macOS and Windows should keep native UI font feel.
- Bundling full CJK fonts can noticeably increase package size.
- Linux fallback quality should be measured before adding assets.

---

## Self-Review

- Spec coverage: The plan covers global font stack, macOS/Windows/Linux fallback behavior, lighter UI weights, compact modal text, and visual validation.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: CSS class names defined in Task 2 are the same names used in Tasks 3 and 4.
- Scope control: Editor, preview, and Word export fonts are explicitly excluded from implementation.

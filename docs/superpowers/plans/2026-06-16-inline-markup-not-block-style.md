# Inline Markup Not Block Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep underline and strikethrough as inline Markdown semantics only, not block-level style settings for body/headings/code/quote.

**Architecture:** Remove `underline` and `strike` from the document style configuration path. The frontend style editor and Home tab should only control block style properties such as font size, color, bold, italic, spacing, alignment, and indentation. The backend should apply underline/strikethrough only from parsed inline segments produced by `~~text~~` and `<u>text</u>`.

**Tech Stack:** React 19, TypeScript, Vite, Python 3.11, `python-docx`, pytest, Vitest.

---

## Behaviour Contract

- `styles.body`, `styles.h1`, `styles.h2`, `styles.h3`, `styles.code`, and `styles.quote` must not contain `underline` or `strike`.
- Home tab must not show global underline or strikethrough buttons for the active block style.
- Backend `apply_run_fmt()` must not read `underline` or `strike` from `style_config`.
- Backend `add_formatted_runs()` must still apply:
  - `segment["underline"]` -> `run.underline = True`
  - `segment["strike"]` -> `run.font.strike = True`
- Links continue to be underlined through hyperlink rendering.
- Existing bold and italic block style controls remain unchanged, even though they are also inline Markdown concepts, because they currently function as intentional typography defaults for headings/body/code/quote.

## File Structure

- Modify: `src/interfaces/Config.ts`
  - Remove `underline?: boolean` and `strike?: boolean`.
- Modify: `src/components/header/tabs/HomeTab.tsx`
  - Remove underline and strikethrough buttons from the block-style toolbar.
- Modify: `src/components/StyleEditor.tsx`
  - Ensure no underline/strikethrough controls exist or are added.
- Modify: `backend/styling.py`
  - Remove style-config based underline/strike application.
- Modify: `backend/tests/test_inline_formatting_property.py`
  - Add a regression test proving block config cannot globally underline/strike unmarked text.
- Modify: `src/services/pythonBackend.test.ts` if the generated config strategy includes `underline` or `strike`.
- Optional modify: `README.md`
  - Document inline syntax support if user-facing docs should mention it.

---

### Task 1: Remove Underline And Strike From Frontend Style Types

**Files:**
- Modify: `src/interfaces/Config.ts`
- Modify: `src/services/pythonBackend.test.ts` if needed

- [ ] **Step 1: Update `DocumentStyle`**

In `src/interfaces/Config.ts`, remove these fields:

```ts
underline?: boolean;
strike?: boolean;
```

Expected interface:

```ts
export interface DocumentStyle {
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  lineSpacing: number | string;
  spaceBefore: number;
  spaceAfter: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  firstLineIndent: number;
  fontFamily?: string;
  backgroundColor?: string;
}
```

- [ ] **Step 2: Search for TypeScript config generators**

Run:

```bash
rg -n "underline|strike" src/interfaces src/config src/services src/components src/hooks
```

Expected: matches should be limited to Markdown rendering internals, `docxGenerator.ts` delete-node support, or shadcn CSS classes. No `DocumentStyle` config object should include `underline` or `strike`.

- [ ] **Step 3: Remove test generator fields if present**

If `src/services/pythonBackend.test.ts` includes style arbitraries like this:

```ts
underline: fc.boolean(),
strike: fc.boolean(),
```

delete them. Expected style generator keeps only block-style fields:

```ts
const documentStyleArb = fc.record({
  fontSize: fc.integer({ min: 8, max: 72 }),
  color: hexColorArb,
  bold: fc.boolean(),
  italic: fc.boolean(),
  lineSpacing: fc.oneof(fc.float({ min: 1, max: 3 }), fc.string()),
  spaceBefore: fc.integer({ min: 0, max: 72 }),
  spaceAfter: fc.integer({ min: 0, max: 72 }),
  alignment: fc.constantFrom('left', 'center', 'right', 'justify'),
  firstLineIndent: fc.integer({ min: 0, max: 4 }),
});
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: TypeScript fails if any UI still tries to pass `underline` or `strike` into a block style. Use those errors to find remaining call sites.

- [ ] **Step 5: Commit type cleanup**

Run:

```bash
git add src/interfaces/Config.ts src/services/pythonBackend.test.ts
git commit -m "refactor(config): keep underline and strike out of block styles"
```

Only include `src/services/pythonBackend.test.ts` if it changed.

---

### Task 2: Remove Global Underline And Strike Buttons From Home Tab

**Files:**
- Modify: `src/components/header/tabs/HomeTab.tsx`

- [ ] **Step 1: Delete underline and strike toolbar buttons**

Remove blocks equivalent to:

```tsx
<button
  onClick={() => updateStyle({ underline: !currentStyle.underline })}
  className={`... ${currentStyle.underline ? '...' : '...'}`}
  title="下划线"
>
  ...
</button>

<button
  onClick={() => updateStyle({ strike: !currentStyle.strike })}
  className={`... ${currentStyle.strike ? '...' : '...'}`}
  title="删除线"
>
  ...
</button>
```

Expected: Home tab typography controls still include bold and italic, but no underline or strikethrough.

- [ ] **Step 2: Remove now-unused icon imports**

If `HomeTab.tsx` imports underline or strikethrough icons, remove them.

Example:

```tsx
import { BoldLine, ItalicLine } from '@mingcute/react';
```

Expected: no unused import warnings or TypeScript errors.

- [ ] **Step 3: Run focused search**

Run:

```bash
rg -n "currentStyle\\.underline|currentStyle\\.strike|updateStyle\\(\\{ underline|updateStyle\\(\\{ strike|title=\"下划线\"|title=\"删除线\"" src/components/header/tabs/HomeTab.tsx
```

Expected: no matches.

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: pass after all block-style underline/strike UI references are removed.

- [ ] **Step 5: Commit Home tab cleanup**

Run:

```bash
git add src/components/header/tabs/HomeTab.tsx
git commit -m "refactor(ui): remove global underline and strike controls"
```

---

### Task 3: Ensure Style Editor Does Not Expose Inline-Only Controls

**Files:**
- Modify: `src/components/StyleEditor.tsx`

- [ ] **Step 1: Search StyleEditor**

Run:

```bash
rg -n "underline|strike|下划线|删除线" src/components/StyleEditor.tsx
```

Expected: no matches. If matches exist, remove those controls.

- [ ] **Step 2: Keep bold and italic controls**

Do not remove these existing block-level typography default controls:

```tsx
checked={value.bold}
onChange={(e) => set({ bold: e.target.checked })}

checked={value.italic}
onChange={(e) => set({ italic: e.target.checked })}
```

Expected: style editor still supports typography defaults that are currently part of existing user-facing block style behaviour.

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: pass.

- [ ] **Step 4: Commit if changed**

Run:

```bash
git add src/components/StyleEditor.tsx
git commit -m "refactor(ui): keep style editor block scoped"
```

Skip the commit if `StyleEditor.tsx` did not change.

---

### Task 4: Remove Backend Block-Style Underline And Strike

**Files:**
- Modify: `backend/styling.py`

- [ ] **Step 1: Remove style-config underline and strike handling**

In `apply_run_fmt()`, delete:

```python
if style_config.get("underline") is not None:
    run.underline = bool(style_config.get("underline"))
if style_config.get("strike") is not None:
    run.font.strike = bool(style_config.get("strike"))
```

Expected: backend block styles can no longer force underline or strikethrough on every run.

- [ ] **Step 2: Keep inline segment handling**

Do not change `backend/elements.py` lines equivalent to:

```python
if segment.get('underline'):
    run.underline = True
if segment.get('strike'):
    run.font.strike = True
```

Expected: `~~text~~` and `<u>text</u>` still work.

- [ ] **Step 3: Run inline backend tests**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
```

Expected: underline/strikethrough tests still pass.

- [ ] **Step 4: Commit backend style cleanup**

Run:

```bash
git add backend/styling.py backend/elements.py
git commit -m "refactor(backend): make underline and strike inline only"
```

Only include `backend/elements.py` if it changed during this task.

---

### Task 5: Add Regression Test Against Global Underline And Strike

**Files:**
- Modify: `backend/tests/test_inline_formatting_property.py`

- [ ] **Step 1: Add test for ignored block style underline/strike**

Append this test:

```python
def test_block_style_does_not_globally_apply_underline_or_strike(tmp_path):
    input_path = tmp_path / "input.md"
    output_path = tmp_path / "output.docx"
    input_path.write_text(
        "Plain text plus ~~deleted~~ and <u>underlined</u>.",
        encoding="utf-8",
    )

    class Args:
        config = None
        config_file = None

    conf = load_config(Args())
    conf["styles"]["body"]["underline"] = True
    conf["styles"]["body"]["strike"] = True

    convert(str(input_path), str(output_path), conf)
    doc = Document(str(output_path))

    runs = [run for paragraph in doc.paragraphs for run in paragraph.runs]

    plain = next(run for run in runs if run.text.startswith("Plain text"))
    deleted = next(run for run in runs if run.text == "deleted")
    underlined = next(run for run in runs if run.text == "underlined")

    assert plain.underline is not True
    assert plain.font.strike is not True
    assert deleted.font.strike is True
    assert underlined.underline is True
```

Expected: if `apply_run_fmt()` still reads `style_config["underline"]` or `style_config["strike"]`, this test fails.

- [ ] **Step 2: Run targeted test**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py::test_block_style_does_not_globally_apply_underline_or_strike -q
```

Expected: pass.

- [ ] **Step 3: Run full inline formatting test file**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
```

Expected: pass.

- [ ] **Step 4: Commit regression test**

Run:

```bash
git add backend/tests/test_inline_formatting_property.py
git commit -m "test(backend): prevent global underline and strike styles"
```

---

### Task 6: Documentation And Verification

**Files:**
- Optional modify: `README.md`
- Review: `src/interfaces/Config.ts`
- Review: `src/components/header/tabs/HomeTab.tsx`
- Review: `backend/styling.py`
- Review: `backend/parser.py`
- Review: `backend/elements.py`

- [ ] **Step 1: Document inline syntax if README mentions supported Markdown**

If README has a feature list for supported Markdown syntax, add:

```markdown
- 支持行内删除线 `~~text~~` 与下划线 `<u>text</u>`，它们只对标记文本生效，不属于全局样式设置。
```

Expected: README does not imply underline/strike are configurable block styles.

- [ ] **Step 2: Search final codebase**

Run:

```bash
rg -n "underline|strike|下划线|删除线" src backend README.md
```

Expected acceptable matches:

```text
backend/parser.py inline segment flags
backend/elements.py inline segment application
backend/tests/test_inline_formatting_property.py tests
src/services/docxGenerator.ts legacy frontend docx delete-node support
src/components/ui/button.tsx shadcn underline CSS class
README.md inline syntax docs
```

Unexpected matches:

```text
src/interfaces/Config.ts
src/config/defaultConfig.ts
src/components/header/tabs/HomeTab.tsx currentStyle.underline/currentStyle.strike
backend/styling.py style_config.get("underline")/style_config.get("strike")
```

- [ ] **Step 3: Run frontend checks**

Run:

```bash
pnpm run typecheck
pnpm test
```

Expected: both pass.

- [ ] **Step 4: Run backend checks**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
python -m pytest backend/tests -q
```

Expected: inline formatting tests pass. If full backend tests still fail at `test_table_structure_preservation`, record it as pre-existing table parser/test contract mismatch.

- [ ] **Step 5: Rebuild backend binary if backend files changed**

Run:

```bash
pnpm run build:backend
```

Expected: `src-tauri/binaries/md2word-x86_64-pc-windows-msvc.exe` updates.

- [ ] **Step 6: Manual UI QA**

Run:

```bash
pnpm run dev
```

Check:

```text
Home tab no longer shows underline or delete buttons for block styles.
Bold and italic buttons still work for active block style.
Preview still renders regular Markdown as before.
Settings and AI windows still open.
```

- [ ] **Step 7: Manual conversion QA**

Run a conversion with:

```markdown
正文不会全局下划线。
这里有 ~~删除线~~ 和 <u>下划线</u>。
```

Expected:

```text
Only 删除线 has strikethrough.
Only 下划线 has underline.
Unmarked text has neither underline nor strikethrough.
```

- [ ] **Step 8: Final commit**

Run:

```bash
git add src/interfaces/Config.ts src/components/header/tabs/HomeTab.tsx src/components/StyleEditor.tsx backend/styling.py backend/tests/test_inline_formatting_property.py README.md src-tauri/binaries/md2word-x86_64-pc-windows-msvc.exe
git commit -m "fix: keep underline and strikethrough inline scoped"
```

Only add files that actually changed.

---

## Self-Review

- Spec coverage: The plan removes underline/strike from frontend block config, Home tab controls, backend block-style application, and adds a regression test.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: The inline parser still uses `underline` and `strike` segment flags; `DocumentStyle` no longer does.
- Scope check: The plan does not change the syntax decision for `~~text~~` and `<u>text</u>`, and does not redesign bold/italic block-style behaviour.

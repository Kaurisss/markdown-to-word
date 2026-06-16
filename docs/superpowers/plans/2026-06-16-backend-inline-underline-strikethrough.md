# Backend Inline Underline And Strikethrough Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend DOCX conversion support for inline strikethrough and underline formatting.

**Architecture:** Extend the backend inline formatting interface so parsed segments can carry `underline` and `strike` flags alongside existing `bold`, `italic`, `code`, and `link` fields. Keep the change localized to the parser and document element builder, then cover the new behavior with backend property/unit tests.

**Tech Stack:** Python 3.11, `python-docx`, pytest, hypothesis.

---

## Syntax Decision

- Strikethrough: support GitHub Flavored Markdown syntax `~~text~~`.
- Underline: support HTML-style syntax `<u>text</u>`.
- Do not treat `_text_` as underline, because Markdown uses underscores for emphasis and that would create ambiguous parsing.

## File Structure

- Modify: `backend/parser.py`
  - Extend `parse_inline_formatting()` to return `underline` and `strike` booleans on every segment.
  - Add regex branches for `~~...~~` and `<u>...</u>`.
- Modify: `backend/elements.py`
  - Apply `run.underline = True` for underline segments.
  - Apply `run.font.strike = True` or `run.strike = True` for strike segments.
- Modify: `backend/tests/test_inline_formatting_property.py`
  - Add tests for parser flags.
  - Add conversion smoke tests that inspect generated `.docx` run formatting.
- Optional modify: `backend/__init__.py`
  - No expected change unless exported names move.

---

### Task 1: Add Parser Tests For New Inline Flags

**Files:**
- Modify: `backend/tests/test_inline_formatting_property.py`

- [ ] **Step 1: Add a test for strikethrough parsing**

Append this test near the existing inline formatting parser tests:

```python
def test_parse_strikethrough_segments():
    segments = parse_inline_formatting("before ~~deleted~~ after")

    strike_segments = [segment for segment in segments if segment.get("strike")]

    assert len(strike_segments) == 1
    assert strike_segments[0]["text"] == "deleted"
    assert strike_segments[0]["bold"] is False
    assert strike_segments[0]["italic"] is False
    assert strike_segments[0]["code"] is False
    assert strike_segments[0]["underline"] is False
    assert strike_segments[0]["link"] is None
```

- [ ] **Step 2: Add a test for underline parsing**

Append this test near the strikethrough test:

```python
def test_parse_underline_segments():
    segments = parse_inline_formatting("before <u>underlined</u> after")

    underline_segments = [segment for segment in segments if segment.get("underline")]

    assert len(underline_segments) == 1
    assert underline_segments[0]["text"] == "underlined"
    assert underline_segments[0]["bold"] is False
    assert underline_segments[0]["italic"] is False
    assert underline_segments[0]["code"] is False
    assert underline_segments[0]["strike"] is False
    assert underline_segments[0]["link"] is None
```

- [ ] **Step 3: Run tests and verify they fail**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
```

Expected: the two new tests fail because `parse_inline_formatting()` does not yet emit `underline` or `strike`.

- [ ] **Step 4: Commit failing tests if using TDD checkpoints**

Run:

```bash
git add backend/tests/test_inline_formatting_property.py
git commit -m "test(backend): cover underline and strikethrough parsing"
```

---

### Task 2: Extend Inline Parser Segment Shape

**Files:**
- Modify: `backend/parser.py`

- [ ] **Step 1: Add a helper for segment creation**

Inside `backend/parser.py`, above `parse_inline_formatting()`, add:

```python
def _inline_segment(
    text: str,
    *,
    bold: bool = False,
    italic: bool = False,
    code: bool = False,
    underline: bool = False,
    strike: bool = False,
    link: str | None = None,
) -> Dict[str, Any]:
    return {
        "text": text,
        "bold": bold,
        "italic": italic,
        "code": code,
        "underline": underline,
        "strike": strike,
        "link": link,
    }
```

- [ ] **Step 2: Replace repeated segment dictionaries**

Replace each existing inline segment dictionary with `_inline_segment(...)`.

Examples:

```python
segments.append(_inline_segment(plain_text))
segments.append(_inline_segment(match.group(2), bold=True))
segments.append(_inline_segment(match.group(4), italic=True))
segments.append(_inline_segment(match.group(6), code=True))
segments.append(_inline_segment(match.group(8), link=match.group(9)))
segments.append(_inline_segment(text))
```

Expected: existing tests still pass after this mechanical change.

- [ ] **Step 3: Extend the combined regex**

Change the pattern to include strikethrough and underline before italic:

```python
pattern = (
    r"(~~(.+?)~~)"
    r"|(<u>(.+?)</u>)"
    r"|(\*\*(.+?)\*\*)"
    r"|(?<!\*)(\*([^*]+?)\*)(?!\*)"
    r"|(`([^`]+)`)"
    r"|(\[([^\]]+)\]\(([^)]+)\))"
)
```

Expected: `~~...~~` is matched before the italic branch so `*` parsing does not interfere.

- [ ] **Step 4: Update match branches**

Replace the branch block with:

```python
if match.group(1):  # Strikethrough: ~~text~~
    segments.append(_inline_segment(match.group(2), strike=True))
elif match.group(3):  # Underline: <u>text</u>
    segments.append(_inline_segment(match.group(4), underline=True))
elif match.group(5):  # Bold: **text**
    segments.append(_inline_segment(match.group(6), bold=True))
elif match.group(7):  # Italic: *text*
    segments.append(_inline_segment(match.group(8), italic=True))
elif match.group(9):  # Code: `text`
    segments.append(_inline_segment(match.group(10), code=True))
elif match.group(11):  # Link: [text](url)
    segments.append(_inline_segment(match.group(12), link=match.group(13)))
```

- [ ] **Step 5: Run parser tests**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
```

Expected: all inline parser tests pass.

- [ ] **Step 6: Commit parser implementation**

Run:

```bash
git add backend/parser.py backend/tests/test_inline_formatting_property.py
git commit -m "feat(backend): parse underline and strikethrough inline marks"
```

---

### Task 3: Apply Underline And Strike To Word Runs

**Files:**
- Modify: `backend/elements.py`

- [ ] **Step 1: Apply new segment flags**

In `add_formatted_runs()`, after bold and italic handling, add:

```python
if segment.get("underline"):
    run.underline = True
if segment.get("strike"):
    run.font.strike = True
```

Expected: existing segments without these keys still work if any old caller constructs segment dictionaries manually.

- [ ] **Step 2: Keep link underline behavior unchanged**

Do not change `add_hyperlink()`. Links should still be blue and underlined even when they do not use `<u>...</u>`.

- [ ] **Step 3: Run inline tests**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
```

Expected: parser tests pass. DOCX run behavior is not fully verified until Task 4.

- [ ] **Step 4: Commit run formatting implementation**

Run:

```bash
git add backend/elements.py
git commit -m "feat(backend): render underline and strikethrough runs"
```

---

### Task 4: Add DOCX Conversion Smoke Tests

**Files:**
- Modify: `backend/tests/test_inline_formatting_property.py`

- [ ] **Step 1: Add helper to collect runs**

Add this helper near existing conversion tests:

```python
from docx import Document


def _convert_markdown_to_docx(tmp_path, markdown: str):
    input_path = tmp_path / "input.md"
    output_path = tmp_path / "output.docx"
    input_path.write_text(markdown, encoding="utf-8")

    class Args:
        config = None
        config_file = None

    conf = load_config(Args())
    convert(str(input_path), str(output_path), conf)
    return Document(str(output_path))
```

- [ ] **Step 2: Add strikethrough DOCX test**

Append:

```python
def test_convert_strikethrough_to_docx_run(tmp_path):
    doc = _convert_markdown_to_docx(tmp_path, "This is ~~deleted~~ text")

    runs = [run for paragraph in doc.paragraphs for run in paragraph.runs]
    deleted = next(run for run in runs if run.text == "deleted")

    assert deleted.font.strike is True
```

- [ ] **Step 3: Add underline DOCX test**

Append:

```python
def test_convert_underline_to_docx_run(tmp_path):
    doc = _convert_markdown_to_docx(tmp_path, "This is <u>underlined</u> text")

    runs = [run for paragraph in doc.paragraphs for run in paragraph.runs]
    underlined = next(run for run in runs if run.text == "underlined")

    assert underlined.underline is True
```

- [ ] **Step 4: Run targeted tests**

Run:

```bash
python -m pytest backend/tests/test_inline_formatting_property.py -q
```

Expected: all inline formatting tests pass.

- [ ] **Step 5: Commit conversion tests**

Run:

```bash
git add backend/tests/test_inline_formatting_property.py
git commit -m "test(backend): verify underline and strikethrough docx output"
```

---

### Task 5: Run Full Verification

**Files:**
- Review: `backend/parser.py`
- Review: `backend/elements.py`
- Review: `backend/tests/test_inline_formatting_property.py`

- [ ] **Step 1: Run backend tests**

Run:

```bash
python -m pytest backend/tests
```

Expected: inline formatting tests pass. If `backend/tests/test_table_property.py::test_table_structure_preservation` still fails because it expects `parse_gfm_table()` to return a 2D array instead of `{"rows": ..., "alignments": ...}`, record it as pre-existing and unrelated.

- [ ] **Step 2: Run frontend checks**

Run:

```bash
npm run typecheck
npm test
```

Expected: both pass.

- [ ] **Step 3: Manual conversion check**

Create a temporary markdown file outside the repo or under an ignored temp path:

```markdown
正常 **加粗** *斜体* `代码` [链接](https://example.com)

这是 ~~删除线~~ 和 <u>下划线</u>。
```

Run:

```bash
python backend/backend.py -i path/to/input.md -o path/to/output.docx
```

Expected: Word output shows deleted text with strikethrough and underlined text with underline.

- [ ] **Step 4: If shipping desktop app, rebuild backend binary**

Because backend code changed, run:

```bash
npm run build:backend
```

Expected: `src-tauri/binaries/md2word-x86_64-pc-windows-msvc.exe` is updated.

- [ ] **Step 5: Final commit**

Run:

```bash
git add backend/parser.py backend/elements.py backend/tests/test_inline_formatting_property.py src-tauri/binaries/md2word-x86_64-pc-windows-msvc.exe
git commit -m "feat(backend): support underline and strikethrough"
```

If the backend binary was not rebuilt, omit it from `git add` and mention that explicitly in the final handoff.

---

## Self-Review

- Spec coverage: The plan covers parser support, DOCX run formatting, tests, and backend binary rebuild requirements.
- Placeholder scan: No TBD/TODO placeholders remain.
- Type consistency: Segment shape consistently uses `underline` and `strike`.
- Scope check: The plan does not change frontend preview rendering. Preview support can be a separate plan if the UI preview must match backend output.

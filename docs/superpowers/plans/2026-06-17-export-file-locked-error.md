# Export File Locked Error Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Word export fails because the target `.docx` is already open or otherwise locked, show a precise user-facing message instead of the misleading generic export/UTF-8 error.

**Architecture:** Classify output-write failures in the Python backend before they are collapsed into generic DOCX generation errors. Return a permission-style exit code and stable message for locked target files, then map that detail in the frontend to a clear Chinese toast. Keep raw sidecar output decoding as an optional guard only if the shell still masks backend stderr.

**Tech Stack:** Python backend, python-docx, pytest, Tauri v2 shell sidecar, React/TypeScript, Vitest.

---

## Problem Summary

Observed error:

```text
导出失败: 导出过程中发生错误
invalid utf-8 sequence of 1 bytes from index 76
```

User-confirmed root cause:

The selected output `.docx` file was already open/occupied by another application, so `doc.save(output_path)` failed. The app surfaced an unrelated UTF-8/generic export error instead of telling the user to close the file or choose another path.

The fix should make the real file-lock/permission cause visible. It should not change Markdown parsing or document generation.

---

## File Structure

- Modify `backend/converter.py`
  - Add a small classifier for output-save exceptions.
  - Treat Windows file-lock/permission-denied save failures as `PermissionError_`.
  - Preserve generic `DocxGenerationError` for real generation failures.
- Modify or create backend tests under `backend/tests/`
  - Add a focused test that simulates a locked output file save failure.
- Modify `src/services/pythonBackend.ts`
  - Improve permission-error mapping when backend stderr indicates an output file is locked or unwritable.
  - Optionally tolerate raw sidecar output decoding if needed, but do not present UTF-8 as the primary diagnosis.
- Modify `src/services/pythonBackend.test.ts`
  - Add frontend parsing tests for file-locked stderr.
- Rebuild `src-tauri/binaries/md2word*` after backend changes pass.

---

### Task 1: Add Backend Regression Test for Locked Output

**Files:**
- Create: `backend/tests/test_output_file_lock.py`

- [ ] **Step 1: Create a test that simulates `doc.save()` failing with Windows file-lock text**

Create `backend/tests/test_output_file_lock.py`:

```python
from pathlib import Path

import pytest

import backend.converter as converter
from backend.errors import PermissionError_


class FakeDocument:
    def save(self, output_path):
        raise PermissionError(13, "Permission denied", str(output_path))


def minimal_config():
    return {
        "global": {"pageMargin": 1.0},
        "styles": {
            "h1": {},
            "h2": {},
            "h3": {},
            "body": {},
            "code": {},
            "quote": {},
        },
    }


def test_locked_output_file_is_reported_as_permission_error(tmp_path, monkeypatch):
    input_path = tmp_path / "input.md"
    output_path = tmp_path / "output.docx"
    input_path.write_text("# Title\n\nBody", encoding="utf-8")

    monkeypatch.setattr(converter, "Document", lambda: FakeDocument())
    monkeypatch.setattr(converter, "set_page_margins", lambda doc, margin: None)
    monkeypatch.setattr(converter, "add_heading", lambda doc, text, level, conf: None)
    monkeypatch.setattr(converter, "add_body", lambda doc, text, conf: None)

    with pytest.raises(PermissionError_) as exc_info:
        converter.convert(str(input_path), str(output_path), minimal_config())

    message = str(exc_info.value)
    assert "Cannot write output file" in message
    assert str(output_path) in message
```

- [ ] **Step 2: Run the focused backend test and confirm it fails**

Run:

```bash
python -m pytest backend/tests/test_output_file_lock.py
```

Expected: FAIL because `converter.convert()` currently wraps save-time exceptions in `DocxGenerationError`.

---

### Task 2: Classify Save-Time File Locks in Backend

**Files:**
- Modify: `backend/converter.py`
- Test: `backend/tests/test_output_file_lock.py`

- [ ] **Step 1: Add a helper near the top of `backend/converter.py`, after imports**

```python
def _is_output_permission_error(error: Exception) -> bool:
    if isinstance(error, PermissionError):
        return True

    winerror = getattr(error, "winerror", None)
    if winerror in {5, 32}:
        return True

    errno = getattr(error, "errno", None)
    if errno in {13, 16}:
        return True

    text = str(error).lower()
    locked_markers = (
        "permission denied",
        "being used by another process",
        "另一个程序正在使用此文件",
        "拒绝访问",
    )
    return any(marker in text for marker in locked_markers)
```

- [ ] **Step 2: Replace the `doc.save(output_path)` exception block**

Replace:

```python
try:
    doc.save(output_path)
except PermissionError as e:
    raise PermissionError_(
        "Permission denied writing output file",
        path=output_path,
        details=str(e)
    )
except Exception as e:
    raise DocxGenerationError(
        "Failed to save Word document",
        details=str(e)
    )
```

with:

```python
try:
    doc.save(output_path)
except Exception as e:
    if _is_output_permission_error(e):
        raise PermissionError_(
            "Cannot write output file",
            path=output_path,
            details="The target file may be open in Word/WPS or locked by another application."
        )

    raise DocxGenerationError(
        "Failed to save Word document",
        details=str(e)
    )
```

- [ ] **Step 3: Run the focused backend test**

Run:

```bash
python -m pytest backend/tests/test_output_file_lock.py
```

Expected: PASS.

---

### Task 3: Improve Frontend Permission Error Message

**Files:**
- Modify: `src/services/pythonBackend.ts`
- Modify: `src/services/pythonBackend.test.ts`

- [ ] **Step 1: Add frontend parsing tests**

In `src/services/pythonBackend.test.ts`, add this import if it does not already exist:

```ts
import { parseBackendError } from './pythonBackend';
```

Add this test block before the property-based config tests:

```ts
describe('parseBackendError', () => {
  it('shows a precise message when the output file is locked', () => {
    const stderr = [
      'Error: Cannot write output file - Path: C:\\\\Users\\\\Logic\\\\Desktop\\\\导出测试.docx - Details: The target file may be open in Word/WPS or locked by another application.',
    ].join('\n');

    expect(parseBackendError(stderr, 2)).toEqual({
      message: '无法写入目标文件',
      details: '目标 Word 文件可能正被 Word/WPS 或其他程序打开，请关闭后重试，或选择另一个保存路径。',
    });
  });

  it('keeps the generic permission message for unrelated permission errors', () => {
    const stderr = 'Error: Permission denied reading input file';

    expect(parseBackendError(stderr, 2)).toEqual({
      message: '权限错误',
      details: 'Permission denied reading input file',
    });
  });
});
```

- [ ] **Step 2: Run frontend test and confirm the first new case fails**

Run:

```bash
npm test -- src/services/pythonBackend.test.ts
```

Expected: FAIL because `parseBackendError()` currently maps all exit code `2` errors to generic `权限错误`.

- [ ] **Step 3: Add locked-output detection in `src/services/pythonBackend.ts`**

Inside `parseBackendError()`, after:

```ts
const errorText = errorMatch ? errorMatch[1].trim() : stderr.trim();
```

add:

```ts
const isLockedOutputFile = /cannot write output file|open in word\/wps|locked by another application|being used by another process|拒绝访问|另一个程序正在使用此文件/i.test(errorText);
```

- [ ] **Step 4: Special-case permission errors**

Replace the `BackendErrorCode.PERMISSION_ERROR` case with:

```ts
case BackendErrorCode.PERMISSION_ERROR:
  if (isLockedOutputFile) {
    return {
      message: '无法写入目标文件',
      details: '目标 Word 文件可能正被 Word/WPS 或其他程序打开，请关闭后重试，或选择另一个保存路径。',
    };
  }

  return {
    message: '权限错误',
    details: errorText || '无法写入输出文件，请检查文件权限'
  };
```

- [ ] **Step 5: Run frontend test**

Run:

```bash
npm test -- src/services/pythonBackend.test.ts
```

Expected: PASS.

---

### Task 4: Optional Guard for Non-UTF-8 Sidecar Output

**Files:**
- Modify only if the app still emits `invalid utf-8 sequence` after Tasks 1-3:
  - `src/services/pythonBackend.ts`
  - `src/services/pythonBackend.test.ts`

- [ ] **Step 1: Prefer not to implement this unless reproduced**

After backend emits the locked-file message in stable ASCII/UTF-8, the primary bug should be fixed. If Tauri still throws `invalid utf-8 sequence` before returning `result.stderr`, then add raw sidecar decoding.

- [ ] **Step 2: Add raw decoder helper**

```ts
const PROCESS_OUTPUT_DECODER = new TextDecoder('utf-8', { fatal: false });

export function decodeProcessOutput(output: Uint8Array | string): string {
  if (typeof output === 'string') return output;
  return PROCESS_OUTPUT_DECODER.decode(output);
}
```

- [ ] **Step 3: Use raw shell encoding**

```ts
const cmd = Command.sidecar('binaries/md2word', [
  '--input', tempFilePath,
  '--output', outputPath,
  '--config-file', configFilePath
], {
  encoding: 'raw',
});
```

Then decode before parsing:

```ts
const stderr = decodeProcessOutput(result.stderr);
const { message, details } = parseBackendError(stderr, result.code ?? 1);
```

---

### Task 5: Verify and Rebuild Sidecar

**Files:**
- Verify:
  - `backend/converter.py`
  - `backend/tests/test_output_file_lock.py`
  - `src/services/pythonBackend.ts`
  - `src/services/pythonBackend.test.ts`
  - `src-tauri/binaries/`

- [ ] **Step 1: Run backend tests**

Run:

```bash
python -m pytest backend/tests
```

Expected: PASS.

- [ ] **Step 2: Run frontend checks**

Run:

```bash
npm test -- src/services/pythonBackend.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Rebuild the Python sidecar**

Run:

```bash
npm run build:backend
```

Expected: `src-tauri/binaries/md2word*` is updated.

- [ ] **Step 4: Manual locked-file verification**

Run:

```bash
npm run dev:tauri
```

Manual steps:

1. Export once to `桌面\导出测试.docx`.
2. Open `导出测试.docx` in Word or WPS and keep it open.
3. Export again to the same path.

Expected toast:

```text
无法写入目标文件
目标 Word 文件可能正被 Word/WPS 或其他程序打开，请关闭后重试，或选择另一个保存路径。
```

Expected console:

- No misleading `invalid utf-8 sequence` as the only surfaced cause.
- Backend stderr, if logged, identifies `Cannot write output file`.

---

### Task 6: Commit

**Files:**
- Stage:
  - `backend/converter.py`
  - `backend/tests/test_output_file_lock.py`
  - `src/services/pythonBackend.ts`
  - `src/services/pythonBackend.test.ts`
  - rebuilt `src-tauri/binaries/md2word*` files if changed

- [ ] **Step 1: Inspect working tree**

Run:

```bash
git status --short
```

Do not stage unrelated toolbar changes or docs unless the user asks to include them.

- [ ] **Step 2: Stage only this fix**

Run:

```bash
git add backend/converter.py backend/tests/test_output_file_lock.py src/services/pythonBackend.ts src/services/pythonBackend.test.ts src-tauri/binaries
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "fix(export): report locked output file clearly"
```

---

## Self-Review

- Spec coverage: The plan now matches the confirmed root cause: output file occupancy/lock. It covers backend classification, frontend message mapping, tests, binary rebuild, and manual locked-file reproduction.
- Placeholder scan: No placeholders remain; optional raw decoding is explicitly gated behind reproduction after the real fix.
- Type consistency: Frontend changes stay inside `parseBackendError(stderr: string, exitCode: number)`, so no downstream API changes are required.

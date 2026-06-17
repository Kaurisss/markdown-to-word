# Export Invalid UTF-8 Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Word export failures where the Tauri shell sidecar rejects process output with `invalid utf-8 sequence of 1 bytes from index ...`.

**Architecture:** Treat sidecar stdout/stderr as raw bytes at the frontend boundary, then decode them with a tolerant UTF-8 decoder so plugin-shell cannot throw before the app can parse the backend result. Also force the Python sidecar stdio to UTF-8 during startup to prevent Windows/PyInstaller from emitting GBK/ACP encoded diagnostics.

**Tech Stack:** Tauri v2 `@tauri-apps/plugin-shell`, React/TypeScript, Vitest, Python CLI backend, PyInstaller sidecar.

---

## Problem Summary

The current export path is:

1. `src/hooks/useExport.ts` calls `exportWithPython()`.
2. `src/services/pythonBackend.ts` writes Markdown/config files into `BaseDirectory.AppCache`.
3. It runs `Command.sidecar('binaries/md2word', args).execute()`.
4. `execute()` returns decoded `stdout` and `stderr` strings.

The error `invalid utf-8 sequence of 1 bytes from index 76` happens before normal backend error parsing. This points to `plugin-shell` trying to decode child process output as UTF-8 and encountering bytes that are not valid UTF-8, commonly Chinese Windows console/sidecar stderr encoded as GBK/ACP.

The fix should not change Markdown parsing or Word generation behavior. It should only make process output decoding robust and keep errors user-readable.

---

## File Structure

- Modify `src/services/pythonBackend.ts`
  - Add a small raw byte decoder helper.
  - Run `Command.sidecar(..., { encoding: 'raw' })`.
  - Decode raw `stdout`/`stderr` locally before parsing.
  - Make unexpected shell/plugin exceptions surface readable details.
- Modify `src/services/pythonBackend.test.ts`
  - Add unit tests for tolerant decoding and backend error parsing from decoded stderr.
  - Keep existing property-based config serialization tests.
- Modify `backend/backend.py`
  - Add a `configure_stdio_encoding()` helper.
  - Call it before argument parsing/error output.
- Create `backend/tests/test_stdio_encoding.py`
  - Verify `configure_stdio_encoding()` calls `reconfigure(encoding="utf-8", errors="replace")` when available.
- Rebuild `src-tauri/binaries/md2word*.exe` only after backend tests pass.

---

### Task 1: Add Frontend Decoding Regression Tests

**Files:**
- Modify: `src/services/pythonBackend.test.ts`

- [ ] **Step 1: Update the import**

Replace the current test import block with this import:

```ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { DocumentConfig, ElementStyle } from '../interfaces/Config';
import { decodeProcessOutput, parseBackendError } from './pythonBackend';
```

- [ ] **Step 2: Add decoding tests after existing imports and before property arbitraries**

Add:

```ts
describe('process output decoding', () => {
  it('decodes valid UTF-8 bytes', () => {
    const bytes = new TextEncoder().encode('Error: 文档生成失败');

    expect(decodeProcessOutput(bytes)).toBe('Error: 文档生成失败');
  });

  it('does not throw on invalid UTF-8 bytes', () => {
    const bytes = new Uint8Array([0x45, 0x72, 0x72, 0x6f, 0x72, 0x3a, 0x20, 0xff]);

    expect(() => decodeProcessOutput(bytes)).not.toThrow();
    expect(decodeProcessOutput(bytes)).toContain('Error:');
  });

  it('parses decoded backend stderr into a user-facing error', () => {
    const stderr = decodeProcessOutput(new TextEncoder().encode('Error: Failed to save Word document'));

    expect(parseBackendError(stderr, 5)).toEqual({
      message: '文档生成失败',
      details: 'Failed to save Word document',
    });
  });
});
```

- [ ] **Step 3: Run the focused frontend test and confirm it fails**

Run:

```bash
npm test -- src/services/pythonBackend.test.ts
```

Expected: FAIL because `decodeProcessOutput` is not exported yet.

---

### Task 2: Decode Sidecar Output as Raw Bytes

**Files:**
- Modify: `src/services/pythonBackend.ts`
- Test: `src/services/pythonBackend.test.ts`

- [ ] **Step 1: Add an exported decoder helper after `BackendErrorCode`**

Add:

```ts
const PROCESS_OUTPUT_DECODER = new TextDecoder('utf-8', { fatal: false });

export function decodeProcessOutput(output: Uint8Array | string): string {
  if (typeof output === 'string') return output;
  return PROCESS_OUTPUT_DECODER.decode(output);
}
```

- [ ] **Step 2: Change the sidecar command to raw encoding**

Replace:

```ts
const cmd = Command.sidecar('binaries/md2word', [
  '--input', tempFilePath,
  '--output', outputPath,
  '--config-file', configFilePath
]);
```

with:

```ts
const cmd = Command.sidecar('binaries/md2word', [
  '--input', tempFilePath,
  '--output', outputPath,
  '--config-file', configFilePath
], {
  encoding: 'raw',
});
```

- [ ] **Step 3: Decode stderr before parsing backend errors**

Replace:

```ts
const { message, details } = parseBackendError(result.stderr, result.code ?? 1);
```

with:

```ts
const stderr = decodeProcessOutput(result.stderr);
const { message, details } = parseBackendError(stderr, result.code ?? 1);
```

- [ ] **Step 4: Improve unexpected shell error details**

Replace the catch block body:

```ts
const errorMessage = error instanceof Error ? error.message : String(error);
return {
  success: false,
  error: '导出过程中发生错误',
  details: errorMessage
};
```

with:

```ts
const errorMessage = error instanceof Error ? error.message : String(error);
const isUtf8DecodeError = /invalid utf-?8 sequence/i.test(errorMessage);

return {
  success: false,
  error: isUtf8DecodeError ? '后端输出解码失败' : '导出过程中发生错误',
  details: errorMessage,
};
```

This is a fallback only. After raw decoding is in place, `invalid utf-8 sequence` should no longer occur through normal sidecar execution.

- [ ] **Step 5: Run frontend tests**

Run:

```bash
npm test -- src/services/pythonBackend.test.ts
```

Expected: PASS.

---

### Task 3: Force Python Sidecar Stdio to UTF-8

**Files:**
- Modify: `backend/backend.py`

- [ ] **Step 1: Add the stdio helper after imports and before package path setup**

Add this after `import sys`:

```python
def configure_stdio_encoding() -> None:
    """Ensure subprocess output is UTF-8 even under Windows/PyInstaller."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if callable(reconfigure):
            try:
                reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass
```

- [ ] **Step 2: Call it at the start of `main()`**

Change:

```python
def main():
    """Main entry point with comprehensive error handling."""
    parser = argparse.ArgumentParser(description="Markdown to Word (.docx) converter with style config")
```

to:

```python
def main():
    """Main entry point with comprehensive error handling."""
    configure_stdio_encoding()
    parser = argparse.ArgumentParser(description="Markdown to Word (.docx) converter with style config")
```

This keeps the CLI behavior unchanged while making stderr warnings/errors consistently UTF-8.

---

### Task 4: Add Backend Stdio Encoding Tests

**Files:**
- Create: `backend/tests/test_stdio_encoding.py`

- [ ] **Step 1: Create a focused unit test file**

Create `backend/tests/test_stdio_encoding.py` with:

```python
from types import SimpleNamespace

import backend.backend as backend_cli


class FakeStream:
    def __init__(self):
        self.calls = []

    def reconfigure(self, **kwargs):
        self.calls.append(kwargs)


def test_configure_stdio_encoding_reconfigures_stdout_and_stderr(monkeypatch):
    fake_stdout = FakeStream()
    fake_stderr = FakeStream()
    fake_sys = SimpleNamespace(stdout=fake_stdout, stderr=fake_stderr)

    monkeypatch.setattr(backend_cli, "sys", fake_sys)

    backend_cli.configure_stdio_encoding()

    assert fake_stdout.calls == [{"encoding": "utf-8", "errors": "replace"}]
    assert fake_stderr.calls == [{"encoding": "utf-8", "errors": "replace"}]


def test_configure_stdio_encoding_ignores_streams_without_reconfigure(monkeypatch):
    fake_sys = SimpleNamespace(stdout=object(), stderr=object())

    monkeypatch.setattr(backend_cli, "sys", fake_sys)

    backend_cli.configure_stdio_encoding()
```

- [ ] **Step 2: Run the backend focused test**

Run:

```bash
python -m pytest backend/tests/test_stdio_encoding.py
```

Expected: PASS.

---

### Task 5: Verify the Export Path End-to-End

**Files:**
- Verify: `src/services/pythonBackend.ts`
- Verify: `backend/backend.py`
- Verify generated binary in: `src-tauri/binaries/`

- [ ] **Step 1: Run frontend checks**

Run:

```bash
npm test -- src/services/pythonBackend.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 2: Run backend tests**

Run:

```bash
python -m pytest backend/tests
```

Expected: PASS.

- [ ] **Step 3: Rebuild the Python sidecar**

Run:

```bash
npm run build:backend
```

Expected: PyInstaller rebuilds the sidecar into `src-tauri/binaries/`.

- [ ] **Step 4: Manually test export in the Tauri app**

Run:

```bash
npm run dev:tauri
```

Manual test content:

```md
# 导出测试

这是一段包含中文、英文、符号和局部格式的内容。

1. **加粗**
2. *斜体*
3. <u>下划线</u>
4. ~~删除线~~

保存路径请选择包含中文目录或中文文件名的位置，例如：桌面\导出测试.docx。
```

Expected:

- Export succeeds.
- No console error contains `invalid utf-8 sequence`.
- If backend fails for another reason, toast shows the parsed backend error rather than a raw shell decoding exception.

---

### Task 6: Commit the Fix

**Files:**
- Stage:
  - `src/services/pythonBackend.ts`
  - `src/services/pythonBackend.test.ts`
  - `backend/backend.py`
  - `backend/tests/test_stdio_encoding.py`
  - rebuilt `src-tauri/binaries/md2word*` files if changed

- [ ] **Step 1: Inspect working tree**

Run:

```bash
git status --short
```

Do not stage unrelated editor-toolbar changes or docs unless they are intentionally part of this fix.

- [ ] **Step 2: Stage only export UTF-8 fix files**

Run:

```bash
git add src/services/pythonBackend.ts src/services/pythonBackend.test.ts backend/backend.py backend/tests/test_stdio_encoding.py src-tauri/binaries
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "fix(export): tolerate sidecar output encoding"
```

---

## Self-Review

- Spec coverage: The plan addresses the observed `invalid utf-8 sequence` at the Tauri shell boundary, preserves backend error parsing, adds frontend and backend regression tests, and includes sidecar rebuild verification.
- Placeholder scan: No placeholder tasks remain; every code change includes concrete code.
- Type consistency: `decodeProcessOutput` accepts `Uint8Array | string`, matching `Command.sidecar(..., { encoding: 'raw' })` while remaining safe for tests or future string callers.

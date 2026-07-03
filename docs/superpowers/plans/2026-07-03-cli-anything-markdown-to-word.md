# CLI-Anything Markdown-to-Word Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI-Anything harness that lets agents operate the current Markdown-to-Word conversion engine from the command line.

**Architecture:** Add a self-contained `agent-harness/` Python package using the `cli_anything.markdown_to_word` namespace. The harness stores project state in JSON, exposes Click one-shot commands plus default REPL mode, and exports real `.docx` files through the existing `backend.converter.convert` implementation.

**Tech Stack:** Python 3.10+, Click, prompt-toolkit, pytest, python-docx, the existing `backend/` package.

---

## File Structure

- Create `agent-harness/MARKDOWN_TO_WORD.md`: project-specific backend analysis and operating notes.
- Create `agent-harness/setup.py`: editable-install package metadata and console script.
- Create `agent-harness/cli_anything/markdown_to_word/__init__.py`: package version.
- Create `agent-harness/cli_anything/markdown_to_word/__main__.py`: module entry point.
- Create `agent-harness/cli_anything/markdown_to_word/markdown_to_word_cli.py`: Click CLI and REPL.
- Create `agent-harness/cli_anything/markdown_to_word/core/project.py`: project JSON model and content/config operations.
- Create `agent-harness/cli_anything/markdown_to_word/core/session.py`: file-backed session, undo/redo, locked saves.
- Create `agent-harness/cli_anything/markdown_to_word/core/preview.py`: Markdown and DOCX inspection helpers.
- Create `agent-harness/cli_anything/markdown_to_word/utils/markdown_to_word_backend.py`: wrapper around the real backend converter.
- Create `agent-harness/cli_anything/markdown_to_word/utils/output.py`: human and JSON output helpers.
- Copy `C:\Users\Logic\.codex\skills\cli-anything\scripts\repl_skin.py` to `agent-harness/cli_anything/markdown_to_word/utils/repl_skin.py`.
- Create `agent-harness/cli_anything/markdown_to_word/README.md`: install, commands, examples, testing.
- Create `agent-harness/cli_anything/markdown_to_word/tests/TEST.md`: test plan first, results after passing tests.
- Create `agent-harness/cli_anything/markdown_to_word/tests/test_core.py`: unit tests.
- Create `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`: export and subprocess tests.
- Create `skills/cli-anything-markdown-to-word/SKILL.md`: canonical CLI-specific skill.
- Create `agent-harness/cli_anything/markdown_to_word/skills/SKILL.md`: packaged skill copy.

---

### Task 1: Package Skeleton And Documentation Shell

**Files:**
- Create: `agent-harness/setup.py`
- Create: `agent-harness/MARKDOWN_TO_WORD.md`
- Create: `agent-harness/cli_anything/markdown_to_word/__init__.py`
- Create: `agent-harness/cli_anything/markdown_to_word/__main__.py`
- Create: `agent-harness/cli_anything/markdown_to_word/core/__init__.py`
- Create: `agent-harness/cli_anything/markdown_to_word/utils/__init__.py`
- Create: `agent-harness/cli_anything/markdown_to_word/README.md`

- [ ] **Step 1: Create package metadata**

Create `agent-harness/setup.py`:

```python
from setuptools import find_namespace_packages, setup

setup(
    name="cli-anything-markdown-to-word",
    version="1.0.0",
    description="CLI-Anything harness for the markdown-to-word conversion engine",
    packages=find_namespace_packages(include=["cli_anything.*"]),
    include_package_data=True,
    package_data={
        "cli_anything.markdown_to_word": ["skills/*.md"],
    },
    install_requires=[
        "click>=8.0.0",
        "prompt-toolkit>=3.0.0",
        "python-docx>=1.1.0,<2",
        "markdown-it-py>=4.0,<5",
    ],
    entry_points={
        "console_scripts": [
            "cli-anything-markdown-to-word=cli_anything.markdown_to_word.markdown_to_word_cli:main",
        ],
    },
    python_requires=">=3.10",
)
```

- [ ] **Step 2: Create package entry files**

Create `agent-harness/cli_anything/markdown_to_word/__init__.py`:

```python
"""CLI-Anything harness for markdown-to-word."""

__version__ = "1.0.0"
```

Create `agent-harness/cli_anything/markdown_to_word/__main__.py`:

```python
from cli_anything.markdown_to_word.markdown_to_word_cli import main

if __name__ == "__main__":
    main()
```

Create empty marker files:

```text
agent-harness/cli_anything/markdown_to_word/core/__init__.py
agent-harness/cli_anything/markdown_to_word/utils/__init__.py
```

Do not create `agent-harness/cli_anything/__init__.py`; `cli_anything` must remain a namespace package.

- [ ] **Step 3: Write project analysis document**

Create `agent-harness/MARKDOWN_TO_WORD.md` with this content:

```markdown
# Markdown-to-Word CLI-Anything Harness

## Backend

This harness uses the repository's real Python backend:

- `backend.config.validate_config`
- `backend.converter.convert`
- `backend.errors`

The harness writes Markdown content and style configuration to a project JSON file, then calls `convert(input_path, output_path, config)` to produce a real DOCX file.

## Native Format

The CLI project format is JSON. The rendered output format is DOCX, verified as a ZIP/OOXML package.

## Hard Dependency

The harness must run from this repository or from an environment where the repository root can be resolved. It does not reimplement Markdown-to-DOCX conversion.

## Commands

- `project`: create, save, inspect, history, undo, redo
- `content`: load, set, show, stats
- `config`: default, load, show, set, validate, save
- `export`: render DOCX through the real backend
- `preview`: inspect Markdown or DOCX structure
```

- [ ] **Step 4: Write README shell**

Create `agent-harness/cli_anything/markdown_to_word/README.md` with this content:

```markdown
# cli-anything-markdown-to-word

Command-line harness for the `markdown-to-word` conversion engine.

## Install

```powershell
python -m pip install -e agent-harness
```

## Basic Workflow

```powershell
cli-anything-markdown-to-word --project .tmp/report.json project new --name Report
cli-anything-markdown-to-word --project .tmp/report.json content load .tmp/report.md
cli-anything-markdown-to-word --project .tmp/report.json export docx .tmp/report.docx --json
cli-anything-markdown-to-word preview inspect .tmp/report.docx --json
```

## JSON Mode

Pass `--json` before the command group to receive machine-readable output.

## REPL

Run with no subcommand:

```powershell
cli-anything-markdown-to-word
```

## Tests

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
$env:CLI_ANYTHING_FORCE_INSTALLED='1'; python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
```
```

- [ ] **Step 5: Verify package discovery is not installed yet**

Run:

```powershell
python -m pip install -e agent-harness
```

Expected: installation succeeds once `markdown_to_word_cli.py` exists in Task 5. At this stage it may fail with an import error for `cli_anything.markdown_to_word.markdown_to_word_cli`; that is acceptable before Task 5 and should not be committed as a validated result.

- [ ] **Step 6: Commit skeleton**

```powershell
git add -- agent-harness/setup.py agent-harness/MARKDOWN_TO_WORD.md agent-harness/cli_anything/markdown_to_word
git commit -m "feat(cli): scaffold markdown-to-word harness"
```

---

### Task 2: Test Plan And Core Project Model

**Files:**
- Create: `agent-harness/cli_anything/markdown_to_word/tests/TEST.md`
- Create: `agent-harness/cli_anything/markdown_to_word/core/project.py`
- Create: `agent-harness/cli_anything/markdown_to_word/tests/test_core.py`

- [ ] **Step 1: Write TEST.md before test code**

Create `agent-harness/cli_anything/markdown_to_word/tests/TEST.md`:

```markdown
# CLI-Anything Markdown-to-Word Test Plan

## Test Inventory Plan

- `test_core.py`: 14 unit tests planned.
- `test_full_e2e.py`: 7 E2E and subprocess tests planned.

## Unit Test Plan

### `core.project`

- Create default project with version, name, empty content, default config, no export.
- Load Markdown content from UTF-8 file.
- Set Markdown content directly.
- Compute content stats for characters, lines, words, headings, tables, code fences.
- Load config from JSON file and validate it with the existing backend validator.
- Update nested config values using dotted paths.
- Reject invalid config sections.

### `core.session`

- Save and load project JSON.
- Track modified state.
- Maintain undo and redo stacks.
- Preserve JSON writes with the locked-save helper.
- Auto-save one-shot mutations through CLI integration.
- Suppress persistence with `--dry-run`.

### `core.preview`

- Inspect Markdown stats.
- Inspect valid DOCX ZIP/OOXML structure.
- Report invalid DOCX structure.

## E2E Test Plan

### Workflow: create and export report

Simulates an agent creating a Markdown report, saving it to a project, and exporting a DOCX file.

Operations:

1. Create project.
2. Load Markdown.
3. Export DOCX.
4. Inspect DOCX.

Verified:

- DOCX file exists.
- DOCX file size is greater than 1000 bytes.
- ZIP contains `[Content_Types].xml` and `word/document.xml`.

### Workflow: subprocess JSON mode

Simulates an installed command used by another agent.

Operations:

1. Invoke `cli-anything-markdown-to-word --help`.
2. Invoke project creation with `--json`.
3. Invoke content loading with `--json`.
4. Invoke DOCX export with `--json`.

Verified:

- JSON output parses.
- `ok` is true for successful commands.
- Installed command resolution works with `CLI_ANYTHING_FORCE_INSTALLED=1`.
```

- [ ] **Step 2: Write failing project tests**

Create `agent-harness/cli_anything/markdown_to_word/tests/test_core.py` with the project tests first:

```python
import json
import zipfile

import pytest

from cli_anything.markdown_to_word.core.project import (
    create_project,
    load_config_file,
    load_markdown_file,
    markdown_stats,
    set_config_value,
)


def test_create_project_has_default_shape():
    project = create_project("Report")
    assert project["version"] == 1
    assert project["name"] == "Report"
    assert project["content"] == ""
    assert project["last_export"] is None
    assert "global" in project["config"]
    assert "styles" in project["config"]


def test_load_markdown_file_reads_utf8(tmp_path):
    source = tmp_path / "input.md"
    source.write_text("# 标题\n\nBody", encoding="utf-8")
    assert load_markdown_file(source) == "# 标题\n\nBody"


def test_markdown_stats_counts_document_features():
    stats = markdown_stats("# Title\n\nBody text\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```py\nprint(1)\n```")
    assert stats["characters"] > 0
    assert stats["lines"] == 8
    assert stats["headings"] == 1
    assert stats["tables"] == 1
    assert stats["code_fences"] == 2


def test_load_config_file_validates_backend_shape(tmp_path):
    config_path = tmp_path / "config.json"
    config_path.write_text(json.dumps(create_project("x")["config"]), encoding="utf-8")
    config = load_config_file(config_path)
    assert "global" in config
    assert "styles" in config


def test_set_config_value_updates_nested_path():
    project = create_project("Report")
    set_config_value(project, "styles.body.fontSize", 14)
    assert project["config"]["styles"]["body"]["fontSize"] == 14


def test_set_config_value_rejects_unknown_root():
    project = create_project("Report")
    with pytest.raises(ValueError, match="Config path must start with"):
        set_config_value(project, "bad.path", 1)
```

- [ ] **Step 3: Run project tests to verify failure**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_core.py -q
```

Expected: FAIL because `cli_anything.markdown_to_word.core.project` does not exist.

- [ ] **Step 4: Implement project model**

Create `agent-harness/cli_anything/markdown_to_word/core/project.py`:

```python
from __future__ import annotations

import copy
import json
import re
from pathlib import Path
from typing import Any

from backend.config import validate_config


DEFAULT_CONFIG: dict[str, Any] = {
    "global": {
        "pageMargin": {
            "top": 3.5 / 2.54,
            "bottom": 3.0 / 2.54,
            "left": 3.0 / 2.54,
            "right": 2.5 / 2.54,
        },
        "pageSize": {"width": 21.0, "height": 29.7, "unit": "cm"},
        "baseFontCn": "SimSun",
        "baseFontEn": "Times New Roman",
        "horizontalRule": "default",
        "includeTableOfContents": True,
        "header": {
            "enabled": True,
            "text": "",
            "distance": 2.8 / 2.54,
            "fontFamily": "SimSun",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 10.5,
            "alignment": "center",
        },
        "footer": {
            "enabled": True,
            "pageNumber": True,
            "format": "第{page}页（共{pages}页）",
            "distance": 2.2 / 2.54,
            "fontFamily": "SimSun",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 10.5,
            "alignment": "center",
            "startAtBody": True,
        },
        "tableOfContents": {
            "maxLevel": 2,
            "titleStyle": {
                "fontFamily": "SimHei",
                "fontFamilyEn": "Times New Roman",
                "fontSize": 18,
                "color": "#000000",
                "bold": True,
                "italic": False,
                "lineSpacing": 1.2,
                "spaceBefore": 12,
                "spaceAfter": 12,
                "alignment": "center",
                "firstLineIndent": 0,
            },
            "levelStyles": {
                "1": {
                    "fontFamily": "SimHei",
                    "fontFamilyEn": "Times New Roman",
                    "fontSize": 12,
                    "color": "#000000",
                    "bold": True,
                    "italic": False,
                    "alignment": "left",
                    "firstLineIndent": 0,
                },
                "2": {
                    "fontFamily": "SimSun",
                    "fontFamilyEn": "Times New Roman",
                    "fontSize": 12,
                    "color": "#000000",
                    "bold": False,
                    "italic": False,
                    "alignment": "left",
                    "firstLineIndent": 2,
                },
            },
        },
        "bodyStart": {
            "firstHeadingAsTitle": True,
            "restartPageNumberAfterToc": True,
            "pageNumberStart": 1,
        },
        "tableHeaderBold": False,
        "normalizePunctuation": True,
    },
    "styles": {
        "documentTitle": {
            "fontFamily": "SimHei",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 18,
            "color": "#000000",
            "bold": True,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 12,
            "spaceAfter": 12,
            "alignment": "center",
            "firstLineIndent": 0,
        },
        "h1": {
            "fontFamily": "SimHei",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 18,
            "color": "#000000",
            "bold": True,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 6,
            "spaceAfter": 6,
            "alignment": "left",
            "firstLineIndent": 0,
        },
        "h2": {
            "fontFamily": "SimHei",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 16,
            "color": "#000000",
            "bold": True,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 6,
            "spaceAfter": 6,
            "alignment": "left",
            "firstLineIndent": 0,
        },
        "h3": {
            "fontFamily": "SimHei",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 12,
            "color": "#000000",
            "bold": True,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 6,
            "spaceAfter": 6,
            "alignment": "left",
            "firstLineIndent": 0,
        },
        "body": {
            "fontFamily": "SimSun",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 12,
            "color": "#000000",
            "bold": False,
            "italic": False,
            "lineSpacing": "22pt",
            "spaceBefore": 0,
            "spaceAfter": 0,
            "alignment": "left",
            "firstLineIndent": 2,
        },
        "code": {
            "fontFamily": "Courier New",
            "fontFamilyEn": "Courier New",
            "fontSize": 10,
            "color": "#000000",
            "bold": False,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 0,
            "spaceAfter": 0,
            "alignment": "left",
            "firstLineIndent": 0,
            "backgroundColor": "#F5F7F9",
        },
        "quote": {
            "fontFamily": "SimSun",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 12,
            "color": "#000000",
            "bold": False,
            "italic": True,
            "lineSpacing": 1.4,
            "spaceBefore": 8,
            "spaceAfter": 8,
            "alignment": "left",
            "firstLineIndent": 0,
            "backgroundColor": "#F5F7F9",
        },
        "table": {
            "fontFamily": "SimSun",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 10.5,
            "color": "#000000",
            "bold": False,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 0,
            "spaceAfter": 0,
            "alignment": "center",
            "firstLineIndent": 0,
        },
        "caption": {
            "fontFamily": "KaiTi",
            "fontFamilyEn": "Times New Roman",
            "fontSize": 10.5,
            "color": "#000000",
            "bold": True,
            "italic": False,
            "lineSpacing": 1.2,
            "spaceBefore": 6,
            "spaceAfter": 6,
            "alignment": "center",
            "firstLineIndent": 0,
        },
    },
}


def create_project(name: str = "Untitled") -> dict[str, Any]:
    config = copy.deepcopy(DEFAULT_CONFIG)
    validate_config(config)
    return {
        "version": 1,
        "name": name,
        "content": "",
        "config": config,
        "last_export": None,
        "history": [],
    }


def load_markdown_file(path: str | Path) -> str:
    return Path(path).read_text(encoding="utf-8")


def load_config_file(path: str | Path) -> dict[str, Any]:
    config = json.loads(Path(path).read_text(encoding="utf-8"))
    validate_config(config)
    return config


def markdown_stats(content: str) -> dict[str, int]:
    lines = content.splitlines()
    words = re.findall(r"\S+", content)
    return {
        "characters": len(content),
        "characters_no_space": len(re.sub(r"\s+", "", content)),
        "lines": len(lines),
        "words": len(words),
        "headings": sum(1 for line in lines if re.match(r"^#{1,6}\s+", line)),
        "tables": sum(1 for line in lines if "|" in line and re.search(r"\|\s*-{1,}", line)),
        "code_fences": sum(1 for line in lines if line.strip().startswith("```")),
    }


def set_config_value(project: dict[str, Any], dotted_path: str, value: Any) -> None:
    parts = dotted_path.split(".")
    if not parts or parts[0] not in {"global", "styles"}:
        raise ValueError("Config path must start with 'global' or 'styles'")

    current: dict[str, Any] = project["config"]
    for part in parts[:-1]:
        child = current.get(part)
        if not isinstance(child, dict):
            child = {}
            current[part] = child
        current = child
    current[parts[-1]] = value
    validate_config(project["config"])
```

- [ ] **Step 5: Run project unit tests**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_core.py -q
```

Expected: the six project tests pass.

- [ ] **Step 6: Commit project model**

```powershell
git add -- agent-harness/cli_anything/markdown_to_word/core/project.py agent-harness/cli_anything/markdown_to_word/tests/TEST.md agent-harness/cli_anything/markdown_to_word/tests/test_core.py
git commit -m "feat(cli): add project model"
```

---

### Task 3: Session Persistence, Undo, Redo, And Preview Inspection

**Files:**
- Modify: `agent-harness/cli_anything/markdown_to_word/tests/test_core.py`
- Create: `agent-harness/cli_anything/markdown_to_word/core/session.py`
- Create: `agent-harness/cli_anything/markdown_to_word/core/preview.py`

- [ ] **Step 1: Append failing session and preview tests**

Append to `agent-harness/cli_anything/markdown_to_word/tests/test_core.py`:

```python
from cli_anything.markdown_to_word.core.preview import inspect_docx, inspect_markdown
from cli_anything.markdown_to_word.core.session import Session, load_project_file


def test_session_save_and_load_round_trip(tmp_path):
    path = tmp_path / "project.json"
    session = Session(path)
    session.new_project("Round Trip")
    session.set_content("# Saved")
    session.save_session()

    loaded = load_project_file(path)
    assert loaded["name"] == "Round Trip"
    assert loaded["content"] == "# Saved"


def test_session_undo_and_redo_content_change(tmp_path):
    session = Session(tmp_path / "project.json")
    session.new_project("Undo")
    session.set_content("one")
    session.set_content("two")
    assert session.project["content"] == "two"
    session.undo()
    assert session.project["content"] == "one"
    session.redo()
    assert session.project["content"] == "two"


def test_session_dry_run_does_not_write(tmp_path):
    path = tmp_path / "project.json"
    session = Session(path)
    session.new_project("Dry")
    session.set_content("unsaved")
    assert path.exists() is False


def test_inspect_markdown_returns_stats():
    result = inspect_markdown("# Title\n\nBody")
    assert result["kind"] == "markdown"
    assert result["stats"]["headings"] == 1


def test_inspect_docx_reports_invalid_file(tmp_path):
    path = tmp_path / "bad.docx"
    path.write_text("not a zip", encoding="utf-8")
    result = inspect_docx(path)
    assert result["kind"] == "docx"
    assert result["valid"] is False
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_core.py -q
```

Expected: FAIL because `core.session` and `core.preview` do not exist.

- [ ] **Step 3: Implement session module**

Create `agent-harness/cli_anything/markdown_to_word/core/session.py`:

```python
from __future__ import annotations

import copy
import json
import os
from pathlib import Path
from typing import Any

from cli_anything.markdown_to_word.core.project import create_project, load_config_file, load_markdown_file


def _locked_save_json(path: str | Path, data: dict[str, Any], **dump_kwargs: Any) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        file_obj = target.open("r+", encoding="utf-8")
    except FileNotFoundError:
        file_obj = target.open("w+", encoding="utf-8")

    with file_obj as handle:
        locked = False
        try:
            import fcntl

            fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
            locked = True
        except (ImportError, OSError):
            pass
        try:
            handle.seek(0)
            handle.truncate()
            json.dump(data, handle, ensure_ascii=False, indent=2, **dump_kwargs)
            handle.flush()
            try:
                os.fsync(handle.fileno())
            except OSError:
                pass
        finally:
            if locked:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def load_project_file(path: str | Path) -> dict[str, Any]:
    target = Path(path)
    with target.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("Project file must contain a JSON object")
    if data.get("version") != 1:
        raise ValueError("Unsupported project version")
    if "content" not in data or "config" not in data:
        raise ValueError("Project file is missing required fields")
    return data


class Session:
    def __init__(self, project_path: str | Path | None = None) -> None:
        self.project_path = Path(project_path) if project_path else None
        self.project: dict[str, Any] | None = None
        self._modified = False
        self._undo_stack: list[dict[str, Any]] = []
        self._redo_stack: list[dict[str, Any]] = []

    def has_project(self) -> bool:
        return self.project is not None

    def require_project(self) -> dict[str, Any]:
        if self.project is None:
            raise RuntimeError("No project loaded. Use 'project new' or pass --project with an existing file.")
        return self.project

    def load(self) -> None:
        if self.project_path is None:
            raise RuntimeError("No project path was provided")
        self.project = load_project_file(self.project_path)
        self._modified = False
        self._undo_stack.clear()
        self._redo_stack.clear()

    def new_project(self, name: str) -> dict[str, Any]:
        self.project = create_project(name)
        self._modified = True
        self._undo_stack.clear()
        self._redo_stack.clear()
        return self.project

    def snapshot(self) -> None:
        self._undo_stack.append(copy.deepcopy(self.require_project()))
        self._redo_stack.clear()

    def mark_modified(self) -> None:
        self._modified = True

    def set_content(self, content: str) -> None:
        self.snapshot()
        self.require_project()["content"] = content
        self.mark_modified()

    def load_content(self, path: str | Path) -> None:
        self.set_content(load_markdown_file(path))

    def load_config(self, path: str | Path) -> None:
        self.snapshot()
        self.require_project()["config"] = load_config_file(path)
        self.mark_modified()

    def record_export(self, output: str, file_size: int, created_at: str) -> None:
        self.snapshot()
        self.require_project()["last_export"] = {
            "output": output,
            "file_size": file_size,
            "created_at": created_at,
        }
        self.mark_modified()

    def undo(self) -> dict[str, Any]:
        if not self._undo_stack:
            raise RuntimeError("Nothing to undo")
        self._redo_stack.append(copy.deepcopy(self.require_project()))
        self.project = self._undo_stack.pop()
        self.mark_modified()
        return self.project

    def redo(self) -> dict[str, Any]:
        if not self._redo_stack:
            raise RuntimeError("Nothing to redo")
        self._undo_stack.append(copy.deepcopy(self.require_project()))
        self.project = self._redo_stack.pop()
        self.mark_modified()
        return self.project

    def save_session(self, path: str | Path | None = None) -> None:
        if path is not None:
            self.project_path = Path(path)
        if self.project_path is None:
            raise RuntimeError("No project path was provided")
        _locked_save_json(self.project_path, self.require_project())
        self._modified = False

    def history_summary(self) -> dict[str, int]:
        return {
            "undo": len(self._undo_stack),
            "redo": len(self._redo_stack),
        }
```

- [ ] **Step 4: Implement preview module**

Create `agent-harness/cli_anything/markdown_to_word/core/preview.py`:

```python
from __future__ import annotations

import zipfile
from pathlib import Path
from typing import Any

from cli_anything.markdown_to_word.core.project import markdown_stats


REQUIRED_DOCX_MEMBERS = ("[Content_Types].xml", "word/document.xml")


def inspect_markdown(content: str) -> dict[str, Any]:
    return {
        "kind": "markdown",
        "stats": markdown_stats(content),
    }


def inspect_docx(path: str | Path) -> dict[str, Any]:
    target = Path(path)
    result: dict[str, Any] = {
        "kind": "docx",
        "path": str(target),
        "exists": target.exists(),
        "valid": False,
        "file_size": target.stat().st_size if target.exists() else 0,
        "members": [],
        "missing": list(REQUIRED_DOCX_MEMBERS),
    }
    if not target.exists():
        result["error"] = "File does not exist"
        return result
    try:
        with zipfile.ZipFile(target) as archive:
            names = archive.namelist()
    except zipfile.BadZipFile:
        result["error"] = "File is not a valid ZIP archive"
        return result

    missing = [member for member in REQUIRED_DOCX_MEMBERS if member not in names]
    result["members"] = names
    result["missing"] = missing
    result["valid"] = not missing
    return result
```

- [ ] **Step 5: Run core tests**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_core.py -q
```

Expected: all core tests pass.

- [ ] **Step 6: Commit session and preview**

```powershell
git add -- agent-harness/cli_anything/markdown_to_word/core/session.py agent-harness/cli_anything/markdown_to_word/core/preview.py agent-harness/cli_anything/markdown_to_word/tests/test_core.py
git commit -m "feat(cli): add session and inspection core"
```

---

### Task 4: Backend Wrapper And Real DOCX Export

**Files:**
- Create: `agent-harness/cli_anything/markdown_to_word/utils/markdown_to_word_backend.py`
- Modify: `agent-harness/cli_anything/markdown_to_word/tests/test_core.py`
- Create: `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`

- [ ] **Step 1: Add backend wrapper unit test**

Append to `agent-harness/cli_anything/markdown_to_word/tests/test_core.py`:

```python
from cli_anything.markdown_to_word.utils.markdown_to_word_backend import resolve_repo_root


def test_resolve_repo_root_finds_backend():
    root = resolve_repo_root()
    assert (root / "backend" / "backend.py").exists()
```

- [ ] **Step 2: Create E2E export tests**

Create `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`:

```python
import json
import os
import shutil
import subprocess
import sys
import zipfile

from cli_anything.markdown_to_word.core.project import create_project
from cli_anything.markdown_to_word.utils.markdown_to_word_backend import export_docx


def assert_valid_docx(path):
    assert os.path.exists(path)
    assert os.path.getsize(path) > 1000
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
    assert "[Content_Types].xml" in names
    assert "word/document.xml" in names


def test_export_docx_uses_real_backend(tmp_path):
    project = create_project("Export")
    project["content"] = "# Report\n\nThis is a real export.\n\n| A | B |\n| - | - |\n| 1 | 2 |"
    output = tmp_path / "report.docx"
    result = export_docx(project["content"], project["config"], output)
    assert result["ok"] is True
    assert result["output"] == str(output)
    assert result["file_size"] > 1000
    assert_valid_docx(output)
    print(f"\n  DOCX: {output} ({result['file_size']:,} bytes)")
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_core.py agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py -q
```

Expected: FAIL because `utils.markdown_to_word_backend` does not exist.

- [ ] **Step 4: Implement backend wrapper**

Create `agent-harness/cli_anything/markdown_to_word/utils/markdown_to_word_backend.py`:

```python
from __future__ import annotations

import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.config import validate_config
from backend.converter import convert


def resolve_repo_root(start: str | Path | None = None) -> Path:
    current = Path(start).resolve() if start else Path(__file__).resolve()
    for candidate in [current, *current.parents]:
        if (candidate / "backend" / "backend.py").exists():
            return candidate
    raise RuntimeError("Cannot locate repository root containing backend/backend.py")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def export_docx(content: str, config: dict[str, Any], output_path: str | Path) -> dict[str, Any]:
    if not content.strip():
        return {
            "ok": False,
            "error": "Content is empty",
            "details": "Load or set Markdown content before exporting.",
        }

    validate_config(config)
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    start = time.perf_counter()

    try:
        with tempfile.NamedTemporaryFile("w", suffix=".md", encoding="utf-8", delete=False) as handle:
            handle.write(content)
            input_path = Path(handle.name)
        try:
            convert(str(input_path), str(output), config)
        finally:
            try:
                input_path.unlink()
            except FileNotFoundError:
                pass
    except Exception as exc:
        return {
            "ok": False,
            "error": str(exc),
            "details": exc.__class__.__name__,
            "method": "backend.converter.convert",
        }

    elapsed_ms = round((time.perf_counter() - start) * 1000)
    return {
        "ok": True,
        "output": str(output),
        "file_size": output.stat().st_size,
        "method": "backend.converter.convert",
        "elapsed_ms": elapsed_ms,
        "created_at": utc_now_iso(),
    }
```

- [ ] **Step 5: Run backend and E2E tests**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_core.py agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py -v -s
```

Expected: all tests pass and the output prints the generated DOCX artifact path.

- [ ] **Step 6: Commit backend wrapper**

```powershell
git add -- agent-harness/cli_anything/markdown_to_word/utils/markdown_to_word_backend.py agent-harness/cli_anything/markdown_to_word/tests/test_core.py agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py
git commit -m "feat(cli): export docx through backend"
```

---

### Task 5: Click CLI, JSON Output, Auto-Save, And REPL

**Files:**
- Create: `agent-harness/cli_anything/markdown_to_word/utils/output.py`
- Create: `agent-harness/cli_anything/markdown_to_word/markdown_to_word_cli.py`
- Create: `agent-harness/cli_anything/markdown_to_word/utils/repl_skin.py`
- Modify: `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`

- [ ] **Step 1: Copy shared REPL skin**

Run:

```powershell
Copy-Item -LiteralPath 'C:\Users\Logic\.codex\skills\cli-anything\scripts\repl_skin.py' -Destination 'agent-harness\cli_anything\markdown_to_word\utils\repl_skin.py'
```

Expected: `agent-harness/cli_anything/markdown_to_word/utils/repl_skin.py` exists.

- [ ] **Step 2: Add subprocess tests**

Append to `agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py`:

```python
def _resolve_cli(name):
    force = os.environ.get("CLI_ANYTHING_FORCE_INSTALLED", "").strip() == "1"
    path = shutil.which(name)
    if path:
        print(f"[_resolve_cli] Using installed command: {path}")
        return [path]
    if force:
        raise RuntimeError(f"{name} not found in PATH. Install with: python -m pip install -e agent-harness")
    module = "cli_anything.markdown_to_word.markdown_to_word_cli"
    print(f"[_resolve_cli] Falling back to: {sys.executable} -m {module}")
    return [sys.executable, "-m", module]


class TestCLISubprocess:
    CLI_BASE = _resolve_cli("cli-anything-markdown-to-word")

    def _run(self, args, check=True):
        return subprocess.run(
            self.CLI_BASE + args,
            capture_output=True,
            text=True,
            check=check,
        )

    def test_help(self):
        result = self._run(["--help"])
        assert result.returncode == 0
        assert "project" in result.stdout

    def test_project_content_export_json_workflow(self, tmp_path):
        project_path = tmp_path / "project.json"
        markdown_path = tmp_path / "report.md"
        output_path = tmp_path / "report.docx"
        markdown_path.write_text("# CLI Report\n\nGenerated from subprocess.", encoding="utf-8")

        created = self._run(["--json", "--project", str(project_path), "project", "new", "--name", "CLI Report"])
        assert json.loads(created.stdout)["ok"] is True

        loaded = self._run(["--json", "--project", str(project_path), "content", "load", str(markdown_path)])
        assert json.loads(loaded.stdout)["ok"] is True

        exported = self._run(["--json", "--project", str(project_path), "export", "docx", str(output_path)])
        data = json.loads(exported.stdout)
        assert data["ok"] is True
        assert_valid_docx(output_path)

    def test_dry_run_does_not_persist_content(self, tmp_path):
        project_path = tmp_path / "project.json"
        self._run(["--json", "--project", str(project_path), "project", "new", "--name", "Dry"])
        self._run(["--json", "--dry-run", "--project", str(project_path), "content", "set", "temporary"])
        data = json.loads(project_path.read_text(encoding="utf-8"))
        assert data["content"] == ""
```

- [ ] **Step 3: Run subprocess tests to verify failure**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py -q
```

Expected: FAIL because `markdown_to_word_cli.py` and `utils.output` do not exist.

- [ ] **Step 4: Implement output helpers**

Create `agent-harness/cli_anything/markdown_to_word/utils/output.py`:

```python
from __future__ import annotations

import json
from typing import Any

import click


def emit(data: dict[str, Any], use_json: bool) -> None:
    if use_json:
        click.echo(json.dumps(data, ensure_ascii=False))
        return
    if data.get("ok") is False:
        click.echo(f"Error: {data.get('error', 'Unknown error')}", err=True)
        details = data.get("details")
        if details:
            click.echo(str(details), err=True)
        return
    message = data.get("message")
    if message:
        click.echo(message)
        return
    click.echo(json.dumps(data, ensure_ascii=False, indent=2))
```

- [ ] **Step 5: Implement CLI**

Create `agent-harness/cli_anything/markdown_to_word/markdown_to_word_cli.py`:

```python
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import click

from cli_anything.markdown_to_word import __version__
from cli_anything.markdown_to_word.core.preview import inspect_docx, inspect_markdown
from cli_anything.markdown_to_word.core.project import create_project, markdown_stats, set_config_value
from cli_anything.markdown_to_word.core.session import Session
from cli_anything.markdown_to_word.utils.markdown_to_word_backend import export_docx
from cli_anything.markdown_to_word.utils.output import emit
from cli_anything.markdown_to_word.utils.repl_skin import ReplSkin


_repl_mode = False


def _ctx_session(ctx: click.Context) -> Session:
    return ctx.obj["session"]


def _ctx_json(ctx: click.Context) -> bool:
    return bool(ctx.obj["use_json"])


def _parse_value(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


@click.group(invoke_without_command=True)
@click.option("--json", "use_json", is_flag=True, help="Output as JSON")
@click.option("--project", "project_path", type=click.Path(path_type=Path), default=None, help="Path to project JSON")
@click.option("--dry-run", "dry_run", is_flag=True, default=False, help="Run without saving one-shot mutations")
@click.pass_context
def cli(ctx: click.Context, use_json: bool, project_path: Path | None, dry_run: bool) -> None:
    ctx.ensure_object(dict)
    session = Session(project_path)
    if project_path and project_path.exists():
        session.load()
    ctx.obj.update({"session": session, "use_json": use_json, "dry_run": dry_run})
    if ctx.invoked_subcommand is None:
        ctx.invoke(repl)


@cli.result_callback()
@click.pass_context
def auto_save_on_exit(ctx: click.Context, result: object, **kwargs: Any) -> None:
    if _repl_mode or ctx.obj.get("dry_run"):
        return
    session: Session = ctx.obj["session"]
    if session.has_project() and session._modified and session.project_path:
        session.save_session()


@cli.group()
def project() -> None:
    """Manage project sessions."""


@project.command("new")
@click.option("--name", default="Untitled", show_default=True)
@click.pass_context
def project_new(ctx: click.Context, name: str) -> None:
    session = _ctx_session(ctx)
    session.new_project(name)
    emit({"ok": True, "message": f"Project created: {name}", "project": session.project}, _ctx_json(ctx))


@project.command("status")
@click.pass_context
def project_status(ctx: click.Context) -> None:
    session = _ctx_session(ctx)
    project_data = session.require_project()
    emit({
        "ok": True,
        "name": project_data["name"],
        "modified": session._modified,
        "stats": markdown_stats(project_data["content"]),
        "history": session.history_summary(),
        "last_export": project_data.get("last_export"),
    }, _ctx_json(ctx))


@project.command("save")
@click.argument("path", required=False, type=click.Path(path_type=Path))
@click.pass_context
def project_save(ctx: click.Context, path: Path | None) -> None:
    session = _ctx_session(ctx)
    session.save_session(path)
    emit({"ok": True, "message": f"Project saved: {session.project_path}"}, _ctx_json(ctx))


@project.command("history")
@click.pass_context
def project_history(ctx: click.Context) -> None:
    emit({"ok": True, "history": _ctx_session(ctx).history_summary()}, _ctx_json(ctx))


@project.command("undo")
@click.pass_context
def project_undo(ctx: click.Context) -> None:
    _ctx_session(ctx).undo()
    emit({"ok": True, "message": "Undo complete"}, _ctx_json(ctx))


@project.command("redo")
@click.pass_context
def project_redo(ctx: click.Context) -> None:
    _ctx_session(ctx).redo()
    emit({"ok": True, "message": "Redo complete"}, _ctx_json(ctx))


@cli.group()
def content() -> None:
    """Manage Markdown content."""


@content.command("load")
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.pass_context
def content_load(ctx: click.Context, path: Path) -> None:
    session = _ctx_session(ctx)
    session.load_content(path)
    emit({"ok": True, "message": f"Content loaded: {path}", "stats": markdown_stats(session.require_project()["content"])}, _ctx_json(ctx))


@content.command("set")
@click.argument("text")
@click.pass_context
def content_set(ctx: click.Context, text: str) -> None:
    session = _ctx_session(ctx)
    session.set_content(text)
    emit({"ok": True, "message": "Content updated", "stats": markdown_stats(text)}, _ctx_json(ctx))


@content.command("show")
@click.pass_context
def content_show(ctx: click.Context) -> None:
    data = _ctx_session(ctx).require_project()["content"]
    emit({"ok": True, "content": data}, _ctx_json(ctx))


@content.command("stats")
@click.pass_context
def content_stats(ctx: click.Context) -> None:
    data = _ctx_session(ctx).require_project()["content"]
    emit({"ok": True, "stats": markdown_stats(data)}, _ctx_json(ctx))


@cli.group("config")
def config_group() -> None:
    """Manage style configuration."""


@config_group.command("default")
@click.pass_context
def config_default(ctx: click.Context) -> None:
    session = _ctx_session(ctx)
    session.snapshot()
    session.require_project()["config"] = create_project("default")["config"]
    session.mark_modified()
    emit({"ok": True, "message": "Default config applied"}, _ctx_json(ctx))


@config_group.command("load")
@click.argument("path", type=click.Path(exists=True, path_type=Path))
@click.pass_context
def config_load(ctx: click.Context, path: Path) -> None:
    _ctx_session(ctx).load_config(path)
    emit({"ok": True, "message": f"Config loaded: {path}"}, _ctx_json(ctx))


@config_group.command("show")
@click.pass_context
def config_show(ctx: click.Context) -> None:
    emit({"ok": True, "config": _ctx_session(ctx).require_project()["config"]}, _ctx_json(ctx))


@config_group.command("set")
@click.argument("path")
@click.argument("value")
@click.pass_context
def config_set(ctx: click.Context, path: str, value: str) -> None:
    session = _ctx_session(ctx)
    session.snapshot()
    set_config_value(session.require_project(), path, _parse_value(value))
    session.mark_modified()
    emit({"ok": True, "message": f"Config updated: {path}"}, _ctx_json(ctx))


@config_group.command("validate")
@click.pass_context
def config_validate(ctx: click.Context) -> None:
    from backend.config import validate_config

    validate_config(_ctx_session(ctx).require_project()["config"])
    emit({"ok": True, "message": "Config is valid"}, _ctx_json(ctx))


@config_group.command("save")
@click.argument("path", type=click.Path(path_type=Path))
@click.pass_context
def config_save(ctx: click.Context, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_ctx_session(ctx).require_project()["config"], ensure_ascii=False, indent=2), encoding="utf-8")
    emit({"ok": True, "message": f"Config saved: {path}"}, _ctx_json(ctx))


@cli.group("export")
def export_group() -> None:
    """Export project output."""


@export_group.command("docx")
@click.argument("output", type=click.Path(path_type=Path))
@click.pass_context
def export_docx_command(ctx: click.Context, output: Path) -> None:
    session = _ctx_session(ctx)
    project_data = session.require_project()
    result = export_docx(project_data["content"], project_data["config"], output)
    if result.get("ok"):
        session.record_export(result["output"], result["file_size"], result["created_at"])
    emit(result, _ctx_json(ctx))


@cli.group()
def preview() -> None:
    """Inspect Markdown or DOCX state."""


@preview.command("inspect")
@click.argument("path", required=False, type=click.Path(path_type=Path))
@click.pass_context
def preview_inspect(ctx: click.Context, path: Path | None) -> None:
    if path is None:
        result = inspect_markdown(_ctx_session(ctx).require_project()["content"])
    elif path.suffix.lower() == ".docx":
        result = inspect_docx(path)
    else:
        result = inspect_markdown(path.read_text(encoding="utf-8"))
    result["ok"] = True
    emit(result, _ctx_json(ctx))


@cli.command()
@click.pass_context
def repl(ctx: click.Context) -> None:
    global _repl_mode
    _repl_mode = True
    skin = ReplSkin("markdown-to-word", version=__version__)
    skin.print_banner()
    skin.info("Type commands such as 'project status', 'content stats', or 'exit'.")
    while True:
        try:
            line = input("markdown-to-word> ").strip()
        except EOFError:
            break
        if line in {"exit", "quit"}:
            break
        if not line:
            continue
        try:
            args = line.split()
            cli.main(args=args, obj=ctx.obj, standalone_mode=False)
        except Exception as exc:
            skin.error(str(exc))
    skin.print_goodbye()


def main() -> None:
    cli()


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: Run CLI subprocess tests**

Run:

```powershell
python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py -v -s
```

Expected: all E2E and subprocess tests pass using module fallback.

- [ ] **Step 7: Install editable package and test installed command**

Run:

```powershell
python -m pip install -e agent-harness
cli-anything-markdown-to-word --help
$env:CLI_ANYTHING_FORCE_INSTALLED='1'; python -m pytest agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py -v -s
```

Expected: help output includes command groups and subprocess tests print `[_resolve_cli] Using installed command:`.

- [ ] **Step 8: Commit CLI**

```powershell
git add -- agent-harness/cli_anything/markdown_to_word/markdown_to_word_cli.py agent-harness/cli_anything/markdown_to_word/utils/output.py agent-harness/cli_anything/markdown_to_word/utils/repl_skin.py agent-harness/cli_anything/markdown_to_word/tests/test_full_e2e.py
git commit -m "feat(cli): add command interface and repl"
```

---

### Task 6: Skill Files, Final Documentation, And Test Results

**Files:**
- Create: `skills/cli-anything-markdown-to-word/SKILL.md`
- Create: `agent-harness/cli_anything/markdown_to_word/skills/SKILL.md`
- Modify: `agent-harness/cli_anything/markdown_to_word/README.md`
- Modify: `agent-harness/cli_anything/markdown_to_word/tests/TEST.md`

- [ ] **Step 1: Create canonical skill file**

Create `skills/cli-anything-markdown-to-word/SKILL.md`:

```markdown
---
name: "cli-anything-markdown-to-word"
description: "Operate the markdown-to-word conversion engine from the command line: manage Markdown projects, style config, DOCX export, JSON output, and REPL sessions."
---

# CLI-Anything Markdown-to-Word

Use this skill when you need to create, inspect, configure, or export Markdown-to-Word documents from the command line.

## Install

```powershell
python -m pip install -e agent-harness
```

## Command

```powershell
cli-anything-markdown-to-word [--json] [--project PATH] [--dry-run] COMMAND
```

Run without a command to enter REPL mode.

## Agent Rules

- Prefer `--json` for machine-readable output.
- Use `--project PATH` for stateful workflows.
- Use `--dry-run` before risky one-shot mutations when you need to inspect the result without saving.
- `export docx` uses the real repository backend and writes a real DOCX file.
- `preview inspect` validates Markdown or DOCX structure; it does not create screenshot previews.

## Common Workflow

```powershell
cli-anything-markdown-to-word --json --project .tmp/report.json project new --name Report
cli-anything-markdown-to-word --json --project .tmp/report.json content load .tmp/report.md
cli-anything-markdown-to-word --json --project .tmp/report.json config set styles.body.fontSize 12
cli-anything-markdown-to-word --json --project .tmp/report.json export docx .tmp/report.docx
cli-anything-markdown-to-word --json preview inspect .tmp/report.docx
```

## Command Groups

- `project`: `new`, `status`, `save`, `history`, `undo`, `redo`
- `content`: `load`, `set`, `show`, `stats`
- `config`: `default`, `load`, `show`, `set`, `validate`, `save`
- `export`: `docx`
- `preview`: `inspect`
```

- [ ] **Step 2: Copy packaged skill file**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'agent-harness\cli_anything\markdown_to_word\skills'
Copy-Item -LiteralPath 'skills\cli-anything-markdown-to-word\SKILL.md' -Destination 'agent-harness\cli_anything\markdown_to_word\skills\SKILL.md'
```

Expected: both skill files exist and have identical content.

- [ ] **Step 3: Expand README with command details**

Append to `agent-harness/cli_anything/markdown_to_word/README.md`:

```markdown

## Command Groups

### project

- `project new --name NAME`
- `project status`
- `project save [PATH]`
- `project history`
- `project undo`
- `project redo`

### content

- `content load PATH`
- `content set TEXT`
- `content show`
- `content stats`

### config

- `config default`
- `config load PATH`
- `config show`
- `config set PATH VALUE`
- `config validate`
- `config save PATH`

### export

- `export docx OUTPUT`

### preview

- `preview inspect [PATH]`

## Backend Notes

DOCX export calls `backend.converter.convert`. If export fails because a target `.docx` is open in Word/WPS or locked by another process, close the target file or choose another output path.
```

- [ ] **Step 4: Run full validations**

Run:

```powershell
python -m pytest backend/tests
python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
python -m pip install -e agent-harness
cli-anything-markdown-to-word --help
$env:CLI_ANYTHING_FORCE_INSTALLED='1'; python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
git diff --check
```

Expected:

- Backend tests pass or any pre-existing backend failures are documented with exact failing test names.
- Harness tests pass.
- Editable install succeeds.
- Help output lists `project`, `content`, `config`, `export`, and `preview`.
- Force-installed subprocess tests use the installed command.
- `git diff --check` exits with code 0.

- [ ] **Step 5: Append passing test results to TEST.md**

Append the exact successful output from this command:

```powershell
$env:CLI_ANYTHING_FORCE_INSTALLED='1'; python -m pytest agent-harness/cli_anything/markdown_to_word/tests -v -s
```

Write the appended section in this shape, with the real command output inside the fenced `text` block:

````markdown
## Test Results

```text
actual output from the force-installed harness test command
```

## Coverage Notes

- Unit tests cover project, config, session, undo/redo, and inspection helpers.
- E2E tests cover real DOCX export through the existing backend.
- Subprocess tests cover the installed `cli-anything-markdown-to-word` command.
- Visual screenshot previews are not covered because this harness intentionally exposes structural inspection only.
````

- [ ] **Step 6: Commit docs and results**

```powershell
git add -- skills/cli-anything-markdown-to-word/SKILL.md agent-harness/cli_anything/markdown_to_word/skills/SKILL.md agent-harness/cli_anything/markdown_to_word/README.md agent-harness/cli_anything/markdown_to_word/tests/TEST.md
git commit -m "docs(cli): document markdown-to-word harness"
```

---

## Self-Review

- Spec coverage: Tasks cover harness structure, backend integration, project/session model, command groups, REPL, JSON output, dry-run, auto-save, tests, docs, and skill files.
- Type consistency: Project data uses `dict[str, Any]`; session APIs consistently use `Path | str`; CLI command names match the approved design.
- Scope check: The plan avoids Tauri UI automation, AI model APIs, screenshot previews, and PyPI publishing.
- Execution risk: The REPL implementation is intentionally basic and command-oriented. The core agent workflows use one-shot commands with JSON output, which are the primary success path.

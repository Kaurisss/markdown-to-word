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

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

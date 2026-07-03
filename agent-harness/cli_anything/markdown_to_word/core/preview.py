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

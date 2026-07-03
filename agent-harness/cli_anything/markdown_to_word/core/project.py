from __future__ import annotations

import copy
import json
import re
import sys
from pathlib import Path
from typing import Any

for _candidate in Path(__file__).resolve().parents:
    if (_candidate / "backend" / "backend.py").exists():
        if str(_candidate) not in sys.path:
            sys.path.insert(0, str(_candidate))
        break

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

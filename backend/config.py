"""Configuration validation and loading."""

import json
import os
from typing import Any, Dict

from .errors import ConfigError, FileError, PermissionError_

REQUIRED_STYLE_KEYS = ("h1", "h2", "h3", "body", "code", "quote")


def validate_config(conf: Dict[str, Any]) -> None:
    if not isinstance(conf, dict):
        raise ConfigError("Invalid configuration format", details="Expected a JSON object")

    global_conf = conf.get("global")
    styles = conf.get("styles")
    if not isinstance(global_conf, dict):
        raise ConfigError("Invalid configuration format", details="Missing or invalid 'global' section")
    if not isinstance(styles, dict):
        raise ConfigError("Invalid configuration format", details="Missing or invalid 'styles' section")

    missing = [key for key in REQUIRED_STYLE_KEYS if key not in styles]
    if missing:
        raise ConfigError("Invalid configuration format", details=f"Missing style keys: {', '.join(missing)}")

    for key in REQUIRED_STYLE_KEYS:
        if not isinstance(styles.get(key), dict):
            raise ConfigError("Invalid configuration format", details=f"Style '{key}' must be an object")

    page_margin = global_conf.get("pageMargin", 1.0)
    def _check_margin(val, label=""):
        try:
            v = float(val)
            if v < 0:
                raise ValueError("margin cannot be negative")
            return v
        except (TypeError, ValueError) as e:
            msg = f"Invalid pageMargin '{label}' value" if label else "Invalid pageMargin value"
            raise ConfigError(msg, details=str(e))

    if isinstance(page_margin, dict):
        for k in ["top", "bottom", "left", "right"]:
            if k in page_margin:
                _check_margin(page_margin[k], k)
    else:
        _check_margin(page_margin)


def load_config(args) -> Dict[str, Any]:
    """Load configuration from file or JSON string with proper error handling."""
    if args.config_file:
        if not os.path.exists(args.config_file):
            raise FileError(
                "Configuration file not found",
                path=args.config_file
            )
        try:
            with open(args.config_file, "r", encoding="utf-8") as f:
                conf = json.load(f)
                validate_config(conf)
                return conf
        except json.JSONDecodeError as e:
            raise ConfigError(
                "Invalid JSON in configuration file",
                details=str(e)
            )
        except PermissionError as e:
            raise PermissionError_(
                "Permission denied reading configuration file",
                path=args.config_file,
                details=str(e)
            )
    if args.config:
        try:
            conf = json.loads(args.config)
            validate_config(conf)
            return conf
        except json.JSONDecodeError as e:
            raise ConfigError(
                "Invalid JSON in configuration string",
                details=str(e)
            )
    # Default config
    conf = {
        "global": {
            "pageMargin": 1.0,
            "baseFontCn": "SimSun",
            "baseFontEn": "",
        },
        "styles": {
            "h1": {"fontSize": 24, "color": "#1F2937", "bold": True, "italic": False, "lineSpacing": 1.2, "spaceBefore": 12, "spaceAfter": 6, "alignment": "left", "firstLineIndent": 0},
            "h2": {"fontSize": 20, "color": "#1F2937", "bold": True, "italic": False, "lineSpacing": 1.2, "spaceBefore": 12, "spaceAfter": 6, "alignment": "left", "firstLineIndent": 0},
            "h3": {"fontSize": 18, "color": "#1F2937", "bold": True, "italic": False, "lineSpacing": 1.2, "spaceBefore": 12, "spaceAfter": 6, "alignment": "left", "firstLineIndent": 0},
            "body": {"fontSize": 12, "color": "#000000", "bold": False, "italic": False, "lineSpacing": 1.6, "spaceBefore": 0, "spaceAfter": 8, "alignment": "left", "firstLineIndent": 2},
            "code": {"fontSize": 10, "color": "#374151", "bold": False, "italic": False, "lineSpacing": 1.2, "spaceBefore": 0, "spaceAfter": 0, "alignment": "left", "firstLineIndent": 0, "fontFamily": "Courier New"},
            "quote": {"fontSize": 12, "color": "#4B5563", "bold": False, "italic": True, "lineSpacing": 1.4, "spaceBefore": 8, "spaceAfter": 8, "alignment": "left", "firstLineIndent": 0},
        },
    }
    validate_config(conf)
    return conf

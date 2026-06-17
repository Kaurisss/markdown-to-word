"""Test that locked output files are reported as permission errors."""

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

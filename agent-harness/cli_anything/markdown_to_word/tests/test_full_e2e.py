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

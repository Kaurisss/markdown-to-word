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

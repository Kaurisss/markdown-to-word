import json

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
    assert stats["lines"] == 11
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


from cli_anything.markdown_to_word.utils.markdown_to_word_backend import resolve_repo_root


def test_resolve_repo_root_finds_backend():
    root = resolve_repo_root()
    assert (root / "backend" / "backend.py").exists()

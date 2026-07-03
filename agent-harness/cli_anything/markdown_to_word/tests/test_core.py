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

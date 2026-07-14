import base64
import zipfile

import pytest

from backend.converter import convert
from backend.errors import FileError


# 1x1 transparent PNG; keeping the fixture textual avoids a generated binary file.
PNG_1X1 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)


def _config(**image_caption):
    return {
        "global": {"pageMargin": 1.0, "baseFontCn": "SimSun", "baseFontEn": ""},
        "imageCaption": {"useAltText": False, "autoNumber": False, **image_caption},
        "styles": {
            key: {
                "fontSize": 12,
                "color": "#000000",
                "bold": False,
                "italic": False,
                "lineSpacing": 1.2,
                "spaceBefore": 0,
                "spaceAfter": 0,
                "alignment": "left",
                "firstLineIndent": 0,
            }
            for key in ("h1", "h2", "h3", "body", "code", "quote")
        },
    }


def test_image_is_embedded_and_alt_caption_is_numbered(tmp_path):
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "pixel.png").write_bytes(PNG_1X1)
    markdown = "![示例图片](assets/pixel.png)"
    source = tmp_path / "document.md"
    output = tmp_path / "document.docx"
    source.write_text(markdown, encoding="utf-8")

    convert(str(source), str(output), _config(useAltText=True, autoNumber=True), resource_root=str(tmp_path))

    with zipfile.ZipFile(output) as archive:
        document_xml = archive.read("word/document.xml").decode("utf-8")
        assert "图1 示例图片" in document_xml
        assert any(name.startswith("word/media/") for name in archive.namelist())


def test_image_reference_cannot_escape_resource_root(tmp_path):
    source = tmp_path / "document.md"
    output = tmp_path / "document.docx"
    source.write_text("![outside](../outside.png)", encoding="utf-8")

    with pytest.raises(FileError):
        convert(str(source), str(output), _config(), resource_root=str(tmp_path))


def test_missing_image_is_reported(tmp_path):
    source = tmp_path / "document.md"
    output = tmp_path / "document.docx"
    source.write_text("![missing](missing.png)", encoding="utf-8")

    with pytest.raises(FileError):
        convert(str(source), str(output), _config(), resource_root=str(tmp_path))
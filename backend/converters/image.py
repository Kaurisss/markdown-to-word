"""Safe Markdown image resolution and DOCX embedding."""

import io
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

from docx import Document

from ..errors import ConversionError, FileError

SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
_REMOTE_REFERENCE = re.compile(r"^(?:[a-z][a-z\d+.-]*:|//)", re.IGNORECASE)


def resolve_image_path(resource_root: str, reference: str) -> Path:
    """Resolve one Markdown reference without allowing workspace escape."""
    value = reference.strip()
    if not value or _REMOTE_REFERENCE.match(value) or re.match(r"^(?:[a-zA-Z]:[\\/]|[\\/])", value):
        raise FileError("Image reference is not a safe workspace-relative path", path=reference)

    root = Path(resource_root).resolve()
    target = (root / value.replace("/", os.sep)).resolve()
    try:
        target.relative_to(root)
    except ValueError as exc:
        raise FileError("Image reference escapes resource root", path=reference) from exc

    if target.suffix.lower() not in SUPPORTED_IMAGE_EXTENSIONS:
        raise FileError("Unsupported image format", path=reference)
    if not target.is_file():
        raise FileError("Image file not found", path=str(target))
    return target


def _content_width_inches(document: Document) -> float:
    section = document.sections[0]
    return float(section.page_width - section.left_margin - section.right_margin) / 914400


def add_image(
    document: Document,
    reference: str,
    alt: str,
    resource_root: Optional[str],
    config: Dict[str, Any],
) -> Tuple[float, float]:
    if not resource_root:
        raise FileError("Image resource root is required", path=reference)

    image_path = resolve_image_path(resource_root, reference)
    try:
        with image_path.open("rb") as image_file:
            shape = document.add_picture(io.BytesIO(image_file.read()))
    except Exception as exc:
        raise ConversionError("Image cannot be embedded", details=f"{reference}: {exc}") from exc

    max_width = _content_width_inches(document)
    width_inches = float(shape.width) / 914400
    if width_inches > max_width:
        shape.width = int(max_width * 914400)
        shape.height = int(shape.height * max_width / width_inches)

    caption_config = config.get("imageCaption", {})
    if caption_config.get("useAltText") and alt.strip():
        # Numbering is assigned by the converter so all image captions share one sequence.
        pass
    return width_inches, float(shape.height) / 914400
"""Text normalization helpers for formal Chinese document output."""

import re


_URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
_CJK_RE = re.compile(r"[\u3400-\u9fff]")
_PUNCTUATION_MAP = str.maketrans({
    ",": "，",
    ".": "。",
    ":": "：",
    ";": "；",
    "?": "？",
    "!": "！",
    "(": "（",
    ")": "）",
    "[": "【",
    "]": "】",
    "{": "｛",
    "}": "｝",
    "\"": "”",
    "'": "’",
})


def normalize_fullwidth_punctuation(text: str) -> str:
    """Convert common half-width punctuation to Chinese full-width punctuation.

    URL-like spans are preserved so visible links and web addresses are not
    corrupted by punctuation conversion.
    """
    if not text or not _CJK_RE.search(text):
        return text

    parts: list[str] = []
    last_end = 0
    for match in _URL_RE.finditer(text):
        if match.start() > last_end:
            parts.append(text[last_end:match.start()].translate(_PUNCTUATION_MAP))
        parts.append(match.group(0))
        last_end = match.end()

    if last_end < len(text):
        parts.append(text[last_end:].translate(_PUNCTUATION_MAP))

    return "".join(parts)

# Config And Errors

## Config Loading

`backend/config.py` accepts configuration from either `--config-file` or `--config` and validates it before conversion. `--config-file` is preferred by the front-end because it avoids command-line encoding issues with Chinese characters.

Required style keys are:

- `h1`
- `h2`
- `h3`
- `body`
- `code`
- `quote`

Optional newer style keys such as `documentTitle`, `table`, and `caption` must be handled with fallbacks in the renderer. Do not make them required unless the front-end storage migration is updated at the same time.

Reference files:
- `backend/config.py`
- `src/config/defaultConfig.ts`

## Page Margin Compatibility

`global.pageMargin` may be either a number or an object with `top`, `bottom`, `left`, and `right`. Validation must preserve both forms. Front-end storage normalization also preserves legacy numeric values.

When changing margin semantics, update:

- `backend/config.py`
- `backend/elements.py` `set_page_margins`
- `backend/document_layout.py`
- `src/config/documentConfigStorage.ts`
- `test/config/documentConfigStorage.test.ts`
- `backend/tests/test_document_layout.py`

## Error Classes And Exit Codes

Use the exception classes in `backend/errors.py` so the Tauri front-end can map failures to user-friendly messages:

- `FileError` -> exit code 1
- `PermissionError_` -> exit code 2
- `ConfigError` -> exit code 3
- `ConversionError` -> exit code 4
- `DocxGenerationError` -> exit code 5

`backend/backend.py` catches these and exits with the expected code. `src/features/export/pythonBackend.ts` maps those codes in `parseBackendError`.

Do not replace these with raw `Exception` or `sys.exit` from converter modules.

## Locked Output Files

Windows file-lock behavior is handled explicitly:

- `backend/converter.py` detects `PermissionError`, `winerror` 5/32, errno 13/16, and common lock text.
- It raises `PermissionError_` with details explaining that the target DOCX may be open in Word/WPS.
- `pythonBackend.ts` maps that to the message `无法写入目标文件`.

Tests:
- `backend/tests/test_output_file_lock.py`
- `test/features/export/pythonBackend.test.ts`

Keep this path intact when changing save behavior.

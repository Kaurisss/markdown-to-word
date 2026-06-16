"""Exception classes and exit codes for the Markdown-to-Word converter."""

# Exit codes as defined in design document
EXIT_FILE_NOT_FOUND = 1
EXIT_PERMISSION_ERROR = 2
EXIT_CONFIG_ERROR = 3
EXIT_MARKDOWN_PARSE_ERROR = 4
EXIT_DOCX_GENERATION_ERROR = 5


class ConversionError(Exception):
    """Base exception for Markdown conversion errors."""
    exit_code = EXIT_MARKDOWN_PARSE_ERROR

    def __init__(self, message: str, details: str = None):
        self.message = message
        self.details = details
        super().__init__(message)

    def __str__(self):
        if self.details:
            return f"{self.message}: {self.details}"
        return self.message


class FileError(Exception):
    """Exception for file operation errors."""
    exit_code = EXIT_FILE_NOT_FOUND

    def __init__(self, message: str, path: str = None, details: str = None):
        self.message = message
        self.path = path
        self.details = details
        super().__init__(message)

    def __str__(self):
        parts = [self.message]
        if self.path:
            parts.append(f"Path: {self.path}")
        if self.details:
            parts.append(f"Details: {self.details}")
        return " - ".join(parts)


class PermissionError_(Exception):
    """Exception for permission denied errors."""
    exit_code = EXIT_PERMISSION_ERROR

    def __init__(self, message: str, path: str = None, details: str = None):
        self.message = message
        self.path = path
        self.details = details
        super().__init__(message)

    def __str__(self):
        parts = [self.message]
        if self.path:
            parts.append(f"Path: {self.path}")
        if self.details:
            parts.append(f"Details: {self.details}")
        return " - ".join(parts)


class ConfigError(Exception):
    """Exception for configuration parsing errors."""
    exit_code = EXIT_CONFIG_ERROR

    def __init__(self, message: str, details: str = None):
        self.message = message
        self.details = details
        super().__init__(message)

    def __str__(self):
        if self.details:
            return f"{self.message}: {self.details}"
        return self.message


class DocxGenerationError(Exception):
    """Exception for DOCX generation errors."""
    exit_code = EXIT_DOCX_GENERATION_ERROR

    def __init__(self, message: str, details: str = None):
        self.message = message
        self.details = details
        super().__init__(message)

    def __str__(self):
        if self.details:
            return f"{self.message}: {self.details}"
        return self.message

"""
Property-based tests for error handling.

**Feature: python-backend-upgrade, Property 10: Error Message Completeness**
**Validates: Requirements 1.3, 6.1, 6.2**
"""
import os
import sys
import tempfile
import subprocess

from hypothesis import given, strategies as st, settings, assume

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import (
    FileError, ConfigError, ConversionError, DocxGenerationError,
    load_config, convert,
    EXIT_FILE_NOT_FOUND, EXIT_PERMISSION_ERROR, EXIT_CONFIG_ERROR,
    EXIT_MARKDOWN_PARSE_ERROR, EXIT_DOCX_GENERATION_ERROR
)


# Strategy for generating invalid file paths
invalid_path = st.text(
    alphabet=st.characters(
        whitelist_categories=('L', 'N'),
        blacklist_characters='/\\:*?"<>|\n\r\t '
    ),
    min_size=5,
    max_size=30
).map(lambda x: f"nonexistent_dir_{x}/nonexistent_file_{x}.md")


# Strategy for generating invalid JSON strings (syntactically invalid)
def is_invalid_json(s):
    """Check if a string is syntactically invalid JSON."""
    import json
    try:
        json.loads(s)
        return False
    except json.JSONDecodeError:
        return True

invalid_json = st.one_of(
    st.just("{invalid json}"),
    st.just("{'single': 'quotes'}"),
    st.just("{missing: quotes}"),
    st.just("[unclosed"),
    st.just("{\"unclosed\": "),
    st.just("{\"key\": undefined}"),
    st.just("{\"trailing\": \"comma\",}"),
)


@settings(max_examples=50)
@given(path=invalid_path)
def test_file_not_found_error(path):
    """
    **Feature: python-backend-upgrade, Property 10: Error Message Completeness**
    **Validates: Requirements 1.3, 6.1**
    
    For any non-existent input file path, the Python_Backend SHALL raise a FileError
    with a descriptive message including the path.
    """
    # Ensure the path doesn't accidentally exist
    assume(not os.path.exists(path))
    
    class Args:
        config = None
        config_file = None
    
    conf = load_config(Args())
    
    try:
        convert(path, "output.docx", conf)
        assert False, "Should have raised FileError"
    except FileError as e:
        # Verify error message contains useful information
        error_str = str(e)
        assert "not found" in error_str.lower() or "path" in error_str.lower(), \
            f"Error message should mention file not found: {error_str}"
        assert path in error_str or "nonexistent" in error_str, \
            f"Error message should include the path: {error_str}"


@settings(max_examples=50)
@given(invalid_config=invalid_json)
def test_invalid_config_json_error(invalid_config):
    """
    **Feature: python-backend-upgrade, Property 10: Error Message Completeness**
    **Validates: Requirements 1.3, 6.1**
    
    For any invalid JSON configuration string, the Python_Backend SHALL raise
    a ConfigError with a descriptive message.
    """
    class Args:
        config = invalid_config
        config_file = None
    
    try:
        load_config(Args())
        assert False, "Should have raised ConfigError"
    except ConfigError as e:
        # Verify error message contains useful information
        error_str = str(e)
        assert "json" in error_str.lower() or "config" in error_str.lower() or "invalid" in error_str.lower(), \
            f"Error message should mention JSON or config issue: {error_str}"


@settings(max_examples=20)
@given(path=invalid_path)
def test_config_file_not_found_error(path):
    """
    **Feature: python-backend-upgrade, Property 10: Error Message Completeness**
    **Validates: Requirements 1.3, 6.1**
    
    For any non-existent config file path, the Python_Backend SHALL raise
    a FileError with a descriptive message.
    """
    # Ensure the path doesn't accidentally exist
    assume(not os.path.exists(path))
    
    class Args:
        config = None
        config_file = path
    
    try:
        load_config(Args())
        assert False, "Should have raised FileError"
    except FileError as e:
        # Verify error message contains useful information
        error_str = str(e)
        assert "not found" in error_str.lower() or "config" in error_str.lower(), \
            f"Error message should mention file not found: {error_str}"


def test_error_exit_codes():
    """
    **Feature: python-backend-upgrade, Property 10: Error Message Completeness**
    **Validates: Requirements 1.3, 6.1, 6.2**
    
    Verify that error classes have correct exit codes defined.
    """
    # Verify exit codes are defined correctly
    assert EXIT_FILE_NOT_FOUND == 1
    assert EXIT_PERMISSION_ERROR == 2
    assert EXIT_CONFIG_ERROR == 3
    assert EXIT_MARKDOWN_PARSE_ERROR == 4
    assert EXIT_DOCX_GENERATION_ERROR == 5
    
    # Verify exception classes have exit_code attribute
    assert FileError.exit_code == EXIT_FILE_NOT_FOUND
    assert ConfigError.exit_code == EXIT_CONFIG_ERROR
    assert ConversionError.exit_code == EXIT_MARKDOWN_PARSE_ERROR
    assert DocxGenerationError.exit_code == EXIT_DOCX_GENERATION_ERROR


def test_cli_error_output_to_stderr():
    """
    **Feature: python-backend-upgrade, Property 10: Error Message Completeness**
    **Validates: Requirements 1.3, 6.1, 6.2**
    
    Verify that errors are output to stderr and return non-zero exit code.
    """
    # Run the backend with a non-existent file
    result = subprocess.run(
        [sys.executable, "backend/backend.py", "-i", "nonexistent_test_file.md", "-o", "output.docx"],
        capture_output=True,
        text=True
    )
    
    # Should have non-zero exit code
    assert result.returncode != 0, "Should return non-zero exit code for error"
    
    # Error should be in stderr
    assert "error" in result.stderr.lower() or "not found" in result.stderr.lower(), \
        f"Error message should be in stderr: {result.stderr}"


def test_cli_invalid_config_error():
    """
    **Feature: python-backend-upgrade, Property 10: Error Message Completeness**
    **Validates: Requirements 1.3, 6.1**
    
    Verify that invalid config JSON returns appropriate error.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a valid input file
        input_path = os.path.join(tmpdir, "input.md")
        with open(input_path, "w") as f:
            f.write("# Test")
        
        # Run with invalid JSON config
        result = subprocess.run(
            [sys.executable, "backend/backend.py", "-i", input_path, "-o", "output.docx", "-c", "{invalid}"],
            capture_output=True,
            text=True
        )
        
        # Should have non-zero exit code
        assert result.returncode != 0, "Should return non-zero exit code for config error"
        
        # Error should mention JSON or config
        assert "json" in result.stderr.lower() or "config" in result.stderr.lower() or "error" in result.stderr.lower(), \
            f"Error message should mention config issue: {result.stderr}"

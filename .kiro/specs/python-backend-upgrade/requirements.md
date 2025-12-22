# Requirements Document

## Introduction

本文档定义了将 Markdown to Word 应用升级为使用 Python 后端生成 docx 文档的需求。当前应用使用 TypeScript (docx.js) 在前端生成文档，升级后将通过 Tauri 调用 Python 后端 (python-docx) 来处理文档生成，以获得更好的中文支持和更丰富的样式控制能力。

## Glossary

- **Tauri_App**: 基于 Tauri 2.0 框架构建的桌面应用程序
- **Python_Backend**: 使用 python-docx 库实现的 Python 脚本，负责将 Markdown 转换为 Word 文档
- **Frontend**: React + TypeScript 实现的用户界面
- **Style_Config**: JSON 格式的样式配置对象，定义文档的字体、颜色、间距等样式属性
- **Markdown_Content**: 用户输入的 Markdown 格式文本内容

## Requirements

### Requirement 1

**User Story:** As a user, I want the application to use Python backend for document generation, so that I can get better Chinese font support and more accurate Word styling.

#### Acceptance Criteria

1. WHEN a user clicks the export button THEN the Tauri_App SHALL invoke the Python_Backend with Markdown_Content and Style_Config
2. WHEN the Python_Backend receives valid Markdown_Content THEN the Python_Backend SHALL generate a Word document and return the file path
3. WHEN the Python_Backend encounters an error THEN the Python_Backend SHALL return an error message with details to the Frontend
4. WHEN the document generation completes successfully THEN the Tauri_App SHALL provide the generated file to the user for download or saving

### Requirement 2

**User Story:** As a user, I want to customize document styles through the UI, so that I can control the appearance of the generated Word document.

#### Acceptance Criteria

1. WHEN a user modifies style settings in the UI THEN the Frontend SHALL serialize the Style_Config to JSON format
2. WHEN the Python_Backend receives Style_Config THEN the Python_Backend SHALL apply all specified styles to the generated document
3. WHEN Style_Config contains font settings THEN the Python_Backend SHALL apply both Chinese (baseFontCn) and English (baseFontEn) fonts correctly
4. WHEN Style_Config contains paragraph settings THEN the Python_Backend SHALL apply line spacing, alignment, and indentation as specified

### Requirement 3

**User Story:** As a user, I want the Python backend to support all Markdown elements that the current frontend supports, so that I do not lose any functionality.

#### Acceptance Criteria

1. WHEN Markdown_Content contains headings (h1-h6) THEN the Python_Backend SHALL convert each heading to the corresponding Word heading style
2. WHEN Markdown_Content contains code blocks THEN the Python_Backend SHALL render code with monospace font and appropriate background styling
3. WHEN Markdown_Content contains blockquotes THEN the Python_Backend SHALL render quotes with italic styling and left indentation
4. WHEN Markdown_Content contains ordered lists THEN the Python_Backend SHALL render numbered list items with correct numbering
5. WHEN Markdown_Content contains unordered lists THEN the Python_Backend SHALL render bullet list items with bullet markers
6. WHEN Markdown_Content contains tables THEN the Python_Backend SHALL render tables with proper cell borders and header styling
7. WHEN Markdown_Content contains inline formatting (bold, italic, links) THEN the Python_Backend SHALL apply corresponding text formatting

### Requirement 4

**User Story:** As a developer, I want the Tauri application to bundle the Python backend, so that users do not need to install Python separately.

#### Acceptance Criteria

1. WHEN the Tauri_App is built THEN the build process SHALL include the Python_Backend as a bundled executable (using PyInstaller or similar)
2. WHEN the Tauri_App starts THEN the Tauri_App SHALL locate the bundled Python_Backend executable in the application resources
3. WHEN the bundled executable is not found THEN the Tauri_App SHALL display an error message indicating the missing component

### Requirement 5

**User Story:** As a user, I want the application to handle temporary files properly, so that my system does not accumulate unnecessary files.

#### Acceptance Criteria

1. WHEN the Python_Backend generates a document THEN the Python_Backend SHALL create the output file in a designated temporary directory
2. WHEN the user saves or downloads the document THEN the Tauri_App SHALL copy the file to the user-specified location
3. WHEN the document operation completes THEN the Tauri_App SHALL clean up temporary files within the session

### Requirement 6

**User Story:** As a user, I want to see meaningful error messages when document generation fails, so that I can understand and resolve issues.

#### Acceptance Criteria

1. WHEN the Python_Backend fails to parse Markdown_Content THEN the Python_Backend SHALL return an error message describing the parsing failure
2. WHEN the Python_Backend fails to write the output file THEN the Python_Backend SHALL return an error message describing the file system error
3. WHEN the Frontend receives an error from the Python_Backend THEN the Frontend SHALL display the error message to the user in a user-friendly format

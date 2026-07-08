/**
 * Python Backend Service
 * 
 * This module provides the interface between the frontend and the Python backend
 * for document generation. It handles:
 * - Temporary file creation and cleanup
 * - Sidecar process invocation
 * - Error parsing and user-friendly messages
 * 
 * Requirements: 1.1, 1.2, 1.4, 5.1, 5.2, 5.3, 6.3
 */

import { Command } from '@tauri-apps/plugin-shell';
import { writeTextFile, readFile, remove, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appCacheDir, join } from '@tauri-apps/api/path';
import { DocumentConfig } from '../../types/config';

/**
 * Options for exporting a document using the Python backend
 */
export interface ExportOptions {
  /** Markdown content to convert */
  markdown: string;
  /** Output file path for the generated .docx file */
  outputPath: string;
  /** Document style configuration */
  config: DocumentConfig;
}

/**
 * Result of an export operation
 */
export interface ExportResult {
  /** Whether the export was successful */
  success: boolean;
  /** Path to the generated file (on success) */
  filePath?: string;
  /** Error message (on failure) */
  error?: string;
  /** Detailed error information for debugging */
  details?: string;
}

/**
 * Options for generating an export-grade paged preview DOCX
 */
export interface ExportPreviewOptions {
  /** Markdown content to convert */
  markdown: string;
  /** Document style configuration */
  config: DocumentConfig;
}

/**
 * Result of an export-grade preview operation
 */
export interface ExportPreviewResult {
  /** Whether preview DOCX generation was successful */
  success: boolean;
  /** Generated DOCX bytes on success */
  docxBytes?: Uint8Array;
  /** Error message on failure */
  error?: string;
  /** Detailed error information for debugging */
  details?: string;
}

/**
 * Error codes returned by the Python backend
 * Matches the exit codes defined in backend/backend.py
 */
export enum BackendErrorCode {
  FILE_NOT_FOUND = 1,
  PERMISSION_ERROR = 2,
  CONFIG_ERROR = 3,
  MARKDOWN_PARSE_ERROR = 4,
  DOCX_GENERATION_ERROR = 5,
}


/**
 * Parse stderr output from the Python backend into a user-friendly error message
 * 
 * @param stderr - Raw stderr output from the backend
 * @param exitCode - Exit code from the process
 * @returns User-friendly error message
 */
export function parseBackendError(stderr: string, exitCode: number): { message: string; details?: string } {
  // Extract the error message from stderr
  const errorMatch = stderr.match(/^Error:\s*(.+)$/m);
  const errorText = errorMatch ? errorMatch[1].trim() : stderr.trim();

  const isLockedOutputFile = /cannot write output file|open in word\/wps|locked by another application|being used by another process|拒绝访问|另一个程序正在使用此文件/i.test(errorText);

  // Map exit codes to user-friendly messages
  switch (exitCode) {
    case BackendErrorCode.FILE_NOT_FOUND:
      return {
        message: '文件未找到',
        details: errorText || '输入文件不存在或无法访问'
      };

    case BackendErrorCode.PERMISSION_ERROR:
      if (isLockedOutputFile) {
        return {
          message: '无法写入目标文件',
          details: '目标 Word 文件可能正被 Word/WPS 或其他程序打开，请关闭后重试，或选择另一个保存路径。',
        };
      }

      return {
        message: '权限错误',
        details: errorText || '无法写入输出文件，请检查文件权限'
      };

    case BackendErrorCode.CONFIG_ERROR:
      return {
        message: '配置错误',
        details: errorText || '样式配置格式无效'
      };

    case BackendErrorCode.MARKDOWN_PARSE_ERROR:
      return {
        message: 'Markdown 解析失败',
        details: errorText || '无法解析 Markdown 内容'
      };

    case BackendErrorCode.DOCX_GENERATION_ERROR:
      return {
        message: '文档生成失败',
        details: errorText || '生成 Word 文档时发生错误'
      };

    default:
      return {
        message: '导出失败',
        details: errorText || `未知错误 (代码: ${exitCode})`
      };
  }
}

/**
 * Generate a unique temporary filename
 */
function generateTempFilename(prefix = 'md2word-input', extension = 'md'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}.${extension}`;
}

interface BackendInputFiles {
  tempFilename: string;
  tempFilePath: string;
  configFilename: string;
  configFilePath: string;
}

async function writeBackendInputFiles(markdown: string, config: DocumentConfig): Promise<BackendInputFiles> {
  const tempFilename = generateTempFilename('md2word-input', 'md');
  const configFilename = generateTempFilename('md2word-config', 'json');

  await writeTextFile(tempFilename, markdown, { baseDir: BaseDirectory.AppCache });

  const cacheDir = await appCacheDir();
  const tempFilePath = await join(cacheDir, tempFilename);

  const configJson = JSON.stringify(config);
  await writeTextFile(configFilename, configJson, { baseDir: BaseDirectory.AppCache });
  const configFilePath = await join(cacheDir, configFilename);

  return {
    tempFilename,
    tempFilePath,
    configFilename,
    configFilePath,
  };
}

async function removeAppCacheFile(filename: string | null): Promise<void> {
  if (!filename) return;
  try {
    await remove(filename, { baseDir: BaseDirectory.AppCache });
  } catch {
    console.warn(`Failed to clean up temp file: ${filename}`);
  }
}

const GENERATED_FILE_READ_RETRY_DELAYS_MS = [0, 100, 250, 500];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

async function readGeneratedAppCacheFile(absolutePath: string, filename: string): Promise<Uint8Array> {
  let lastError: unknown = null;

  for (const delayMs of GENERATED_FILE_READ_RETRY_DELAYS_MS) {
    if (delayMs > 0) {
      await wait(delayMs);
    }

    try {
      return await readFile(absolutePath);
    } catch (error) {
      lastError = error;
    }

    try {
      return await readFile(filename, { baseDir: BaseDirectory.AppCache });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Export Markdown content to a Word document using the Python backend
 * 
 * This function:
 * 1. Creates a temporary file with the Markdown content
 * 2. Invokes the Python backend sidecar
 * 3. Cleans up the temporary file
 * 4. Returns the result with appropriate error handling
 * 
 * @param options - Export options including markdown, output path, and config
 * @returns Promise resolving to the export result
 */
export async function exportWithPython(options: ExportOptions): Promise<ExportResult> {
  const { markdown, outputPath, config } = options;

  // Validate input
  if (!markdown || !markdown.trim()) {
    return {
      success: false,
      error: '内容为空',
      details: '请输入要转换的 Markdown 内容'
    };
  }

  if (!outputPath) {
    return {
      success: false,
      error: '输出路径无效',
      details: '请指定有效的输出文件路径'
    };
  }

  // Generate unique temp filename to avoid conflicts
  let inputFiles: BackendInputFiles | null = null;

  try {
    // Create temporary input file in app cache directory
    // Requirements: 5.1 - Create output in designated temporary directory
    // Config is written to JSON instead of passing via command line to avoid
    // UTF-8 argument issues with Chinese text.
    inputFiles = await writeBackendInputFiles(markdown, config);

    // Invoke the Python backend sidecar
    // Requirements: 1.1 - Invoke Python_Backend with Markdown_Content and Style_Config
    const cmd = Command.sidecar('binaries/md2word', [
      '--input', inputFiles.tempFilePath,
      '--output', outputPath,
      '--config-file', inputFiles.configFilePath
    ]);

    const result = await cmd.execute();

    // Check for errors
    if (result.code !== 0) {
      // Requirements: 6.3 - Display error message in user-friendly format
      const { message, details } = parseBackendError(result.stderr, result.code ?? 1);
      return {
        success: false,
        error: message,
        details: details
      };
    }

    // Requirements: 1.2, 1.4 - Return file path on success
    return {
      success: true,
      filePath: outputPath
    };

  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    // On Windows the sidecar's stderr may contain locale-encoded (GBK)
    // bytes. Tauri's shell plugin fails to decode them as UTF-8 and
    // throws before we can inspect the exit code or error text.
    // Show a neutral message instead of guessing the root cause.
    if (/invalid utf-8/i.test(errorMessage)) {
      return {
        success: false,
        error: '导出失败',
        details: '后端错误信息无法正常解码。常见原因是目标文件正被其他程序占用，请关闭后重试或选择另一个保存路径。',
      };
    }

    return {
      success: false,
      error: '导出过程中发生错误',
      details: errorMessage
    };

  } finally {
    // Requirements: 5.3 - Clean up temporary files
    await removeAppCacheFile(inputFiles?.tempFilename ?? null);
    await removeAppCacheFile(inputFiles?.configFilename ?? null);
  }
}

export async function generateExportPreviewDocx(options: ExportPreviewOptions): Promise<ExportPreviewResult> {
  const { markdown, config } = options;

  if (!markdown || !markdown.trim()) {
    return {
      success: false,
      error: '内容为空',
      details: '请输入要预览的 Markdown 内容'
    };
  }

  let inputFiles: BackendInputFiles | null = null;
  const docxFilename = generateTempFilename('md2word-preview', 'docx');

  try {
    inputFiles = await writeBackendInputFiles(markdown, config);

    const cacheDir = await appCacheDir();
    const docxPath = await join(cacheDir, docxFilename);

    const cmd = Command.sidecar('binaries/md2word', [
      '--input', inputFiles.tempFilePath,
      '--output', docxPath,
      '--config-file', inputFiles.configFilePath,
    ]);

    const result = await cmd.execute();

    if (result.code !== 0) {
      const { message, details } = parseBackendError(result.stderr, result.code ?? 1);
      return {
        success: false,
        error: message,
        details,
      };
    }

    const docxBytes = await readGeneratedAppCacheFile(docxPath, docxFilename);

    return {
      success: true,
      docxBytes,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (/invalid utf-8/i.test(errorMessage)) {
      return {
        success: false,
        error: '预览生成失败',
        details: '后端错误信息无法正常解码。请稍后重试。',
      };
    }

    return {
      success: false,
      error: '预览生成不可用',
      details: errorMessage,
    };
  } finally {
    await removeAppCacheFile(inputFiles?.tempFilename ?? null);
    await removeAppCacheFile(inputFiles?.configFilename ?? null);
    await removeAppCacheFile(docxFilename);
  }
}

/**
 * Format an error result for display to the user
 * 
 * @param result - Export result containing error information
 * @returns Formatted error string for display
 */
export function formatErrorMessage(result: ExportResult): string {
  if (result.success) {
    return '';
  }

  let message = result.error || '未知错误';
  if (result.details) {
    message += `\n${result.details}`;
  }
  return message;
}

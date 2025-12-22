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
import { writeTextFile, remove, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appCacheDir, join } from '@tauri-apps/api/path';
import { DocumentConfig } from '../interfaces/Config';

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
  
  // Map exit codes to user-friendly messages
  switch (exitCode) {
    case BackendErrorCode.FILE_NOT_FOUND:
      return {
        message: '文件未找到',
        details: errorText || '输入文件不存在或无法访问'
      };
    
    case BackendErrorCode.PERMISSION_ERROR:
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
function generateTempFilename(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `md2word-input-${timestamp}-${random}.md`;
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
  const tempFilename = generateTempFilename();
  let tempFilePath: string | null = null;
  
  try {
    // Create temporary input file in app cache directory
    // Requirements: 5.1 - Create output in designated temporary directory
    await writeTextFile(tempFilename, markdown, { baseDir: BaseDirectory.AppCache });
    
    // Get the full path to the temp file
    const cacheDir = await appCacheDir();
    tempFilePath = await join(cacheDir, tempFilename);
    
    // Serialize config to JSON
    // Requirements: 2.1 - Serialize Style_Config to JSON format
    const configJson = JSON.stringify(config);
    
    // Invoke the Python backend sidecar
    // Requirements: 1.1 - Invoke Python_Backend with Markdown_Content and Style_Config
    const cmd = Command.sidecar('binaries/md2word', [
      '--input', tempFilePath,
      '--output', outputPath,
      '--config', configJson
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
    return {
      success: false,
      error: '导出过程中发生错误',
      details: errorMessage
    };
    
  } finally {
    // Requirements: 5.3 - Clean up temporary files
    if (tempFilePath) {
      try {
        await remove(tempFilename, { baseDir: BaseDirectory.AppCache });
      } catch {
        // Ignore cleanup errors - file may not exist or already be deleted
        console.warn(`Failed to clean up temp file: ${tempFilename}`);
      }
    }
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

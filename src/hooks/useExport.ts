import { useState, useCallback } from 'react';
import { save as saveDialog } from '@tauri-apps/plugin-dialog';
import { DocumentConfig } from '../interfaces/Config';
import { exportWithPython, formatErrorMessage } from '../services/pythonBackend';
import { ToastType } from '../components/Toast';

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;
const MAX_BASENAME_LENGTH = 80;

function sanitizeFilename(input: string, fallback: string): string {
  const trimmed = input.trim().replace(INVALID_FILENAME_CHARS, '_');
  const normalized = trimmed.replace(/\s+/g, ' ').replace(/_+/g, '_');
  const safe = normalized.replace(/[. ]+$/g, '');
  const clipped = safe.slice(0, MAX_BASENAME_LENGTH).replace(/[. ]+$/g, '');
  return clipped.length > 0 ? clipped : fallback;
}

interface UseExportOptions {
  content: string;
  cfg: DocumentConfig;
  showToast: (message: string, type?: ToastType) => void;
}

export function useExport({ content, cfg, showToast }: UseExportOptions) {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExport = useCallback(async () => {
    if (!content.trim()) return;

    setIsExporting(true);
    try {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const fallbackName = `文档_${dateStamp}`;
      const title = headingMatch ? headingMatch[1] : fallbackName;
      const suggested = `${sanitizeFilename(title, fallbackName)}.docx`;
      const outPath = await saveDialog({
        filters: [{ name: 'Word', extensions: ['docx'] }],
        defaultPath: suggested
      });
      if (!outPath) return;

      const result = await exportWithPython({
        markdown: content,
        outputPath: outPath,
        config: cfg
      });

      if (!result.success) {
        const errorMessage = formatErrorMessage(result);
        console.error("导出失败:", errorMessage);
        showToast(errorMessage, 'error');
      } else {
        showToast("生成成功！文档已保存。");
      }

    } catch (error) {
      console.error("导出失败:", error);
      showToast("导出过程中发生错误，请检查控制台详情。", 'error');
    } finally {
      setIsExporting(false);
    }
  }, [content, cfg, showToast]);

  return {
    isExporting,
    handleExport,
  };
}

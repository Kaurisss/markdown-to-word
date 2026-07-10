import React, { useMemo } from 'react';
import {
  Download2Line,
  Search2Line,
  TransferHorizontalLine,
} from '@mingcute/react';
import type { ExportPreviewStatus } from '@/features/preview/useExportPreview';

interface StatusBarProps {
  content: string;
  onSearchClick?: () => void;
  onReplaceClick?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
  previewStatus?: ExportPreviewStatus;
  previewPageCount?: number | null;
}

interface StatusBarButtonProps {
  label: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const statusButtonClass =
  'grid h-5 w-5 place-items-center rounded text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100';
const activeButtonClass = 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100';

const StatusBarButton: React.FC<StatusBarButtonProps> = ({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active || undefined}
    title={title ?? label}
    disabled={disabled}
    onClick={onClick}
    className={`${statusButtonClass} ${active ? activeButtonClass : ''}`}
  >
    {children}
  </button>
);

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  onSearchClick,
  onReplaceClick,
  onExport,
  isExporting = false,
  previewStatus,
  previewPageCount,
}) => {
  const stats = useMemo(() => {
    const chars = content.length;
    const charsNoSpace = content.replace(/\s/g, '').length;
    const lines = content ? content.split('\n').length : 0;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    return { chars, charsNoSpace, lines, paragraphs };
  }, [content]);

  return (
    <div className="h-6 flex-shrink-0 bg-[#f3f3f3] dark:bg-[#252526] border-t border-[#e5e5e5] dark:border-[#3c3c3c] flex items-center justify-between gap-3 px-3 text-xs text-gray-600 dark:text-gray-400 select-none">
      <div className="flex min-w-0 items-center gap-4 overflow-hidden">
        <span className="whitespace-nowrap">字符: {stats.chars}</span>
        <span className="hidden whitespace-nowrap sm:inline">字符(不含空格): {stats.charsNoSpace}</span>
        <span className="whitespace-nowrap">行数: {stats.lines}</span>
        <span className="hidden whitespace-nowrap sm:inline">段落: {stats.paragraphs}</span>
        <div className="ml-1 flex items-center gap-1 border-l border-gray-200 pl-2 dark:border-gray-700">
          <StatusBarButton label="搜索" onClick={onSearchClick}>
            <Search2Line className="h-3.5 w-3.5" />
          </StatusBarButton>
          <StatusBarButton label="替换" onClick={onReplaceClick}>
            <TransferHorizontalLine className="h-3.5 w-3.5" />
          </StatusBarButton>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {previewStatus === 'loading' && (
          <span className="mr-1 whitespace-nowrap text-ui-text-muted animate-pulse">正在生成预览…</span>
        )}
        {previewPageCount != null && previewPageCount > 0 && previewStatus !== 'loading' && (
          <span className="mr-1 whitespace-nowrap">{previewPageCount} 页</span>
        )}
        <StatusBarButton
          label={isExporting ? '正在导出' : '导出 Word'}
          title={isExporting ? '正在导出' : '导出 Word'}
          disabled={isExporting}
          onClick={onExport}
        >
          <Download2Line className="h-3.5 w-3.5" />
        </StatusBarButton>
      </div>
    </div>
  );
};

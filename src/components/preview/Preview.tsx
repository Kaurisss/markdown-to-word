import React, { forwardRef, useCallback, useEffect } from 'react';
import { PreviewProps } from '../../types';
import { useExportPreview, ExportPreviewStatus } from '@/features/preview/useExportPreview';
import { DocxRenderPreview } from './DocxRenderPreview';

export interface PreviewStatusInfo {
  status: ExportPreviewStatus;
  pageCount: number | null;
  error?: string;
  details?: string;
}

interface ExtendedPreviewProps extends PreviewProps {
  showStatusBar?: boolean;
  onPreviewStatusChange?: (info: PreviewStatusInfo) => void;
}

const Preview = forwardRef<HTMLDivElement, ExtendedPreviewProps>(
  ({ markdown, cfg, showStatusBar = false, onPreviewStatusChange }, ref) => {
    const exportPreview = useExportPreview({ markdown, cfg });
    const [docxRenderError, setDocxRenderError] = React.useState<string | null>(null);
    const [pageCount, setPageCount] = React.useState<number | null>(null);
    const [hasRenderedDocxPreview, setHasRenderedDocxPreview] = React.useState(false);

    React.useEffect(() => {
      setDocxRenderError(null);
    }, [exportPreview.docxBytes]);

    const handleDocxRenderError = useCallback((message: string) => {
      setDocxRenderError(message);
    }, []);

    const handlePageCountChange = useCallback((count: number | null) => {
      setPageCount(count);
      if (count !== null && count > 0) {
        setHasRenderedDocxPreview(true);
      }
    }, []);

    const showDocxPreview = Boolean(exportPreview.docxBytes);
    const errorDetails = docxRenderError ?? exportPreview.details;
    const hasError = exportPreview.status === 'error' || exportPreview.status === 'unavailable' || docxRenderError;
    const previewStatus = docxRenderError ? 'error' : exportPreview.status;

    // Report preview status to parent
    useEffect(() => {
      onPreviewStatusChange?.({
        status: previewStatus,
        pageCount,
        error: docxRenderError ? '预览渲染失败' : exportPreview.error,
        details: errorDetails ?? undefined,
      });
    }, [previewStatus, pageCount, docxRenderError, exportPreview.error, errorDetails, onPreviewStatusChange]);

    return (
      <div className="flex h-full flex-col overflow-hidden bg-ui-preview-canvas relative transition-colors duration-200">
        <style>{`
          .docx-render-preview .docx-wrapper {
            background: transparent !important;
            padding: 0 !important;
            padding-bottom: 0 !important;
            gap: 16px;
            margin: 0 auto;
            max-width: none;
            transform-origin: top center;
            width: fit-content;
          }
          .docx-render-preview .docx-wrapper > section.docx {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06) !important;
            border: 1px solid rgb(226 232 240) !important;
            margin-bottom: 16px !important;
          }
        `}</style>

        {/* Loading indicator — only show as floating badge when status bar is hidden */}
        {!showStatusBar && exportPreview.status === 'loading' && (
          <div className="absolute top-3 right-4 z-20 rounded-ui-popover border border-ui-border bg-ui-surface-raised/95 px-3 py-1.5 text-xs text-ui-text-muted shadow-ui-popover">
            正在生成导出级预览...
          </div>
        )}

        {hasError && (
          <div className="absolute top-3 left-4 right-4 z-20 rounded-ui-popover border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-ui-popover">
            {exportPreview.error || '预览渲染失败'}
            {hasRenderedDocxPreview ? '，继续显示上一版导出级预览' : '，无法显示导出级预览'}
            {errorDetails ? `：${errorDetails}` : ''}
          </div>
        )}

        {showDocxPreview && exportPreview.docxBytes ? (
          <DocxRenderPreview
            ref={ref}
            docxBytes={exportPreview.docxBytes}
            onRenderError={handleDocxRenderError}
            onPageCountChange={handlePageCountChange}
          />
        ) : (
          <div ref={ref} className="flex-1 overflow-auto p-4 md:p-ui-preview-padding custom-scrollbar">
            <div className="flex min-h-full items-center justify-center text-sm text-ui-text-subtle">
              {markdown.trim() ? '导出级预览将在生成完成后显示' : '输入内容后将生成导出级预览'}
            </div>
          </div>
        )}

        {docxRenderError && !hasRenderedDocxPreview && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-sm text-ui-text-subtle">
            导出级预览无法显示
          </div>
        )}

        {/* Page count — only show as floating badge when status bar is hidden */}
        {!showStatusBar && showDocxPreview && pageCount !== null && (
          <div className="pointer-events-none absolute bottom-4 right-5 z-20 rounded-ui-popover border border-ui-border bg-ui-surface-raised/95 px-3 py-1.5 text-xs text-ui-text-muted shadow-ui-popover">
            {pageCount} 页
          </div>
        )}
      </div>
    );
  }
);

Preview.displayName = 'Preview';

export default Preview;

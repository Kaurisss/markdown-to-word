import { useEffect, useRef, useState } from 'react';
import { DocumentConfig } from '@/types/config';
import { generateExportPreviewDocx } from '@/features/export/pythonBackend';

export type ExportPreviewStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unavailable';

export interface ExportPreviewState {
  status: ExportPreviewStatus;
  docxBytes: Uint8Array | null;
  error?: string;
  details?: string;
}

interface UseExportPreviewOptions {
  markdown: string;
  cfg: DocumentConfig;
  resourceRoot?: string | null;
  enabled?: boolean;
  debounceMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 1000;

export function useExportPreview({
  markdown,
  cfg,
  resourceRoot,
  enabled = true,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseExportPreviewOptions): ExportPreviewState {
  const [state, setState] = useState<ExportPreviewState>({
    status: 'idle',
    docxBytes: null,
  });

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || !markdown.trim()) {
      requestIdRef.current += 1;
      setState({ status: 'idle', docxBytes: null });
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let active = true;

    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: undefined,
      details: undefined,
    }));

    const timer = window.setTimeout(() => {
      void generateExportPreviewDocx({ markdown, config: cfg, resourceRoot: resourceRoot ?? undefined })
        .then((result) => {
          if (!active || requestIdRef.current !== requestId) return;

          if (!result.success || !result.docxBytes) {
            setState((prev) => ({
              status: result.error === '预览生成不可用' ? 'unavailable' : 'error',
              docxBytes: prev.docxBytes,
              error: result.error,
              details: result.details,
            }));
            return;
          }

          setState({
            status: 'ready',
            docxBytes: result.docxBytes,
          });
        })
        .catch((error) => {
          if (!active || requestIdRef.current !== requestId) return;

          setState((prev) => ({
            status: 'unavailable',
            docxBytes: prev.docxBytes,
            error: '预览生成不可用',
            details: error instanceof Error ? error.message : String(error),
          }));
        });
    }, debounceMs);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [markdown, cfg, resourceRoot, enabled, debounceMs]);

  return state;
}

import React, { useEffect, useState } from 'react';
import Zmage from 'react-zmage';
import { useWorkspaceStore } from '@/features/workspace/store';
import { getBaseName, getWorkspaceRelativePath } from '@/features/workspace/pathUtils';
import {
  createImagePreviewUrl,
  readImageDimensions,
  releaseImagePreviewUrl,
} from '@/features/workspace/imagePreview';

function formatBytes(size: number | null): string {
  if (size === null) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function ImageInspector() {
  const selectedPath = useWorkspaceStore((state) => state.selectedImagePath);
  const fs = useWorkspaceStore((state) => state.fs);
  const [preview, setPreview] = useState<{ url: string; size: number } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let url: string | null = null;
    setPreview(null);
    setDimensions(null);
    setError(null);
    if (!selectedPath || !fs) return undefined;

    void createImagePreviewUrl(fs, selectedPath)
      .then(async (next) => {
        url = next.url;
        const nextDimensions = await readImageDimensions(next.url);
        if (disposed) {
          releaseImagePreviewUrl(next.url);
          return;
        }
        setPreview(next);
        setDimensions(nextDimensions);
      })
      .catch((reason: unknown) => {
        if (!disposed) setError(reason instanceof Error ? reason.message : String(reason));
        releaseImagePreviewUrl(url);
      });

    return () => {
      disposed = true;
      releaseImagePreviewUrl(url);
    };
  }, [fs, selectedPath]);

  if (!selectedPath) return null;
  const relativePath = fs ? getWorkspaceRelativePath(fs.workspaceRoot, selectedPath) : selectedPath;

  return (
    <section className="shrink-0 border-t border-ui-border-subtle bg-ui-surface-subtle px-3 py-3" aria-label="图片详情">
      <div className="flex gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-ui-border bg-ui-surface">
          {preview ? (
            <Zmage
              src={preview.url}
              alt={getBaseName(selectedPath)}
              backdrop="#111827"
              className="size-full object-contain"
            />
          ) : (
            <span className="text-[10px] text-ui-text-muted">{error ? '读取失败' : '读取中…'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-[11px] text-ui-text-muted">
          <p className="truncate text-xs font-medium text-ui-text">{getBaseName(selectedPath)}</p>
          <p className="mt-1">{dimensions ? `${dimensions.width} × ${dimensions.height}` : '尺寸读取中…'}</p>
          <p>{formatBytes(preview?.size ?? null)}</p>
          <p className="truncate" title={relativePath}>{relativePath}</p>
        </div>
      </div>
    </section>
  );
}
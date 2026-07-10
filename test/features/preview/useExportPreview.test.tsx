// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { useExportPreview } from '@/features/preview/useExportPreview';

const mocks = vi.hoisted(() => ({
  generateExportPreviewDocx: vi.fn(),
}));

vi.mock('@/features/export/pythonBackend', () => ({
  generateExportPreviewDocx: mocks.generateExportPreviewDocx,
}));

describe('useExportPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.generateExportPreviewDocx.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stores generated DOCX bytes after the debounce delay', async () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    mocks.generateExportPreviewDocx.mockResolvedValue({
      success: true,
      docxBytes,
    });

    const { result } = renderHook(() =>
      useExportPreview({ markdown: '# Title', cfg: DEFAULT_CONFIG, debounceMs: 10 })
    );

    expect(result.current.status).toBe('loading');

    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.generateExportPreviewDocx).toHaveBeenCalledWith({
      markdown: '# Title',
      config: DEFAULT_CONFIG,
    });
    expect(result.current).toEqual({
      status: 'ready',
      docxBytes,
    });
  });

  it('keeps the previous DOCX bytes when a refresh fails', async () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    mocks.generateExportPreviewDocx
      .mockResolvedValueOnce({
        success: true,
        docxBytes,
      })
      .mockResolvedValueOnce({
        success: false,
        error: '预览生成失败',
        details: 'backend failed',
      });

    const { result, rerender } = renderHook(
      ({ markdown }) => useExportPreview({ markdown, cfg: DEFAULT_CONFIG, debounceMs: 10 }),
      { initialProps: { markdown: '# Title' } }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.docxBytes).toBe(docxBytes);

    rerender({ markdown: '# Updated title' });
    expect(result.current.status).toBe('loading');
    expect(result.current.docxBytes).toBe(docxBytes);

    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      status: 'error',
      docxBytes,
      error: '预览生成失败',
      details: 'backend failed',
    });
  });

  it('keeps the previous DOCX bytes when preview generation rejects', async () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    mocks.generateExportPreviewDocx
      .mockResolvedValueOnce({
        success: true,
        docxBytes,
      })
      .mockRejectedValueOnce(new Error('tauri unavailable'));

    const { result, rerender } = renderHook(
      ({ markdown }) => useExportPreview({ markdown, cfg: DEFAULT_CONFIG, debounceMs: 10 }),
      { initialProps: { markdown: '# Title' } }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
      await Promise.resolve();
    });

    rerender({ markdown: '# Updated title' });

    await act(async () => {
      vi.advanceTimersByTime(10);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current).toEqual({
      status: 'unavailable',
      docxBytes,
      error: '预览生成不可用',
      details: 'tauri unavailable',
    });
  });

  it('stays idle and skips generation for empty Markdown', () => {
    const { result } = renderHook(() =>
      useExportPreview({ markdown: '   ', cfg: DEFAULT_CONFIG, debounceMs: 10 })
    );

    expect(result.current).toEqual({
      status: 'idle',
      docxBytes: null,
    });
    expect(mocks.generateExportPreviewDocx).not.toHaveBeenCalled();
  });
});

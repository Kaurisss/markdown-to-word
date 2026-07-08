// @vitest-environment jsdom

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import Preview from '@/components/preview/Preview';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import type { ExportPreviewState } from '@/features/preview/useExportPreview';

const mocks = vi.hoisted(() => ({
  useExportPreview: vi.fn(),
  docxRenderPreview: vi.fn(),
}));

vi.mock('@/features/preview/useExportPreview', () => ({
  useExportPreview: mocks.useExportPreview,
}));

vi.mock('@/components/preview/DocxRenderPreview', () => {
  const MockDocxRenderPreview = React.forwardRef<HTMLDivElement, {
    docxBytes: Uint8Array;
    onRenderError?: (message: string) => void;
    onPageCountChange?: (count: number | null) => void;
  }>(function MockDocxRenderPreview({ docxBytes, onRenderError, onPageCountChange }, ref) {
      React.useEffect(() => {
        onPageCountChange?.(2);
      }, [onPageCountChange]);

      mocks.docxRenderPreview(docxBytes, onRenderError, onPageCountChange);

      return (
        <div ref={ref} data-testid="docx-preview">
          DOCX preview
        </div>
      );
    });

  return {
    DocxRenderPreview: MockDocxRenderPreview,
  };
});

function mockPreviewState(state: ExportPreviewState) {
  mocks.useExportPreview.mockReturnValue(state);
}

describe('Preview', () => {
  beforeEach(() => {
    mocks.useExportPreview.mockReset();
    mocks.docxRenderPreview.mockReset();
  });

  it('shows an empty prompt before content exists', () => {
    mockPreviewState({ status: 'idle', docxBytes: null });

    render(<Preview markdown="   " cfg={DEFAULT_CONFIG} />);

    expect(screen.getByText('输入内容后将生成导出级预览')).toBeTruthy();
  });

  it('shows a loading state without rendering Markdown DOM', () => {
    mockPreviewState({ status: 'loading', docxBytes: null });

    render(<Preview markdown="# Markdown title" cfg={DEFAULT_CONFIG} />);

    expect(screen.getByText('正在生成导出级预览...')).toBeTruthy();
    expect(screen.getByText('导出级预览将在生成完成后显示')).toBeTruthy();
    expect(document.querySelector('h1')).toBeNull();
  });

  it('renders the DOCX preview when bytes are ready', () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    mockPreviewState({ status: 'ready', docxBytes });

    render(<Preview markdown="# Markdown title" cfg={DEFAULT_CONFIG} />);

    expect(screen.getByTestId('docx-preview')).toBeTruthy();
    expect(mocks.docxRenderPreview).toHaveBeenCalledWith(
      docxBytes,
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('reports preview status and page count to the parent', async () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const onPreviewStatusChange = vi.fn();
    mockPreviewState({ status: 'ready', docxBytes });

    render(
      <Preview
        markdown="# Markdown title"
        cfg={DEFAULT_CONFIG}
        onPreviewStatusChange={onPreviewStatusChange}
      />
    );

    await waitFor(() => {
      expect(onPreviewStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ready', pageCount: 2 })
      );
    });
  });

  it('shows generation errors without falling back to Markdown rendering', () => {
    mockPreviewState({
      status: 'error',
      docxBytes: null,
      error: '预览生成失败',
      details: 'backend failed',
    });

    render(<Preview markdown="# Markdown title" cfg={DEFAULT_CONFIG} />);

    expect(screen.getByText('预览生成失败，无法显示导出级预览：backend failed')).toBeTruthy();
    expect(document.querySelector('h1')).toBeNull();
  });

  it('keeps the DOCX preview mounted when rendering fails after a successful preview', async () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const onPreviewStatusChange = vi.fn();
    mockPreviewState({ status: 'ready', docxBytes });

    render(
      <Preview
        markdown="# Markdown title"
        cfg={DEFAULT_CONFIG}
        onPreviewStatusChange={onPreviewStatusChange}
      />
    );

    await screen.findByTestId('docx-preview');
    await waitFor(() => {
      expect(screen.getByText('2 页')).toBeTruthy();
    });

    const onRenderError = mocks.docxRenderPreview.mock.calls.at(-1)?.[1] as
      | ((message: string) => void)
      | undefined;

    act(() => {
      onRenderError?.('broken docx');
    });

    expect(screen.getByTestId('docx-preview')).toBeTruthy();
    expect(screen.getByText('预览渲染失败，继续显示上一版导出级预览：broken docx')).toBeTruthy();
    expect(document.querySelector('h1')).toBeNull();

    await waitFor(() => {
      expect(onPreviewStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          pageCount: 2,
          error: '预览渲染失败',
          details: 'broken docx',
        })
      );
    });
  });
});

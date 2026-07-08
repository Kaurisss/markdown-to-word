// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocxRenderPreview } from '@/components/preview/DocxRenderPreview';

const mocks = vi.hoisted(() => ({
  renderDocx: vi.fn(),
  dispose: vi.fn(),
  ask: vi.fn(),
  open: vi.fn(),
}));

vi.mock('docx-renderer', () => ({
  render: mocks.renderDocx,
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  ask: mocks.ask,
}));

vi.mock('@tauri-apps/plugin-shell', () => ({
  open: mocks.open,
}));

describe('DocxRenderPreview', () => {
  let clientWidthSpy: ReturnType<typeof vi.spyOn>;
  let offsetWidthSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.renderDocx.mockReset();
    mocks.dispose.mockReset();
    mocks.ask.mockReset();
    mocks.open.mockReset();
    mocks.ask.mockResolvedValue(true);
    mocks.open.mockResolvedValue(undefined);

    mocks.renderDocx.mockImplementation(async (_bytes: Uint8Array, body: HTMLElement) => {
      body.innerHTML = '<div class="docx-wrapper"><section class="docx">Rendered DOCX</section></div>';
      return {
        pages: [{ index: 0, element: document.createElement('section'), blockPaths: [] }],
        dispose: mocks.dispose,
      };
    });

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });

    clientWidthSpy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.className.toString().includes('custom-scrollbar') ? 500 : 0;
    });
    offsetWidthSpy = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('docx') ? 1000 : 0;
    });
  });

  afterEach(() => {
    clientWidthSpy.mockRestore();
    offsetWidthSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('renders DOCX bytes and disposes renderer resources on unmount', async () => {
    const docxBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const onPageCountChange = vi.fn();
    const { unmount } = render(
      <DocxRenderPreview docxBytes={docxBytes} onPageCountChange={onPageCountChange} />
    );

    await screen.findByText('Rendered DOCX');

    expect(mocks.renderDocx).toHaveBeenCalledWith(
      docxBytes,
      expect.any(HTMLElement),
      expect.any(HTMLElement),
      expect.objectContaining({ breakPages: true, className: 'docx' })
    );

    await waitFor(() => {
      expect(onPageCountChange).toHaveBeenCalledWith(1);
    });

    unmount();

    expect(mocks.dispose).toHaveBeenCalled();
  });

  it('scales wide DOCX pages to fit the preview container', async () => {
    render(<DocxRenderPreview docxBytes={new Uint8Array([0x50, 0x4b, 0x03, 0x04])} />);

    await screen.findByText('Rendered DOCX');

    await waitFor(() => {
      expect(document.querySelector<HTMLElement>('.docx-wrapper')?.style.getPropertyValue('zoom')).toBe('0.5');
    });
  });

  it('reports render errors to the parent preview', async () => {
    mocks.renderDocx.mockRejectedValue(new Error('broken docx'));
    const onRenderError = vi.fn();

    render(
      <DocxRenderPreview
        docxBytes={new Uint8Array([0x50, 0x4b, 0x03, 0x04])}
        onRenderError={onRenderError}
      />
    );

    await waitFor(() => {
      expect(onRenderError).toHaveBeenCalledWith('broken docx');
    });
  });

  it('keeps the previous rendered DOCX visible when the next render fails', async () => {
    const firstBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const secondBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x05]);
    const onRenderError = vi.fn();

    mocks.renderDocx
      .mockImplementationOnce(async (_bytes: Uint8Array, body: HTMLElement) => {
        body.innerHTML = '<div class="docx-wrapper"><section class="docx">Stable DOCX</section></div>';
        return {
          pages: [{ index: 0, element: document.createElement('section'), blockPaths: [] }],
          dispose: mocks.dispose,
        };
      })
      .mockImplementationOnce(async (_bytes: Uint8Array, body: HTMLElement) => {
        body.innerHTML = '<div class="docx-wrapper"><section class="docx">Broken DOCX</section></div>';
        throw new Error('broken docx');
      });

    const { rerender } = render(
      <DocxRenderPreview docxBytes={firstBytes} onRenderError={onRenderError} />
    );

    await screen.findByText('Stable DOCX');

    rerender(<DocxRenderPreview docxBytes={secondBytes} onRenderError={onRenderError} />);

    await waitFor(() => {
      expect(onRenderError).toHaveBeenCalledWith('broken docx');
    });

    expect(screen.getByText('Stable DOCX')).toBeTruthy();
    expect(screen.queryByText('Broken DOCX')).toBeNull();
  });

  it('confirms before opening external links rendered from DOCX', async () => {
    mocks.renderDocx.mockImplementation(async (_bytes: Uint8Array, body: HTMLElement) => {
      body.innerHTML = '<div class="docx-wrapper"><section class="docx"><a href="https://example.com">Example</a></section></div>';
      return {
        pages: [{ index: 0, element: document.createElement('section'), blockPaths: [] }],
        dispose: mocks.dispose,
      };
    });

    render(<DocxRenderPreview docxBytes={new Uint8Array([0x50, 0x4b, 0x03, 0x04])} />);

    fireEvent.click(await screen.findByText('Example'));

    await waitFor(() => {
      expect(mocks.ask).toHaveBeenCalledWith(
        expect.stringContaining('https://example.com'),
        expect.objectContaining({ title: '打开外部链接' })
      );
      expect(mocks.open).toHaveBeenCalledWith('https://example.com');
    });
  });
});

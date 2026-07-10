import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { RenderResult } from 'docx-renderer';

interface DocxRenderPreviewProps {
  docxBytes: Uint8Array;
  onRenderError?: (message: string) => void;
  onPageCountChange?: (count: number | null) => void;
}

const MIN_PAGE_SCALE = 0.5;
const MAX_PAGE_SCALE = 1;

export const DocxRenderPreview = forwardRef<HTMLDivElement, DocxRenderPreviewProps>(
  ({ docxBytes, onRenderError, onPageCountChange }, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const renderHostRef = useRef<HTMLDivElement>(null);
    const activeRenderRef = useRef<{
      root: HTMLDivElement;
      result: RenderResult;
    } | null>(null);
    const [pageCount, setPageCount] = useState<number | null>(null);

    const setScrollContainerRef = useCallback((node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const handlePreviewClick: React.MouseEventHandler<HTMLDivElement> = useCallback(async (event) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;

      event.preventDefault();
      event.stopPropagation();

      let confirmed = false;
      try {
        const dialog = await import('@tauri-apps/plugin-dialog');
        confirmed = await dialog.ask(`是否在浏览器中打开此链接？\n\n${href}`, {
          title: '打开外部链接',
          kind: 'info',
          okLabel: '打开',
          cancelLabel: '取消',
        });
      } catch {
        confirmed = window.confirm(`是否在浏览器中打开此链接？\n\n${href}`);
      }

      if (!confirmed) return;

      try {
        const shell = await import('@tauri-apps/plugin-shell');
        if (typeof shell.open === 'function') {
          await shell.open(href);
          return;
        }
      } catch {
        // Browser-mode tests and plain web previews do not expose Tauri shell.
      }

      window.open(href, '_blank', 'noopener,noreferrer');
    }, []);

    const fitRenderedPages = useCallback(() => {
      const container = scrollContainerRef.current;
      const activeRoot = activeRenderRef.current?.root;
      const wrapper = activeRoot?.querySelector<HTMLElement>('.docx-wrapper');
      const firstPage = activeRoot?.querySelector<HTMLElement>('.docx-wrapper > section.docx');

      if (!container || !wrapper || !firstPage) return;

      wrapper.style.setProperty('zoom', '1');

      const containerStyle = globalThis.getComputedStyle?.(container);
      const paddingX =
        (Number.parseFloat(containerStyle?.paddingLeft ?? '') || 0) +
        (Number.parseFloat(containerStyle?.paddingRight ?? '') || 0);
      const availableWidth = Math.max(container.clientWidth - paddingX, 0);
      const pageWidth = firstPage.offsetWidth || firstPage.getBoundingClientRect().width;

      if (availableWidth <= 0 || pageWidth <= 0) return;

      const nextScale = Math.min(
        MAX_PAGE_SCALE,
        Math.max(MIN_PAGE_SCALE, availableWidth / pageWidth)
      );

      wrapper.style.setProperty('zoom', nextScale.toFixed(3));
    }, []);

    useEffect(() => {
      let disposed = false;
      let stagedRoot: HTMLDivElement | null = null;
      let stagedResult: RenderResult | null = null;

      const removeStagedRender = () => {
        stagedResult?.dispose();
        stagedResult = null;
        stagedRoot?.remove();
        stagedRoot = null;
      };

      const createStagedRenderRoot = () => {
        const host = renderHostRef.current;
        if (!host) return null;

        const root = document.createElement('div');
        root.className = 'docx-render-preview mx-auto flex w-full justify-center';
        root.style.position = 'absolute';
        root.style.visibility = 'hidden';
        root.style.pointerEvents = 'none';
        root.style.width = '100%';

        const styleContainer = document.createElement('div');
        const bodyContainer = document.createElement('div');
        root.append(styleContainer, bodyContainer);
        host.append(root);
        stagedRoot = root;

        return { root, styleContainer, bodyContainer };
      };

      const renderDocx = async () => {
        if (!activeRenderRef.current) {
          setPageCount(null);
        }

        try {
          const { render } = await import('docx-renderer');
          if (disposed) return;

          const staged = createStagedRenderRoot();
          if (!staged) return;

          stagedResult = await render(docxBytes, staged.bodyContainer, staged.styleContainer, {
            breakPages: true,
            className: 'docx',
          });

          if (disposed) {
            removeStagedRender();
            return;
          }

          const previousRender = activeRenderRef.current;

          staged.root.style.removeProperty('position');
          staged.root.style.removeProperty('visibility');
          staged.root.style.removeProperty('pointer-events');
          staged.root.style.removeProperty('width');

          activeRenderRef.current = {
            root: staged.root,
            result: stagedResult,
          };
          stagedRoot = null;
          stagedResult = null;

          previousRender?.result.dispose();
          previousRender?.root.remove();

          setPageCount(activeRenderRef.current.result.pages.length);
          globalThis.requestAnimationFrame?.(fitRenderedPages);
        } catch (error) {
          if (disposed) return;
          removeStagedRender();
          onRenderError?.(error instanceof Error ? error.message : String(error));
        }
      };

      void renderDocx();

      return () => {
        disposed = true;
        removeStagedRender();
      };
    }, [docxBytes, fitRenderedPages, onRenderError]);

    useEffect(() => () => {
      activeRenderRef.current?.result.dispose();
      activeRenderRef.current?.root.remove();
      activeRenderRef.current = null;
    }, []);

    useEffect(() => {
      onPageCountChange?.(pageCount);
    }, [pageCount, onPageCountChange]);

    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => fitRenderedPages());
        observer.observe(container);
        return () => observer.disconnect();
      }

      globalThis.addEventListener('resize', fitRenderedPages);
      return () => globalThis.removeEventListener('resize', fitRenderedPages);
    }, [fitRenderedPages]);

    return (
      <div
        ref={setScrollContainerRef}
        className="flex-1 overflow-auto p-4 md:p-ui-preview-padding custom-scrollbar"
        onClick={handlePreviewClick}
      >
        <div ref={renderHostRef} className="relative min-h-full" />
      </div>
    );
  }
);

DocxRenderPreview.displayName = 'DocxRenderPreview';

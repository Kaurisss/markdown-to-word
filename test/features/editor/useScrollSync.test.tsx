// @vitest-environment jsdom

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useScrollSync } from '@/features/editor/useScrollSync';
import type { EditorHandle } from '@/types';

function setScrollMetrics(
  element: HTMLElement,
  { scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number },
) {
  Object.defineProperties(element, {
    scrollHeight: { configurable: true, value: scrollHeight },
    clientHeight: { configurable: true, value: clientHeight },
  });
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('useScrollSync', () => {
  it('binds when third-party editor refs become ready after the initial effect', async () => {
    const editorRef: React.RefObject<EditorHandle | null> = { current: null };
    const previewRef: React.RefObject<HTMLDivElement | null> = { current: null };

    renderHook(() => useScrollSync({
      enabled: true,
      viewMode: 'split',
      editorMode: 'edit',
      editorRef,
      previewRef,
    }));

    const editor = document.createElement('div');
    const preview = document.createElement('div');
    setScrollMetrics(editor, { scrollHeight: 1000, clientHeight: 200 });
    setScrollMetrics(preview, { scrollHeight: 600, clientHeight: 200 });

    editorRef.current = { textareaWarp: editor };
    previewRef.current = preview;

    act(() => {
      document.body.append(editor, preview);
    });

    await waitFor(() => {
      editor.scrollTop = 400;
      editor.dispatchEvent(new Event('scroll'));
      expect(preview.scrollTop).toBe(200);
    });
  });

  it('rebinds when the DOCX preview replaces its initial scroll container', async () => {
    const editor = document.createElement('div');
    const initialPreview = document.createElement('div');
    setScrollMetrics(editor, { scrollHeight: 1000, clientHeight: 200 });
    setScrollMetrics(initialPreview, { scrollHeight: 600, clientHeight: 200 });

    const editorRef: React.RefObject<EditorHandle | null> = {
      current: { textareaWarp: editor },
    };
    const previewRef: React.RefObject<HTMLDivElement | null> = {
      current: initialPreview,
    };

    document.body.append(editor, initialPreview);
    renderHook(() => useScrollSync({
      enabled: true,
      viewMode: 'split',
      editorMode: 'edit',
      editorRef,
      previewRef,
    }));

    const renderedPreview = document.createElement('div');
    setScrollMetrics(renderedPreview, { scrollHeight: 1000, clientHeight: 200 });
    previewRef.current = renderedPreview;

    act(() => {
      initialPreview.replaceWith(renderedPreview);
    });

    await waitFor(() => {
      editor.scrollTop = 400;
      editor.dispatchEvent(new Event('scroll'));
      expect(renderedPreview.scrollTop).toBe(400);
    });

    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });

    editor.scrollTop = 100;
    initialPreview.scrollTop = 200;
    initialPreview.dispatchEvent(new Event('scroll'));
    expect(editor.scrollTop).toBe(100);
  });

  it('does not synchronize either direction when disabled', () => {
    const editor = document.createElement('div');
    const preview = document.createElement('div');
    setScrollMetrics(editor, { scrollHeight: 1000, clientHeight: 200 });
    setScrollMetrics(preview, { scrollHeight: 600, clientHeight: 200 });

    const editorRef: React.RefObject<EditorHandle | null> = {
      current: { textareaWarp: editor },
    };
    const previewRef: React.RefObject<HTMLDivElement | null> = {
      current: preview,
    };

    document.body.append(editor, preview);
    renderHook(() => useScrollSync({
      enabled: false,
      viewMode: 'split',
      editorMode: 'edit',
      editorRef,
      previewRef,
    }));

    editor.scrollTop = 400;
    editor.dispatchEvent(new Event('scroll'));
    expect(preview.scrollTop).toBe(0);

    preview.scrollTop = 200;
    preview.dispatchEvent(new Event('scroll'));
    expect(editor.scrollTop).toBe(400);
  });
});

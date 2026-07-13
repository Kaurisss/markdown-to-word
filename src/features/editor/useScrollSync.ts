import { useEffect, useRef } from 'react';
import { EditorHandle, EditorMode, ViewMode } from '../../types';

interface UseScrollSyncOptions {
  enabled: boolean;
  viewMode: ViewMode;
  editorMode: EditorMode;
  editorRef: React.RefObject<EditorHandle | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollSync({
  enabled,
  viewMode,
  editorMode,
  editorRef,
  previewRef,
}: UseScrollSyncOptions) {
  const isScrollingSyncRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || viewMode !== 'split') return;

    let boundEditor: HTMLElement | null = null;
    let boundPreview: HTMLDivElement | null = null;
    let animationFrame: number | null = null;

    const resolveEditor = () => (
      editorMode === 'edit'
        ? editorRef.current?.textareaWarp ?? null
        : editorRef.current?.container?.querySelector<HTMLElement>('.w-md-editor-preview') ?? null
    );

    const handleEditorScroll = () => {
      if (isScrollingSyncRef.current || !boundEditor || !boundPreview) return;
      isScrollingSyncRef.current = true;

      const editorScrollRatio = boundEditor.scrollTop
        / (boundEditor.scrollHeight - boundEditor.clientHeight || 1);
      const previewMaxScroll = boundPreview.scrollHeight - boundPreview.clientHeight;
      boundPreview.scrollTop = editorScrollRatio * previewMaxScroll;

      requestAnimationFrame(() => {
        isScrollingSyncRef.current = false;
      });
    };

    const handlePreviewScroll = () => {
      if (isScrollingSyncRef.current || !boundEditor || !boundPreview) return;
      isScrollingSyncRef.current = true;

      const previewScrollRatio = boundPreview.scrollTop
        / (boundPreview.scrollHeight - boundPreview.clientHeight || 1);
      const editorMaxScroll = boundEditor.scrollHeight - boundEditor.clientHeight;
      boundEditor.scrollTop = previewScrollRatio * editorMaxScroll;

      requestAnimationFrame(() => {
        isScrollingSyncRef.current = false;
      });
    };

    const unbind = () => {
      boundEditor?.removeEventListener('scroll', handleEditorScroll);
      boundPreview?.removeEventListener('scroll', handlePreviewScroll);
    };

    const bindCurrentElements = () => {
      const nextEditor = resolveEditor();
      const nextPreview = previewRef.current;
      if (nextEditor === boundEditor && nextPreview === boundPreview) return;

      unbind();
      boundEditor = nextEditor;
      boundPreview = nextPreview;

      boundEditor?.addEventListener('scroll', handleEditorScroll);
      boundPreview?.addEventListener('scroll', handlePreviewScroll);
    };

    const scheduleBindingCheck = () => {
      if (animationFrame !== null) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = null;
        bindCurrentElements();
      });
    };

    bindCurrentElements();
    scheduleBindingCheck();

    const observer = typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(scheduleBindingCheck);
    observer?.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer?.disconnect();
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      unbind();
      isScrollingSyncRef.current = false;
    };
  }, [enabled, viewMode, editorMode, editorRef, previewRef]);
}

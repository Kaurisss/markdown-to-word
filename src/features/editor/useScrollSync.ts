import { useEffect, useRef } from 'react';
import { ViewMode } from '../../types';

interface UseScrollSyncOptions {
  viewMode: ViewMode;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollSync({ viewMode, editorRef, previewRef }: UseScrollSyncOptions) {
  const isScrollingSyncRef = useRef<boolean>(false);

  useEffect(() => {
    if (viewMode !== 'split') return;

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    const handleEditorScroll = () => {
      if (isScrollingSyncRef.current) return;
      isScrollingSyncRef.current = true;

      const editorScrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
      const previewMaxScroll = preview.scrollHeight - preview.clientHeight;
      preview.scrollTop = editorScrollRatio * previewMaxScroll;

      requestAnimationFrame(() => {
        isScrollingSyncRef.current = false;
      });
    };

    const handlePreviewScroll = () => {
      if (isScrollingSyncRef.current) return;
      isScrollingSyncRef.current = true;

      const previewScrollRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
      const editorMaxScroll = editor.scrollHeight - editor.clientHeight;
      editor.scrollTop = previewScrollRatio * editorMaxScroll;

      requestAnimationFrame(() => {
        isScrollingSyncRef.current = false;
      });
    };

    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [viewMode, editorRef, previewRef]);
}

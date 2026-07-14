import { useCallback, RefObject } from 'react';
import { ToastType } from '../../components/shell/Toast';
import { EditorHandle, EditorMode } from '../../types';

interface UseClipboardParams {
  editorRef: RefObject<EditorHandle | null>;
  editorMode: EditorMode;
  updateContent: (next: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  onImportImage?: (fileName: string, content: Uint8Array) => Promise<void>;
}

export function useClipboard({ editorRef, editorMode, updateContent, showToast, onImportImage }: UseClipboardParams) {
  const handleCopy = useCallback(async () => {
    if (editorMode !== 'edit') return;
    const textarea = editorRef.current?.textarea;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.slice(start, end);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制', 'success');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('复制失败', 'error');
    }
  }, [editorMode, editorRef, showToast]);

  const handleCut = useCallback(async () => {
    if (editorMode !== 'edit') return;
    const textarea = editorRef.current?.textarea;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.slice(start, end);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const next = textarea.value.slice(0, start) + textarea.value.slice(end);
      updateContent(next);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      });
      showToast('已剪切', 'success');
    } catch (err) {
      console.error('Failed to cut:', err);
      showToast('剪切失败', 'error');
    }
  }, [editorMode, editorRef, updateContent, showToast]);

  const handlePaste = useCallback(async () => {
    if (editorMode !== 'edit') return;
    const textarea = editorRef.current?.textarea;
    if (!textarea) return;
    try {
      if (onImportImage && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        const imageItem = items.find((item) => item.types.some((type) => type.startsWith('image/')));
        if (imageItem) {
          const imageType = imageItem.types.find((type) => type.startsWith('image/')) ?? 'image/png';
          const blob = await imageItem.getType(imageType);
          const extension = imageType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png';
          await onImportImage(`clipboard.${extension}`, new Uint8Array(await blob.arrayBuffer()));
          return;
        }
      }

      const text = await navigator.clipboard.readText();
      if (!text) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const next = textarea.value.slice(0, start) + text + textarea.value.slice(end);
      updateContent(next);
      const nextPos = start + text.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(nextPos, nextPos);
      });
    } catch (err) {
      console.error('Failed to paste:', err);
      showToast('无法读取剪贴板', 'error');
    }
  }, [editorMode, editorRef, updateContent, showToast, onImportImage]);

  return { handleCopy, handleCut, handlePaste };
}

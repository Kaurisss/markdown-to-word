import { useCallback, RefObject } from 'react';
import { ToastType } from '../../components/shell/Toast';

interface UseClipboardParams {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  updateContent: (next: string) => void;
  showToast: (message: string, type?: ToastType) => void;
}

export function useClipboard({ editorRef, updateContent, showToast }: UseClipboardParams) {
  const handleCopy = useCallback(async () => {
    const textarea = editorRef.current;
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
  }, [editorRef, showToast]);

  const handleCut = useCallback(async () => {
    const textarea = editorRef.current;
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
  }, [editorRef, updateContent, showToast]);

  const handlePaste = useCallback(async () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    try {
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
  }, [editorRef, updateContent, showToast]);

  return { handleCopy, handleCut, handlePaste };
}

import { useCallback } from 'react';
import { EditorHandle } from '../../types';
import {
  applyInlineFormat,
  InlineFormatKind,
} from '../../utils/inlineFormat';

interface UseEditorFormattingOptions {
  editorRef: React.RefObject<EditorHandle | null>;
  content: string;
  updateContent: (next: string) => void;
}

export function useEditorFormatting({
  editorRef,
  content,
  updateContent,
}: UseEditorFormattingOptions) {
  const applyFormat = useCallback((kind: InlineFormatKind) => {
    const editor = editorRef.current?.textarea;
    if (!editor || editor.selectionEnd <= editor.selectionStart) return;

    const scrollTop = editor.scrollTop;
    const scrollLeft = editor.scrollLeft;
    const result = applyInlineFormat({
      content,
      selectionStart: editor.selectionStart,
      selectionEnd: editor.selectionEnd,
      kind,
    });

    updateContent(result.content);

    requestAnimationFrame(() => {
      editor.focus({ preventScroll: true });
      editor.setSelectionRange(result.selectionStart, result.selectionEnd);
      editor.scrollTop = scrollTop;
      editor.scrollLeft = scrollLeft;
    });
  }, [content, editorRef, updateContent]);

  return { applyFormat };
}

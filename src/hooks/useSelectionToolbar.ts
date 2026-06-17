import { useCallback, useEffect, useMemo, useState } from 'react';
import getCaretCoordinates from 'textarea-caret';
import {
  ActiveInlineFormats,
  applyInlineFormat,
  getActiveInlineFormats,
  InlineFormatKind,
} from '../utils/inlineFormat';

interface SelectionToolbarState {
  visible: boolean;
  x: number;
  y: number;
  selectionStart: number;
  selectionEnd: number;
  activeFormats: ActiveInlineFormats;
}

interface UseSelectionToolbarOptions {
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  updateContent: (next: string) => void;
}

const EMPTY_ACTIVE_FORMATS: ActiveInlineFormats = {
  bold: false,
  italic: false,
  code: false,
  underline: false,
  strike: false,
  link: false,
};

const HIDDEN_STATE: SelectionToolbarState = {
  visible: false,
  x: 0,
  y: 0,
  selectionStart: 0,
  selectionEnd: 0,
  activeFormats: EMPTY_ACTIVE_FORMATS,
};

export function useSelectionToolbar({
  editorRef,
  content,
  updateContent,
}: UseSelectionToolbarOptions) {
  const [state, setState] = useState<SelectionToolbarState>(HIDDEN_STATE);

  const refreshSelectionToolbar = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement !== editor) {
      setState(HIDDEN_STATE);
      return;
    }

    const { selectionStart, selectionEnd } = editor;
    if (selectionEnd <= selectionStart) {
      setState(HIDDEN_STATE);
      return;
    }

    const coords = getCaretCoordinates(editor, selectionStart);
    const rect = editor.getBoundingClientRect();

    setState({
      visible: true,
      x: rect.left + coords.left - editor.scrollLeft,
      y: rect.top + coords.top - editor.scrollTop,
      selectionStart,
      selectionEnd,
      activeFormats: getActiveInlineFormats(content, selectionStart, selectionEnd),
    });
  }, [content, editorRef]);

  const hideSelectionToolbar = useCallback(() => {
    setState(HIDDEN_STATE);
  }, []);

  const applyFormat = useCallback((kind: InlineFormatKind) => {
    const editor = editorRef.current;
    if (!editor || !state.visible) return;

    const linkUrl = kind === 'link'
      ? window.prompt('请输入链接地址', 'https://')
      : undefined;

    if (kind === 'link' && !linkUrl) return;

    const result = applyInlineFormat({
      content,
      selectionStart: state.selectionStart,
      selectionEnd: state.selectionEnd,
      kind,
      linkUrl,
    });

    updateContent(result.content);

    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(result.selectionStart, result.selectionEnd);
      refreshSelectionToolbar();
    });
  }, [content, editorRef, refreshSelectionToolbar, state, updateContent]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideSelectionToolbar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hideSelectionToolbar]);

  return useMemo(() => ({
    toolbarState: state,
    refreshSelectionToolbar,
    hideSelectionToolbar,
    applyFormat,
  }), [applyFormat, hideSelectionToolbar, refreshSelectionToolbar, state]);
}

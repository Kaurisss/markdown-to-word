import { useCallback, useEffect, useMemo, useState } from 'react';
import getCaretCoordinates from 'textarea-caret';
import {
  ActiveInlineFormats,
  applyInlineFormat,
  getActiveInlineFormats,
  InlineFormatKind,
} from '../../utils/inlineFormat';

interface SelectionToolbarState {
  visible: boolean;
  x: number;
  y: number;
  selectionStart: number;
  selectionEnd: number;
  activeFormats: ActiveInlineFormats;
}

interface LinkDialogState {
  open: boolean;
}

interface SelectionRange {
  selectionStart: number;
  selectionEnd: number;
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
  const [linkDialogState, setLinkDialogState] = useState<LinkDialogState>({ open: false });
  const [pendingLinkRange, setPendingLinkRange] = useState<SelectionRange | null>(null);

  const refreshSelectionToolbar = useCallback((contentOverride?: unknown) => {
    const nextContent = typeof contentOverride === 'string' ? contentOverride : content;
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
      activeFormats: getActiveInlineFormats(nextContent, selectionStart, selectionEnd),
    });
  }, [content, editorRef]);

  const hideSelectionToolbar = useCallback(() => {
    setState(HIDDEN_STATE);
  }, []);

  const applyFormatToRange = useCallback((
    kind: InlineFormatKind,
    range: SelectionRange,
    linkUrl?: string,
  ) => {
    const editor = editorRef.current;
    if (!editor) return;

    const scrollTop = editor.scrollTop;
    const scrollLeft = editor.scrollLeft;

    const result = applyInlineFormat({
      content,
      selectionStart: range.selectionStart,
      selectionEnd: range.selectionEnd,
      kind,
      linkUrl,
    });

    updateContent(result.content);

    requestAnimationFrame(() => {
      editor.focus({ preventScroll: true });
      editor.setSelectionRange(result.selectionStart, result.selectionEnd);
      editor.scrollTop = scrollTop;
      editor.scrollLeft = scrollLeft;
      refreshSelectionToolbar(result.content);
    });
  }, [content, editorRef, refreshSelectionToolbar, updateContent]);

  const applyFormat = useCallback((kind: InlineFormatKind) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selectionStart = editor.selectionStart;
    const selectionEnd = editor.selectionEnd;
    if (selectionEnd <= selectionStart) return;

    const range = { selectionStart, selectionEnd };

    if (kind === 'link') {
      setPendingLinkRange(range);
      setLinkDialogState({ open: true });
      hideSelectionToolbar();
      return;
    }

    applyFormatToRange(kind, range);
  }, [applyFormatToRange, editorRef, hideSelectionToolbar]);

  const setLinkDialogOpen = useCallback((open: boolean) => {
    setLinkDialogState({ open });
    if (!open) {
      setPendingLinkRange(null);
    }
  }, []);

  const confirmLink = useCallback((linkUrl: string) => {
    if (!pendingLinkRange) return;

    setLinkDialogState({ open: false });
    applyFormatToRange('link', pendingLinkRange, linkUrl);
    setPendingLinkRange(null);
  }, [applyFormatToRange, pendingLinkRange]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideSelectionToolbar();
      }
    };

    const handlePointerSelectionEnd = () => {
      requestAnimationFrame(() => {
        refreshSelectionToolbar();
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handlePointerSelectionEnd);
    window.addEventListener('pointerup', handlePointerSelectionEnd);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handlePointerSelectionEnd);
      window.removeEventListener('pointerup', handlePointerSelectionEnd);
    };
  }, [hideSelectionToolbar, refreshSelectionToolbar]);

  return useMemo(() => ({
    toolbarState: state,
    linkDialogState,
    refreshSelectionToolbar,
    hideSelectionToolbar,
    applyFormat,
    setLinkDialogOpen,
    confirmLink,
  }), [
    applyFormat,
    confirmLink,
    hideSelectionToolbar,
    linkDialogState,
    refreshSelectionToolbar,
    setLinkDialogOpen,
    state,
  ]);
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import getCaretCoordinates from 'textarea-caret';
import {
  ActiveInlineFormats,
  applyInlineFormat,
  getActiveInlineFormats,
  InlineFormatKind,
} from '../../utils/inlineFormat';

interface SelectionToolbarAnchor {
  x: number;
  y: number;
}

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

function getSelectionLineSegments(
  content: string,
  selectionStart: number,
  selectionEnd: number,
): SelectionRange[] {
  const segments: SelectionRange[] = [];
  let segmentStart = selectionStart;

  for (let index = selectionStart; index < selectionEnd; index += 1) {
    if (content[index] !== '\n') {
      continue;
    }

    if (segmentStart < index) {
      segments.push({ selectionStart: segmentStart, selectionEnd: index });
    }

    segmentStart = index + 1;
  }

  if (segmentStart < selectionEnd) {
    segments.push({ selectionStart: segmentStart, selectionEnd });
  }

  return segments;
}

export function getSelectionToolbarAnchor(
  editor: HTMLTextAreaElement,
  content: string,
  selectionStart: number,
  selectionEnd: number,
): SelectionToolbarAnchor {
  const rect = editor.getBoundingClientRect();
  const startCoords = getCaretCoordinates(editor, selectionStart);
  const endCoords = getCaretCoordinates(editor, selectionEnd);
  const lineSegments = getSelectionLineSegments(content, selectionStart, selectionEnd);

  let anchorLeft = startCoords.left;
  let anchorTop = startCoords.top;

  if (lineSegments.length === 1) {
    anchorLeft = (startCoords.left + endCoords.left) / 2;
  } else if (lineSegments.length > 1) {
    let minLeft = Number.POSITIVE_INFINITY;
    let maxRight = Number.NEGATIVE_INFINITY;
    let minTop = Number.POSITIVE_INFINITY;

    for (const segment of lineSegments) {
      const segmentStartCoords = getCaretCoordinates(editor, segment.selectionStart);
      const segmentEndCoords = getCaretCoordinates(editor, segment.selectionEnd);
      minLeft = Math.min(minLeft, segmentStartCoords.left);
      maxRight = Math.max(maxRight, segmentEndCoords.left);
      minTop = Math.min(minTop, segmentStartCoords.top);
    }

    anchorLeft = (minLeft + maxRight) / 2;
    anchorTop = minTop;
  }

  return {
    x: rect.left + anchorLeft - editor.scrollLeft,
    y: rect.top + anchorTop - editor.scrollTop,
  };
}

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

    const anchor = getSelectionToolbarAnchor(editor, nextContent, selectionStart, selectionEnd);

    setState({
      visible: true,
      x: anchor.x,
      y: anchor.y,
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

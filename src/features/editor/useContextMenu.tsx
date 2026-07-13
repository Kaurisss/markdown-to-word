import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ContextMenuActionItem } from '../../components/ui/context-menu';
import { ToastType } from '../../components/shell/Toast';
import { setEditableSelection as _setEditableSelection, computeEditableSelectionOffsets } from './contentEditableSelection';
import { buildContextMenuItems } from './contextMenuItems';
import { EditorHandle, EditorMode } from '../../types';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuActionItem[];
}

interface UseContextMenuOptions {
  content: string;
  updateContent: (next: string) => void;
  undo: () => void;
  redo: () => void;
  undoStackRef: React.RefObject<string[]>;
  redoStackRef: React.RefObject<string[]>;
  editorRef: React.RefObject<EditorHandle | null>;
  editorMode: EditorMode;
  showToast: (message: string, type?: ToastType) => void;
  enabled: boolean;
}

export function useContextMenu({
  content,
  updateContent,
  undo,
  redo,
  undoStackRef,
  redoStackRef,
  editorRef,
  editorMode,
  showToast,
  enabled,
}: UseContextMenuOptions) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: []
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const lastSelectionRef = useRef<Range | null>(null);
  const lastSelectionRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const anchorNode = selection.anchorNode;
      const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
      const editableRoot = anchorElement?.closest('[contenteditable="true"]') as HTMLElement | null;
      if (!editableRoot) return;
      lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
      lastSelectionRootRef.current = editableRoot;
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [enabled]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!enabled) return;
    e.preventDefault();
    const selection = window.getSelection();
    const target = e.target as HTMLElement;
    const editorTextarea = editorRef.current?.textarea ?? null;
    const isEditorSurface = editorMode === 'edit' && target.closest('.w-md-editor') !== null;
    const textField = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target
      : isEditorSurface
        ? editorTextarea
        : null;
    const editableRoot = target.closest('[contenteditable="true"]') as HTMLElement | null;
    const isEditable = editableRoot !== null || textField !== null;
    if (!isEditable) return;

    const fieldSelectionStart = textField?.selectionStart ?? 0;
    const fieldSelectionEnd = textField?.selectionEnd ?? 0;
    const fieldSelectionText = textField?.value.slice(fieldSelectionStart, fieldSelectionEnd) ?? '';

    // Resolve the effective range inside a contenteditable element.
    const getEditableRange = () => {
      if (textField || !editableRoot) return null;
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editableRoot.contains(range.startContainer)) {
          return range;
        }
      }
      if (lastSelectionRef.current && lastSelectionRootRef.current === editableRoot) {
        return lastSelectionRef.current;
      }
      return null;
    };

    const rangeToRestore = getEditableRange();
    let effectiveRange = rangeToRestore;
    let selectionStart = fieldSelectionStart;
    let selectionEnd = fieldSelectionEnd;
    let selectionText = fieldSelectionText;

    // Compute selection offsets for contenteditable elements.
    if (!textField && editableRoot && effectiveRange) {
      const offsets = computeEditableSelectionOffsets(editableRoot, effectiveRange);
      if (offsets) {
        selectionStart = offsets.selectionStart;
        selectionText = offsets.selectionText;
        selectionEnd = offsets.selectionEnd;
      }
    }

    // Fallback to last known selection when current selection is empty.
    if (!textField && !selectionText && editableRoot && lastSelectionRef.current && lastSelectionRootRef.current === editableRoot) {
      effectiveRange = lastSelectionRef.current;
      const offsets = computeEditableSelectionOffsets(editableRoot, effectiveRange);
      if (offsets) {
        selectionStart = offsets.selectionStart;
        selectionText = offsets.selectionText;
        selectionEnd = offsets.selectionEnd;
      }
    }

    const hasSelection = selectionEnd > selectionStart;

    // Wrapper: sets selection in textField OR contenteditable.
    const setSelection = (start: number, end: number) => {
      if (textField) {
        textField.focus();
        textField.setSelectionRange(start, end);
        return;
      }
      if (editableRoot && selection) {
        _setEditableSelection(editableRoot, selection, start, end);
      }
    };

    // Replace current selection — wired to the active target only.
    const replaceSelection = (value: string) => {
      if (textField) {
        textField.focus();
        textField.setRangeText(value, selectionStart, selectionEnd, 'end');
        textField.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const next = `${content.slice(0, selectionStart)}${value}${content.slice(selectionEnd)}`;
        updateContent(next);
        const nextOffset = selectionStart + value.length;
        requestAnimationFrame(() => setSelection(nextOffset, nextOffset));
      }
    };

    const isEditorField = textField === editorTextarea;
    const canUndoMenu = isEditorField && undoStackRef.current.length > 0;
    const canRedoMenu = isEditorField && redoStackRef.current.length > 0;

    const menuItems = buildContextMenuItems({
      hasSelection,
      isEditable,
      canUndo: canUndoMenu,
      canRedo: canRedoMenu,
      selectAllTarget: textField ?? editableRoot,
      contentLength: content.length,
      selectionText,
      replaceSelection,
      setEditableSelection: setSelection,
      undo,
      redo,
      showToast,
    });

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items: menuItems
    });

    // Restore selection after Radix context menu steals focus.
    if (!textField && editableRoot && selection && effectiveRange) {
      requestAnimationFrame(() => {
        selection.removeAllRanges();
        selection.addRange(effectiveRange);
        editableRoot.focus();
      });
    } else if (textField) {
      requestAnimationFrame(() => {
        textField.focus();
        textField.setSelectionRange(selectionStart, selectionEnd);
      });
    }
  }, [content, enabled, showToast, updateContent, undo, redo, editorMode, editorRef, undoStackRef, redoStackRef]);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}

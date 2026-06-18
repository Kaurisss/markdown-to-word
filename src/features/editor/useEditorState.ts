import { useState, useCallback, useRef } from 'react';
import { loadAutoSavedContent } from '../settings/store';
import { KeyboardShortcutMap, isShortcutMatch } from '../settings/keyboardShortcuts';
import { DEFAULT_MARKDOWN } from '../../constants';

const MAX_HISTORY = 100;

export function useEditorState(autoSave: boolean, shortcuts: KeyboardShortcutMap) {
  const [content, setContent] = useState<string>(() => {
    if (autoSave) {
      const saved = loadAutoSavedContent();
      if (saved !== null) return saved;
    }
    return DEFAULT_MARKDOWN;
  });

  const lastContentRef = useRef<string>(content);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const applyContent = useCallback((next: string) => {
    lastContentRef.current = next;
    setContent(next);
  }, []);

  const syncHistoryState = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  const updateContent = useCallback((next: string) => {
    const prev = lastContentRef.current;
    if (next !== prev) {
      undoStackRef.current.push(prev);
      if (undoStackRef.current.length > MAX_HISTORY) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];
      syncHistoryState();
    }
    applyContent(next);
  }, [applyContent, syncHistoryState]);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop();
    if (previous === undefined) return;
    const current = lastContentRef.current;
    redoStackRef.current.push(current);
    syncHistoryState();
    applyContent(previous);
  }, [applyContent, syncHistoryState]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop();
    if (next === undefined) return;
    const current = lastContentRef.current;
    undoStackRef.current.push(current);
    syncHistoryState();
    applyContent(next);
  }, [applyContent, syncHistoryState]);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isShortcutMatch(e.nativeEvent, shortcuts.undo)) {
      e.preventDefault();
      undo();
      return;
    }

    if (isShortcutMatch(e.nativeEvent, shortcuts.redo)) {
      e.preventDefault();
      redo();
    }
  }, [redo, shortcuts.redo, shortcuts.undo, undo]);

  return {
    content,
    setContent,
    canUndo,
    canRedo,
    updateContent,
    undo,
    redo,
    handleEditorKeyDown,
    undoStackRef,
    redoStackRef,
    lastContentRef,
  };
}

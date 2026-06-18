import { useEffect, RefObject } from 'react';
import {
  isEditableShortcutTarget,
  isShortcutMatch,
  KeyboardShortcutBinding,
  KeyboardShortcutMap,
} from '../settings/keyboardShortcuts';
import { InlineFormatKind } from '../../utils/inlineFormat';

function isBareKey(shortcut: KeyboardShortcutBinding) {
  return !shortcut.ctrl && !shortcut.alt && !shortcut.meta;
}

interface UseGlobalShortcutsParams {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  isConfigWindow: boolean;
  isSettingsWindow: boolean;
  showSearch: boolean;
  shortcuts: KeyboardShortcutMap;
  setShowSearch: (v: boolean) => void;
  setShowReplace: (v: boolean) => void;
  closeSearch: () => void;
  setCaseSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  setWholeWord: React.Dispatch<React.SetStateAction<boolean>>;
  setUseRegex: React.Dispatch<React.SetStateAction<boolean>>;
  onFormat: (kind: InlineFormatKind) => void;
}

export function useGlobalShortcuts({
  editorRef,
  isConfigWindow,
  isSettingsWindow,
  showSearch,
  shortcuts,
  setShowSearch,
  setShowReplace,
  closeSearch,
  setCaseSensitive,
  setWholeWord,
  setUseRegex,
  onFormat,
}: UseGlobalShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isConfigWindow || isSettingsWindow) return;

      // Guard: skip bare-key non-format shortcuts when typing in editable fields
      const inEditable = isEditableShortcutTarget(e.target);

      if (isShortcutMatch(e, shortcuts.selectAll)) {
        if (!inEditable) {
          e.preventDefault();
          const editor = editorRef.current;
          if (editor) {
            editor.focus();
            editor.setSelectionRange(0, editor.value.length);
          }
        }
        return;
      }

      if (isShortcutMatch(e, shortcuts.find)) {
        if (inEditable && isBareKey(shortcuts.find)) return;
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      if (isShortcutMatch(e, shortcuts.replace)) {
        if (inEditable && isBareKey(shortcuts.replace)) return;
        e.preventDefault();
        setShowSearch(true);
        setShowReplace(true);
        return;
      }

      if (showSearch && isShortcutMatch(e, shortcuts.closeSearch)) {
        e.preventDefault();
        closeSearch();
        return;
      }

      if (showSearch && isShortcutMatch(e, shortcuts.searchCaseSensitive)) {
        e.preventDefault();
        setCaseSensitive(prev => !prev);
        return;
      }

      if (showSearch && isShortcutMatch(e, shortcuts.searchWholeWord)) {
        e.preventDefault();
        setWholeWord(prev => !prev);
        return;
      }

      if (showSearch && isShortcutMatch(e, shortcuts.searchRegex)) {
        e.preventDefault();
        setUseRegex(prev => !prev);
        return;
      }

      const editor = editorRef.current;
      if (document.activeElement === editor) {
        if (isShortcutMatch(e, shortcuts.bold)) {
          e.preventDefault();
          onFormat('bold');
          return;
        }
        if (isShortcutMatch(e, shortcuts.italic)) {
          e.preventDefault();
          onFormat('italic');
          return;
        }
        if (isShortcutMatch(e, shortcuts.underline)) {
          e.preventDefault();
          onFormat('underline');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    closeSearch,
    showSearch,
    isConfigWindow,
    isSettingsWindow,
    editorRef,
    shortcuts,
    setShowSearch,
    setShowReplace,
    setCaseSensitive,
    setWholeWord,
    setUseRegex,
    onFormat,
  ]);
}
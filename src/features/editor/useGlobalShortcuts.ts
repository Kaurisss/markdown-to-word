import { useEffect, RefObject } from 'react';

interface UseGlobalShortcutsParams {
  editorRef: RefObject<HTMLTextAreaElement | null>;
  isConfigWindow: boolean;
  isSettingsWindow: boolean;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  setShowReplace: (v: boolean) => void;
  closeSearch: () => void;
  setCaseSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  setWholeWord: React.Dispatch<React.SetStateAction<boolean>>;
  setUseRegex: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useGlobalShortcuts({
  editorRef,
  isConfigWindow,
  isSettingsWindow,
  showSearch,
  setShowSearch,
  setShowReplace,
  closeSearch,
  setCaseSensitive,
  setWholeWord,
  setUseRegex,
}: UseGlobalShortcutsParams) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A: avoid selecting the whole UI document; select editor content instead.
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement | null;
        const isEditableTarget = !!target && (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        );

        if (!isEditableTarget && !isConfigWindow && !isSettingsWindow) {
          e.preventDefault();
          const editor = editorRef.current;
          if (editor) {
            editor.focus();
            editor.setSelectionRange(0, editor.value.length);
          }
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Ctrl+H: open replace
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowSearch(true);
        setShowReplace(true);
      }
      if (e.key === 'Escape' && showSearch) {
        closeSearch();
      }
      // Alt+C: toggle case sensitive
      if (e.altKey && e.key === 'c' && showSearch) {
        e.preventDefault();
        setCaseSensitive(prev => !prev);
      }
      // Alt+W: toggle whole word
      if (e.altKey && e.key === 'w' && showSearch) {
        e.preventDefault();
        setWholeWord(prev => !prev);
      }
      // Alt+R: toggle regex
      if (e.altKey && e.key === 'r' && showSearch) {
        e.preventDefault();
        setUseRegex(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSearch, showSearch, isConfigWindow, isSettingsWindow, editorRef, setShowSearch, setShowReplace, setCaseSensitive, setWholeWord, setUseRegex]);
}

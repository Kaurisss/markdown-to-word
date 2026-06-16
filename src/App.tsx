import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import SearchPopover from './components/SearchPopover';
import Toast, { ToastType } from './components/Toast';
import { StatusBar } from './components/StatusBar';
import { DEFAULT_CONFIG } from './config/defaultConfig';
import { DocumentConfig } from './interfaces/Config';
import { ViewMode } from './types';
import { ContextMenu } from './components/ui/ContextMenu';
import { AIConfigWindow } from './components/AIConfigWindow';
import { SettingsWindow } from './components/SettingsWindow';
import { useAIConfigStore } from './services/aiConfigStore';
import { useSettingsStore } from './services/settingsStore';

import { useEditorState } from './hooks/useEditorState';
import { useSearchReplace } from './hooks/useSearchReplace';
import { useContextMenu } from './hooks/useContextMenu';
import { useFileDrop } from './hooks/useFileDrop';
import { useExport } from './hooks/useExport';
import { useTheme } from './hooks/useTheme';
import { useScrollSync } from './hooks/useScrollSync';
import { useAutoSave } from './hooks/useAutoSave';

const App: React.FC = () => {
  // Simple router based on URL search params
  const [isConfigWindow] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('window') === 'config';
    }
    return false;
  });

  const [isSettingsWindow] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('window') === 'settings';
    }
    return false;
  });

  const { providers, updateProviders, selectedModel, updateSelectedModel } = useAIConfigStore();
  const { settings: appSettings } = useSettingsStore();

  // --- Custom hooks ---
  const {
    content,
    canUndo,
    canRedo,
    updateContent,
    undo,
    redo,
    handleEditorKeyDown,
    undoStackRef,
    redoStackRef,
  } = useEditorState(appSettings.autoSave);

  const {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    showReplace,
    setShowReplace,
    currentMatchIndex,
    setCurrentMatchIndex,
    replaceText,
    setReplaceText,
    caseSensitive,
    setCaseSensitive,
    wholeWord,
    setWholeWord,
    useRegex,
    setUseRegex,
    handleReplace,
    handleReplaceAll,
    closeSearch,
  } = useSearchReplace({ content, updateContent });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  } = useContextMenu({
    content,
    updateContent,
    undo,
    redo,
    undoStackRef,
    redoStackRef,
    editorRef,
    showToast,
    isConfigWindow,
  });

  const handleImport = useCallback((newContent: string) => {
    updateContent(newContent);
  }, [updateContent]);

  const { isFileDragActive } = useFileDrop({
    isConfigWindow,
    showToast,
    onImport: handleImport,
  });

  const [cfg, setCfg] = useState<DocumentConfig>(DEFAULT_CONFIG);
  const [viewMode, setViewMode] = useState<ViewMode>(() => appSettings.defaultViewMode || 'split');

  const { isExporting, handleExport } = useExport({ content, cfg, showToast });

  const { theme, setTheme } = useTheme({
    isConfigWindow,
    isSettingsWindow,
    appSettingsTheme: appSettings.theme,
  });

  useScrollSync({ viewMode, editorRef, previewRef });
  useAutoSave({ content, autoSave: appSettings.autoSave });

  // Clipboard handlers
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
  }, [showToast]);

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
      // Restore cursor
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      });
      showToast('已剪切', 'success');
    } catch (err) {
      console.error('Failed to cut:', err);
      showToast('剪切失败', 'error');
    }
  }, [updateContent, showToast]);

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
      // Move cursor to end of pasted text
      const nextPos = start + text.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(nextPos, nextPos);
      });
    } catch (err) {
      console.error('Failed to paste:', err);
      showToast('无法读取剪贴板', 'error');
    }
  }, [updateContent, showToast]);

  // Global keyboard shortcuts
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
  }, [closeSearch, showSearch, isConfigWindow, isSettingsWindow, setShowSearch, setShowReplace, setCaseSensitive, setWholeWord, setUseRegex]);

  const editorPaneClass = viewMode === 'split'
    ? 'w-1/2 opacity-100'
    : viewMode === 'editor'
      ? 'w-full opacity-100'
      : 'w-0 opacity-0 pointer-events-none';
  const previewPaneClass = viewMode === 'split'
    ? 'w-1/2 opacity-100'
    : viewMode === 'preview'
      ? 'w-full opacity-100'
      : 'w-0 opacity-0 pointer-events-none';

  return isSettingsWindow ? (
    <SettingsWindow />
  ) : isConfigWindow ? (
    <AIConfigWindow />
  ) : (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-sans selection:bg-brand-100 selection:text-brand-900"
      onContextMenu={handleContextMenu}
    >
      <Header
        isExporting={isExporting}
        onExport={handleExport}
        onImport={handleImport}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeChange={setTheme}
        cfg={cfg}
        onCfgChange={setCfg}
        onSearchClick={() => setShowSearch(true)}
        onShowToast={showToast}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onReplaceClick={() => {
          setShowSearch(true);
          setShowReplace(true);
        }}
      />

      <main className="flex-1 flex flex-row overflow-hidden relative">
        <SearchPopover
          visible={showSearch}
          showReplace={showReplace}
          setShowReplace={setShowReplace}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentMatchIndex={currentMatchIndex}
          setCurrentMatchIndex={setCurrentMatchIndex}
          replaceText={replaceText}
          setReplaceText={setReplaceText}
          caseSensitive={caseSensitive}
          setCaseSensitive={setCaseSensitive}
          wholeWord={wholeWord}
          setWholeWord={setWholeWord}
          useRegex={useRegex}
          setUseRegex={setUseRegex}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          onClose={closeSearch}
        />

        {/* Left Pane: Editor */}
        <div
          className={`h-full bg-white dark:bg-dark-bg relative z-0 overflow-hidden flex-shrink-0 transition-opacity duration-600 ease-out ${editorPaneClass}`}
          aria-hidden={viewMode === 'preview'}
        >
          <Editor
            ref={editorRef}
            value={content}
            onChange={updateContent}
            onKeyDown={handleEditorKeyDown}
            searchQuery={searchQuery}
            showSearch={showSearch}
            currentMatchIndex={currentMatchIndex}
            caseSensitive={caseSensitive}
            wholeWord={wholeWord}
            useRegex={useRegex}
          />
        </div>

        {/* Right Pane: Preview */}
        <div
          className={`h-full bg-gray-100 dark:bg-dark-bg relative z-0 overflow-hidden flex-shrink-0 transition-opacity duration-300 ease-out ${previewPaneClass}`}
          aria-hidden={viewMode === 'editor'}
        >
          <Preview ref={previewRef} markdown={content} cfg={cfg} />
        </div>
      </main>

      <StatusBar content={content} onSearchClick={() => setShowSearch(true)} />

      {isFileDragActive && (
        <div className="fixed inset-0 z-[999] pointer-events-none">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-4 border-2 border-dashed border-brand-400 rounded-xl" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="px-4 py-3 rounded-lg bg-white/95 dark:bg-dark-surface/95 border border-gray-200 dark:border-dark-border shadow-lg text-sm text-gray-800 dark:text-gray-100">
              拖入 .md / .markdown / .txt 文件以导入
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={closeContextMenu}
      />
    </div>
  );
};

export default App;

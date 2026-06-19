import React, { useState, useCallback, useRef } from 'react';
import Header from './components/header/Header';
import Editor from './components/editor/Editor';
import Preview from './components/preview/Preview';
import SearchPopover from './components/editor/SearchPopover';
import { showAppToast, ToastType } from './components/shell/Toast';
import { StatusBar } from './components/shell/StatusBar';
import { DEFAULT_CONFIG } from './config/defaultConfig';
import { DocumentConfig } from './types/config';
import { ViewMode } from './types';

import { AIConfigWindow } from './components/ai/AIConfigWindow';
import { SettingsWindow } from './components/settings/SettingsWindow';
import { useAIConfigStore } from './features/ai/store';
import { useSettingsStore } from './features/settings/store';
import { Toaster } from '@/components/ui/sonner';
import { DynamicContextMenu } from '@/components/ui/context-menu';

import { useEditorState } from './features/editor/useEditorState';
import { useSearchReplace } from './features/editor/useSearchReplace';
import { useContextMenu } from './features/editor/useContextMenu';
import { useFileDrop } from './features/editor/useFileDrop';
import { useExport } from './features/export/useExport';
import { useTheme } from './features/settings/useTheme';
import { useScrollSync } from './features/editor/useScrollSync';
import { useAutoSave } from './features/editor/useAutoSave';
import { useSelectionToolbar } from './features/editor/useSelectionToolbar';
import { useClipboard } from './features/editor/useClipboard';
import { useGlobalShortcuts } from './features/editor/useGlobalShortcuts';
import { SelectionToolbar } from './components/editor/SelectionToolbar';

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
  } = useEditorState(appSettings.autoSave, appSettings.keyboardShortcuts);

  const {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    showReplace,
    setShowReplace,
    currentMatchIndex,
    setCurrentMatchIndex,
    matchCount,
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

  const {
    toolbarState,
    refreshSelectionToolbar,
    hideSelectionToolbar,
    applyFormat,
  } = useSelectionToolbar({
    editorRef,
    content,
    updateContent,
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    showAppToast(message, type);
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

  const openSettingsWindow = useCallback(async () => {
    try {
      const label = 'settings';
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const isDark = theme === 'dark';
      const windowBg = isDark ? '#1e1e1e' : '#f9fafb';

      const url = `/?window=settings&theme=${encodeURIComponent(theme)}`;
      const webview = new WebviewWindow(label, {
        url,
        title: '设置',
        width: 580,
        height: 720,
        decorations: false,
        resizable: false,
        center: true,
        visible: false,
        theme,
        backgroundColor: windowBg,
      });

      webview.once('tauri://created', function () {
        void webview.setBackgroundColor(windowBg);
      });

      webview.once('tauri://error', function () {
        import('@tauri-apps/api/window').then(({ Window }) => {
          const win = new Window(label);
          win.setFocus();
        });
      });
    } catch (e) {
      console.error('Failed to open settings window:', e);
    }
  }, [theme]);

  useScrollSync({ viewMode, editorRef, previewRef });
  useAutoSave({ content, autoSave: appSettings.autoSave });

  const { handleCopy, handleCut, handlePaste } = useClipboard({ editorRef, updateContent, showToast });

  useGlobalShortcuts({
    editorRef,
    isConfigWindow,
    isSettingsWindow,
    showSearch,
    shortcuts: appSettings.keyboardShortcuts,
    setShowSearch,
    setShowReplace,
    closeSearch,
    setCaseSensitive,
    setWholeWord,
    setUseRegex,
    onFormat: applyFormat,
  });

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
    <>
      <div
        className="flex flex-col h-screen w-screen overflow-hidden bg-ui-app text-ui-text transition-colors"
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
        onShowToast={showToast}
        onSearchClick={() => setShowSearch(true)}
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
              matchCount={matchCount}
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
              className={`h-full bg-ui-editor relative z-0 overflow-hidden flex-shrink-0 transition-opacity duration-600 ease-out ${editorPaneClass}`}
              aria-hidden={viewMode === 'preview'}
            >
              <Editor
                ref={editorRef}
                value={content}
                onChange={updateContent}
                onKeyDown={handleEditorKeyDown}
                onSelectionChange={refreshSelectionToolbar}
                onEditorBlur={hideSelectionToolbar}
                searchQuery={searchQuery}
                showSearch={showSearch}
                currentMatchIndex={currentMatchIndex}
                caseSensitive={caseSensitive}
                wholeWord={wholeWord}
                useRegex={useRegex}
                fontSize={appSettings.editorFontSize}
                lineHeight={appSettings.editorLineHeight}
                wordWrap={appSettings.editorWordWrap}
              />
            </div>

            {/* Right Pane: Preview */}
            <div
              className={`h-full bg-ui-preview-canvas relative z-0 overflow-hidden flex-shrink-0 transition-opacity duration-300 ease-out ${previewPaneClass}`}
              aria-hidden={viewMode === 'editor'}
            >
              <Preview ref={previewRef} markdown={content} cfg={cfg} />
            </div>
          </main>

          {appSettings.showStatusBar && (
            <StatusBar
              content={content}
              viewMode={viewMode}
              onSearchClick={() => setShowSearch(true)}
              onReplaceClick={() => {
                setShowSearch(true);
                setShowReplace(true);
              }}
              onViewModeChange={setViewMode}
              onExport={handleExport}
              isExporting={isExporting}
              onSettingsClick={openSettingsWindow}
            />
          )}

          {isFileDragActive && (
            <div className="fixed inset-0 z-[999] pointer-events-none">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-4 border-2 border-dashed border-brand-400 rounded-ui-popover" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="px-4 py-3 rounded-ui-popover bg-ui-surface-raised/95 border border-ui-border shadow-ui-popover text-sm text-ui-text">
                  拖入 .md / .markdown / .txt 文件以导入
                </div>
              </div>
            </div>
          )}

          <Toaster closeButton richColors position="top-center" />
        </div>

      <DynamicContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenu.items}
        onClose={closeContextMenu}
      />

      <SelectionToolbar
        visible={toolbarState.visible}
        x={toolbarState.x}
        y={toolbarState.y}
        activeFormats={toolbarState.activeFormats}
        onFormat={applyFormat}
      />
    </>
  );
};

export default App;

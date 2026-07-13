import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/header/Header';
import Editor from './components/editor/Editor';
import Preview from './components/preview/Preview';
import { PreviewStatusInfo } from './components/preview/Preview';
import SearchPopover from './components/editor/SearchPopover';
import { showAppToast, ToastType } from './components/shell/Toast';
import { StatusBar } from './components/shell/StatusBar';
import { loadDocumentConfig, saveDocumentConfig } from './config/documentConfigStorage';
import { DocumentConfig } from './types/config';
import { ViewMode } from './types';

import { AIConfigWindow } from './components/ai/AIConfigWindow';
import { SettingsWindow } from './components/settings/SettingsWindow';
import { useAIConfigStore } from './features/ai/store';
import { useSettingsStore } from './features/settings/store';
import { Toaster } from '@/components/ui/sonner';
import { DynamicContextMenu } from '@/components/ui/context-menu';

import { useEditorState } from './features/editor/useEditorState';
import { useEditorFormatting } from './features/editor/useEditorFormatting';
import { useSearchReplace } from './features/editor/useSearchReplace';
import { useContextMenu } from './features/editor/useContextMenu';
import { useFileDrop } from './features/editor/useFileDrop';
import { useExport } from './features/export/useExport';
import { useTheme } from './features/settings/useTheme';
import { useScrollSync } from './features/editor/useScrollSync';
import { useAutoSave } from './features/editor/useAutoSave';
import { useClipboard } from './features/editor/useClipboard';
import { useGlobalShortcuts } from './features/editor/useGlobalShortcuts';
import { EditorHandle, EditorMode } from './types';

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

  const [previewStatusInfo, setPreviewStatusInfo] = useState<PreviewStatusInfo>({
    status: 'idle',
    pageCount: null,
  });
  const handlePreviewStatusChange = useCallback((info: PreviewStatusInfo) => {
    setPreviewStatusInfo(info);
  }, []);

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

  const editorRef = useRef<EditorHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');
  const { applyFormat } = useEditorFormatting({
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
    editorMode,
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

  const [cfg, setCfg] = useState<DocumentConfig>(() => loadDocumentConfig());
  const [viewMode, setViewMode] = useState<ViewMode>(() => appSettings.defaultViewMode || 'split');

  const { isExporting, handleExport } = useExport({ content, cfg, showToast });

  const { theme, setTheme } = useTheme({
    isConfigWindow,
    isSettingsWindow,
    appSettingsTheme: appSettings.theme,
  });

  useEffect(() => {
    if (isConfigWindow || isSettingsWindow) {
      return;
    }

    setCfg((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        baseFontCn: appSettings.defaultFontCn,
        baseFontEn: appSettings.defaultFontEn,
      },
      styles: {
        ...prev.styles,
        body: {
          ...prev.styles.body,
          fontSize: appSettings.defaultFontSize,
          lineSpacing: appSettings.defaultLineSpacing,
          spaceAfter: appSettings.defaultSpaceAfter,
          alignment: appSettings.defaultAlignment,
        },
      },
    }));
  }, [
    appSettings.defaultAlignment,
    appSettings.defaultFontCn,
    appSettings.defaultFontEn,
    appSettings.defaultFontSize,
    appSettings.defaultLineSpacing,
    appSettings.defaultSpaceAfter,
    isConfigWindow,
    isSettingsWindow,
  ]);

  useEffect(() => {
    if (isConfigWindow || isSettingsWindow) {
      return;
    }

    saveDocumentConfig(cfg);
  }, [cfg, isConfigWindow, isSettingsWindow]);

  useScrollSync({
    enabled: appSettings.scrollSyncEnabled,
    viewMode,
    editorMode,
    editorRef,
    previewRef,
  });
  useAutoSave({ content, autoSave: appSettings.autoSave });

  const { handleCopy, handleCut, handlePaste } = useClipboard({
    editorRef,
    editorMode,
    updateContent,
    showToast,
  });

  useGlobalShortcuts({
    editorRef,
    editorMode,
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
                mode={editorMode}
                onModeChange={setEditorMode}
                theme={theme}
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
              <Preview
                ref={previewRef}
                markdown={content}
                cfg={cfg}
                showStatusBar={appSettings.showStatusBar}
                onPreviewStatusChange={handlePreviewStatusChange}
              />
            </div>
          </main>

          {appSettings.showStatusBar && (
            <StatusBar
              content={content}
              onSearchClick={() => setShowSearch(true)}
              onReplaceClick={() => {
                setShowSearch(true);
                setShowReplace(true);
              }}
              onExport={handleExport}
              isExporting={isExporting}
              previewStatus={previewStatusInfo.status}
              previewPageCount={previewStatusInfo.pageCount}
            />
          )}

          {isFileDragActive && (
            <div className="fixed inset-0 z-[999] pointer-events-none">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-4 border-2 border-dashed border-brand-400 rounded-lg" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="px-4 py-3 rounded-lg bg-ui-surface-raised/95 border border-ui-border shadow-ui-popover text-sm text-ui-text">
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

    </>
  );
};

export default App;

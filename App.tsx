import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { save as saveDialog } from '@tauri-apps/plugin-dialog';
import { DEFAULT_MARKDOWN } from './constants';
import { ViewMode } from './types';
import { DEFAULT_CONFIG } from './config/defaultConfig';
import { DocumentConfig } from './interfaces/Config';
import { exportWithPython, formatErrorMessage } from './services/pythonBackend';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(DEFAULT_MARKDOWN);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [cfg, setCfg] = useState<DocumentConfig>(DEFAULT_CONFIG);

  // 滚动同步相关 refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef<boolean>(false);

  // Handle Import Logic
  const handleImport = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Handle Export Logic
  // Requirements: 1.1 - Invoke Python_Backend with Markdown_Content and Style_Config
  // Requirements: 2.1 - Serialize Style_Config to JSON format
  // Requirements: 2.2 - Apply all specified styles to the generated document
  const handleExport = useCallback(async () => {
    if (!content.trim()) return;

    setIsExporting(true);
    try {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      const suggested = headingMatch ? `${headingMatch[1].trim()}.docx` : `文档_${new Date().toISOString().slice(0, 10)}.docx`;
      const outPath = await saveDialog({
        filters: [{ name: 'Word', extensions: ['docx'] }],
        defaultPath: suggested
      });
      if (!outPath) return;

      const result = await exportWithPython({
        markdown: content,
        outputPath: outPath,
        config: cfg
      });

      if (!result.success) {
        const errorMessage = formatErrorMessage(result);
        console.error("导出失败:", errorMessage);
        alert(errorMessage);
      }

    } catch (error) {
      console.error("导出失败:", error);
      alert("导出过程中发生错误，请检查控制台详情。");
    } finally {
      setIsExporting(false);
    }
  }, [content, cfg]);

  // 同步滚动 effect：仅在分屏模式下启用
  useEffect(() => {
    if (viewMode !== 'split') return;

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    // 编辑区滚动时同步预览区
    const handleEditorScroll = () => {
      if (isScrollingSyncRef.current) return;
      isScrollingSyncRef.current = true;

      const editorScrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
      const previewMaxScroll = preview.scrollHeight - preview.clientHeight;
      preview.scrollTop = editorScrollRatio * previewMaxScroll;

      requestAnimationFrame(() => {
        isScrollingSyncRef.current = false;
      });
    };

    // 预览区滚动时同步编辑区
    const handlePreviewScroll = () => {
      if (isScrollingSyncRef.current) return;
      isScrollingSyncRef.current = true;

      const previewScrollRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
      const editorMaxScroll = editor.scrollHeight - editor.clientHeight;
      editor.scrollTop = previewScrollRatio * editorMaxScroll;

      requestAnimationFrame(() => {
        isScrollingSyncRef.current = false;
      });
    };

    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [viewMode]);

  const showEditor = viewMode === 'editor' || viewMode === 'split';
  const showPreview = viewMode === 'preview' || viewMode === 'split';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Header
        isExporting={isExporting}
        onExport={handleExport}
        onImport={handleImport}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cfg={cfg}
        onCfgChange={setCfg}
      />

      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Pane: Editor */}
        {showEditor && (
          <div className={`h-full bg-white relative z-0 transition-all duration-300 ease-in-out ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Editor ref={editorRef} value={content} onChange={setContent} />
          </div>
        )}

        {/* Right Pane: Preview */}
        {showPreview && (
          <div className={`h-full bg-gray-100 relative z-0 transition-all duration-300 ease-in-out ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Preview ref={previewRef} markdown={content} cfg={cfg} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

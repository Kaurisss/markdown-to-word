import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { generateDocxBlob } from './services/docxGenerator';
import saveAs from 'file-saver';
import { DEFAULT_MARKDOWN } from './constants';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(DEFAULT_MARKDOWN);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // 滚动同步相关 refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef<boolean>(false);

  // Handle Import Logic
  const handleImport = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Handle Export Logic
  const handleExport = useCallback(async () => {
    if (!content.trim()) return;

    setIsExporting(true);
    try {
      // 1. Generate Blob
      const blob = await generateDocxBlob(content);

      // 2. Determine Filename
      const headingMatch = content.match(/^#\s+(.+)$/m);
      const fileName = headingMatch ? headingMatch[1].trim() : `文档_${new Date().toISOString().slice(0, 10)}`;
      const fullFileName = `${fileName}.docx`;

      let fileSaved = false;

      // 3. Try File System Access API
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fullFileName,
            types: [{
              description: 'Word Document',
              accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          fileSaved = true;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            fileSaved = true;
          } else {
            console.warn("File System Access API not available. Falling back to download.", err);
          }
        }
      }

      if (!fileSaved) {
        saveAs(blob, fullFileName);
      }

    } catch (error) {
      console.error("导出失败:", error);
      alert("导出过程中发生错误，请检查控制台详情。");
    } finally {
      setIsExporting(false);
    }
  }, [content]);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden text-gray-800 font-sans">
      <Header
        isExporting={isExporting}
        onExport={handleExport}
        onImport={handleImport}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Pane: Editor */}
        {showEditor && (
          <div className={`h-full bg-white relative z-0 border-r border-gray-200 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Editor ref={editorRef} value={content} onChange={setContent} />
          </div>
        )}

        {/* Right Pane: Preview */}
        {showPreview && (
          <div className={`h-full bg-gray-100 relative z-0 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Preview ref={previewRef} markdown={content} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
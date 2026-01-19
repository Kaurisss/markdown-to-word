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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cfg, setCfg] = useState<DocumentConfig>(DEFAULT_CONFIG);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [replaceText, setReplaceText] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Ctrl+F to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchQuery('');
        setReplaceText('');
        setCurrentMatchIndex(0);
      }
      // Alt+C: 切换区分大小写
      if (e.altKey && e.key === 'c' && showSearch) {
        e.preventDefault();
        setCaseSensitive(prev => !prev);
      }
      // Alt+W: 切换全字匹配
      if (e.altKey && e.key === 'w' && showSearch) {
        e.preventDefault();
        setWholeWord(prev => !prev);
      }
      // Alt+R: 切换正则表达式
      if (e.altKey && e.key === 'r' && showSearch) {
        e.preventDefault();
        setUseRegex(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // Reset match index when search query changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-sans selection:bg-brand-100 selection:text-brand-900">
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
      />

      <main className="flex-1 flex flex-row overflow-hidden relative">
        {/* 搜索和替换框 - 固定在右侧 */}
        <div
          className={`absolute top-4 right-4 z-50 transition-all duration-200 ease-out ${
            showSearch 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-[#f3f3f3] dark:bg-[#252526] border border-[#e5e5e5] dark:border-[#3c3c3c] shadow-lg text-xs">
            {/* 第一行：查找 */}
            <div className="flex items-center">
              {/* 搜索输入框 */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-r border-[#e5e5e5] dark:border-[#3c3c3c]">
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.shiftKey ? setCurrentMatchIndex(prev => Math.max(0, prev - 1)) : setCurrentMatchIndex(prev => prev + 1);
                    }
                  }}
                  placeholder="查找"
                  autoFocus={showSearch}
                  className="w-[200px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
                {searchQuery && (
                  <>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px] whitespace-nowrap">
                      无结果
                    </span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                      title="清除"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* 导航按钮 */}
              <div className="flex items-center border-r border-[#e5e5e5] dark:border-[#3c3c3c]">
                <button
                  onClick={() => setCurrentMatchIndex(prev => Math.max(0, prev - 1))}
                  disabled={!searchQuery}
                  className="px-2 py-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="上一个 (Shift+Enter)"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentMatchIndex(prev => prev + 1)}
                  disabled={!searchQuery}
                  className="px-2 py-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="下一个 (Enter)"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* 工具按钮区 */}
              <div className="flex items-center">
                {/* 大小写按钮 */}
                <button
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  className={`px-2 py-1.5 transition-colors ${
                    caseSensitive 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="区分大小写 (Alt+C)"
                >
                  <span className="font-mono font-semibold text-[11px]">Aa</span>
                </button>

                {/* 全字匹配按钮 */}
                <button
                  onClick={() => setWholeWord(!wholeWord)}
                  className={`px-2 py-1.5 transition-colors ${
                    wholeWord 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="全字匹配 (Alt+W)"
                >
                  <span className="font-mono font-semibold text-[11px]">ab</span>
                </button>

                {/* 正则表达式按钮 */}
                <button
                  onClick={() => setUseRegex(!useRegex)}
                  className={`px-2 py-1.5 transition-colors border-r border-[#e5e5e5] dark:border-[#3c3c3c] ${
                    useRegex 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title="使用正则表达式 (Alt+R)"
                >
                  <span className="font-mono font-semibold text-[11px]">.*</span>
                </button>

                {/* 关闭按钮 */}
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setReplaceText('');
                    setCurrentMatchIndex(0);
                  }}
                  className="px-2 py-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="关闭 (Escape)"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 第二行：替换 */}
            <div className="flex items-center border-t border-[#e5e5e5] dark:border-[#3c3c3c]">
              {/* 替换输入框 */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-r border-[#e5e5e5] dark:border-[#3c3c3c]">
                <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01" />
                </svg>
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="替换"
                  className="w-[200px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
                {replaceText && (
                  <button
                    onClick={() => setReplaceText('')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                    title="清除"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 替换按钮 */}
              <div className="flex items-center gap-1 px-2">
                <button
                  disabled={!searchQuery || !replaceText}
                  className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px]"
                  title="替换 (Enter)"
                >
                  替换
                </button>
                <button
                  disabled={!searchQuery || !replaceText}
                  className="px-2 py-0.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded text-[11px]"
                  title="全部替换 (Ctrl+Enter)"
                >
                  全部替换
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Left Pane: Editor */}
        {showEditor && (
          <div className={`h-full bg-white dark:bg-dark-bg relative z-0 transition-all duration-300 ease-in-out ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Editor 
              ref={editorRef} 
              value={content} 
              onChange={setContent} 
              searchQuery={searchQuery}
              showSearch={showSearch}
              currentMatchIndex={currentMatchIndex}
              caseSensitive={caseSensitive}
              wholeWord={wholeWord}
              useRegex={useRegex}
            />
          </div>
        )}

        {/* Right Pane: Preview */}
        {showPreview && (
          <div className={`h-full bg-gray-100 dark:bg-dark-bg relative z-0 transition-all duration-300 ease-in-out ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Preview ref={previewRef} markdown={content} cfg={cfg} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

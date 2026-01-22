import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import SearchPopover from './components/SearchPopover';
import Toast, { ToastType } from './components/Toast';
import { StatusBar } from './components/StatusBar';
import { save as saveDialog } from '@tauri-apps/plugin-dialog';
import { DEFAULT_MARKDOWN } from './constants';
import { ViewMode } from './types';
import { DEFAULT_CONFIG } from './config/defaultConfig';
import { DocumentConfig } from './interfaces/Config';
import { exportWithPython, formatErrorMessage } from './services/pythonBackend';
import { ContextMenu, ContextMenuItem } from './components/ui/ContextMenu';
import { Copy, Clipboard, Scissors, CheckSquare, Undo2, Redo2 } from 'lucide-react';
import { AIConfigWindow } from './components/AIConfigWindow';
import { useAIConfigStore } from './services/aiConfigStore';

const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;
const MAX_BASENAME_LENGTH = 80;
const MAX_HISTORY = 100;

function sanitizeFilename(input: string, fallback: string): string {
  const trimmed = input.trim().replace(INVALID_FILENAME_CHARS, '_');
  const normalized = trimmed.replace(/\s+/g, ' ').replace(/_+/g, '_');
  const safe = normalized.replace(/[. ]+$/g, '');
  const clipped = safe.slice(0, MAX_BASENAME_LENGTH).replace(/[. ]+$/g, '');
  return clipped.length > 0 ? clipped : fallback;
}

const App: React.FC = () => {
  // Simple router based on URL search params
  const [isConfigWindow, setIsConfigWindow] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('window') === 'config';
    }
    return false;
  });

  const { providers, updateProviders, selectedModel, updateSelectedModel } = useAIConfigStore();

  const [content, setContent] = useState<string>(DEFAULT_MARKDOWN);
  const lastContentRef = useRef<string>(DEFAULT_MARKDOWN);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get('theme');
    if (queryTheme === 'dark' || queryTheme === 'light') {
      return queryTheme;
    }
    const stored = localStorage.getItem('app_theme');
    return stored === 'dark' || stored === 'light' ? stored : 'light';
  });
  const [cfg, setCfg] = useState<DocumentConfig>(DEFAULT_CONFIG);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showReplace, setShowReplace] = useState<boolean>(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [replaceText, setReplaceText] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  const applyContent = useCallback((next: string) => {
    lastContentRef.current = next;
    setContent(next);
  }, []);

  const updateContent = useCallback((next: string) => {
    const prev = lastContentRef.current;
    if (next !== prev) {
      undoStackRef.current.push(prev);
      if (undoStackRef.current.length > MAX_HISTORY) {
        undoStackRef.current.shift();
      }
      redoStackRef.current = [];
    }
    applyContent(next);
  }, [applyContent]);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop();
    if (previous === undefined) return;
    const current = lastContentRef.current;
    redoStackRef.current.push(current);
    applyContent(previous);
  }, [applyContent]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop();
    if (next === undefined) return;
    const current = lastContentRef.current;
    undoStackRef.current.push(current);
    applyContent(next);
  }, [applyContent]);

  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if (key === 'y') {
      e.preventDefault();
      redo();
    }
  }, [redo, undo]);

  const buildSearchRegex = useCallback((query: string): RegExp | null => {
    if (!query) return null;
    try {
      let pattern = query;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (wholeWord && !useRegex) {
        pattern = `\\b${pattern}\\b`;
      }
      const flags = caseSensitive ? 'g' : 'gi';
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  }, [caseSensitive, wholeWord, useRegex]);

  const getMatches = useCallback((text: string) => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const regex = buildSearchRegex(searchQuery.trim());
    if (!regex) return [];
    const found: { index: number; length: number }[] = [];
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      found.push({ index: match.index, length: match[0].length });
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }
    return found;
  }, [searchQuery, buildSearchRegex]);

  const handleReplace = useCallback(() => {
    if (!searchQuery || !searchQuery.trim()) return;
    const matches = getMatches(content);
    if (matches.length === 0) return;
    const index = Math.min(Math.max(currentMatchIndex, 0), matches.length - 1);
    const match = matches[index];
    const next = `${content.slice(0, match.index)}${replaceText}${content.slice(match.index + match.length)}`;
    updateContent(next);
    const newMatches = getMatches(next);
    if (newMatches.length === 0) {
      setCurrentMatchIndex(0);
    } else {
      setCurrentMatchIndex(Math.min(index, newMatches.length - 1));
    }
  }, [searchQuery, replaceText, content, currentMatchIndex, getMatches, updateContent]);

  const handleReplaceAll = useCallback(() => {
    if (!searchQuery || !searchQuery.trim()) return;
    const regex = buildSearchRegex(searchQuery.trim());
    if (!regex) return;
    const next = content.replace(regex, replaceText);
    updateContent(next);
    setCurrentMatchIndex(0);
  }, [searchQuery, replaceText, content, buildSearchRegex, updateContent]);

  // Toolbar Actions
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

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; items: ContextMenuItem[] }>({
    visible: false,
    x: 0,
    y: 0,
    items: []
  });
  const lastSelectionRef = useRef<Range | null>(null);
  const lastSelectionRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isConfigWindow) {
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
  }, [isConfigWindow]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const target = e.target as HTMLElement;
    const textField = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target : null;
    const editableRoot = target.closest('[contenteditable="true"]') as HTMLElement | null;
    const isEditable = editableRoot !== null || textField !== null;
    if (!isEditable) return;

    const fieldSelectionStart = textField?.selectionStart ?? 0;
    const fieldSelectionEnd = textField?.selectionEnd ?? 0;
    const fieldSelectionText = textField?.value.slice(fieldSelectionStart, fieldSelectionEnd) ?? '';

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

    if (!textField && editableRoot && effectiveRange) {
      const preRange = effectiveRange.cloneRange();
      preRange.selectNodeContents(editableRoot);
      preRange.setEnd(effectiveRange.startContainer, effectiveRange.startOffset);
      selectionStart = preRange.toString().length;
      selectionText = effectiveRange.toString();
      selectionEnd = selectionStart + selectionText.length;
    }

    if (!textField && !selectionText && editableRoot && lastSelectionRef.current && lastSelectionRootRef.current === editableRoot) {
      effectiveRange = lastSelectionRef.current;
      const preRange = effectiveRange.cloneRange();
      preRange.selectNodeContents(editableRoot);
      preRange.setEnd(effectiveRange.startContainer, effectiveRange.startOffset);
      selectionStart = preRange.toString().length;
      selectionText = effectiveRange.toString();
      selectionEnd = selectionStart + selectionText.length;
    }

    const hasSelection = selectionEnd > selectionStart;

    const setEditableSelection = (start: number, end: number) => {
      if (textField) {
        textField.focus();
        textField.setSelectionRange(start, end);
        return;
      }
      if (!editableRoot || !selection) return;

      const totalLength = editableRoot.textContent?.length ?? 0;
      const clamp = (value: number) => Math.max(0, Math.min(value, totalLength));
      const startOffset = clamp(start);
      const endOffset = clamp(end);

      const resolveNode = (offset: number) => {
        const walker = document.createTreeWalker(editableRoot, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode() as Text | null;
        let current = 0;
        while (node) {
          const length = node.textContent?.length ?? 0;
          if (current + length >= offset) {
            return { node, offset: offset - current };
          }
          current += length;
          node = walker.nextNode() as Text | null;
        }
        return null;
      };

      const startLoc = resolveNode(startOffset);
      const endLoc = resolveNode(endOffset) ?? startLoc;
      const range = document.createRange();

      if (!startLoc) {
        range.setStart(editableRoot, 0);
        range.collapse(true);
      } else {
        range.setStart(startLoc.node, startLoc.offset);
        if (endLoc) {
          range.setEnd(endLoc.node, endLoc.offset);
        } else {
          range.collapse(true);
        }
      }

      selection.removeAllRanges();
      selection.addRange(range);
      editableRoot.focus();
    };

    const replaceTextFieldRange = (value: string) => {
      if (!textField) return;
      textField.focus();
      textField.setRangeText(value, selectionStart, selectionEnd, 'end');
      textField.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyContentReplacement = (insertText: string) => {
      const next = `${content.slice(0, selectionStart)}${insertText}${content.slice(selectionEnd)}`;
      updateContent(next);
      const nextOffset = selectionStart + insertText.length;
      requestAnimationFrame(() => {
        setEditableSelection(nextOffset, nextOffset);
      });
    };

    const isEditorField = textField === editorRef.current;
    const canUndo = isEditorField && undoStackRef.current.length > 0;
    const canRedo = isEditorField && redoStackRef.current.length > 0;

    const menuItems: ContextMenuItem[] = [
      {
        label: '撤回',
        icon: <Undo2 className="w-4 h-4" />,
        shortcut: 'Ctrl+Z',
        disabled: !canUndo,
        action: () => {
          undo();
        }
      },
      {
        label: '重做',
        icon: <Redo2 className="w-4 h-4" />,
        shortcut: 'Ctrl+Y',
        disabled: !canRedo,
        action: () => {
          redo();
        }
      },
      { separator: true },
      {
        label: '复制',
        icon: <Copy className="w-4 h-4" />,
        shortcut: 'Ctrl+C',
        disabled: !hasSelection,
        action: async () => {
          if (selectionText) {
            await navigator.clipboard.writeText(selectionText);
          }
        }
      },
      {
        label: '剪切',
        icon: <Scissors className="w-4 h-4" />,
        shortcut: 'Ctrl+X',
        disabled: !hasSelection || !isEditable,
        action: async () => {
          if (!selectionText) return;
          await navigator.clipboard.writeText(selectionText);
          if (textField) {
            replaceTextFieldRange('');
          } else {
            applyContentReplacement('');
          }
        }
      },
      {
        label: '粘贴',
        icon: <Clipboard className="w-4 h-4" />,
        shortcut: 'Ctrl+V',
        disabled: !isEditable,
        action: async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            if (textField) {
              replaceTextFieldRange(text);
            } else {
              applyContentReplacement(text);
            }
          } catch (err) {
            console.error('Failed to read clipboard:', err);
            showToast('无法读取剪贴板', 'error');
          }
        }
      },
      { separator: true },
      {
        label: '全选',
        icon: <CheckSquare className="w-4 h-4" />,
        shortcut: 'Ctrl+A',
        action: () => {
          if (textField) {
            textField.focus();
            textField.select();
            return;
          }
          if (editableRoot) {
            setEditableSelection(0, content.length);
          }
        }
      }
    ];

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items: menuItems
    });

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
  }, [content, showToast, updateContent, undo, redo]);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setShowReplace(false);
    setSearchQuery('');
    setReplaceText('');
    setCurrentMatchIndex(0);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme', theme);
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
        closeSearch();
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
  }, [closeSearch, showSearch]);

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
    updateContent(newContent);
  }, [updateContent]);

  // Handle Export Logic
  // Requirements: 1.1 - Invoke Python_Backend with Markdown_Content and Style_Config
  // Requirements: 2.1 - Serialize Style_Config to JSON format
  // Requirements: 2.2 - Apply all specified styles to the generated document
  const handleExport = useCallback(async () => {
    if (!content.trim()) return;

    setIsExporting(true);
    try {
      const headingMatch = content.match(/^#\s+(.+)$/m);
      const dateStamp = new Date().toISOString().slice(0, 10);
      const fallbackName = `文档_${dateStamp}`;
      const title = headingMatch ? headingMatch[1] : fallbackName;
      const suggested = `${sanitizeFilename(title, fallbackName)}.docx`;
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
        showToast(errorMessage, 'error');
      } else {
        showToast("生成成功！文档已保存。");
      }

    } catch (error) {
      console.error("导出失败:", error);
      showToast("导出过程中发生错误，请检查控制台详情。", 'error');
    } finally {
      setIsExporting(false);
    }
  }, [content, cfg, showToast]);

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

  return isConfigWindow ? (
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
        {showEditor && (
          <div className={`h-full bg-white dark:bg-dark-bg relative z-0 transition-all duration-300 ease-in-out ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
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
        )}

        {/* Right Pane: Preview */}
        {showPreview && (
          <div className={`h-full bg-gray-100 dark:bg-dark-bg relative z-0 transition-all duration-300 ease-in-out ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            <Preview ref={previewRef} markdown={content} cfg={cfg} />
          </div>
        )}
      </main>

      <StatusBar content={content} onSearchClick={() => setShowSearch(true)} />

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

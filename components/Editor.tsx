import React, { forwardRef, useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { EditorProps } from '../types';

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(
  ({ 
    value, 
    onChange, 
    searchQuery, 
    currentMatchIndex = 0,
    caseSensitive = false,
    wholeWord = false,
    useRegex = false
  }, ref) => {
    const editableRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // 构建搜索正则表达式
    const buildSearchRegex = useCallback((query: string): RegExp | null => {
      if (!query) return null;
      
      try {
        let pattern = query;
        
        // 如果不是正则模式，转义特殊字符
        if (!useRegex) {
          pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // 如果是全字匹配，添加单词边界
        if (wholeWord && !useRegex) {
          pattern = `\\b${pattern}\\b`;
        }
        
        // 构建正则表达式
        const flags = caseSensitive ? 'g' : 'gi';
        return new RegExp(pattern, flags);
      } catch (e) {
        // 正则表达式无效，返回 null
        console.warn('Invalid regex pattern:', e);
        return null;
      }
    }, [caseSensitive, wholeWord, useRegex]);

    // 计算所有匹配项
    const matches = useMemo(() => {
      if (!searchQuery || !searchQuery.trim()) return [];
      
      const query = searchQuery.trim();
      const regex = buildSearchRegex(query);
      
      if (!regex) return [];
      
      const foundMatches: { index: number; length: number }[] = [];
      let match: RegExpExecArray | null;
      
      // 重置 lastIndex 以确保从头开始搜索
      regex.lastIndex = 0;
      
      while ((match = regex.exec(value)) !== null) {
        foundMatches.push({ index: match.index, length: match[0].length });
        
        // 防止无限循环（当匹配空字符串时）
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
      
      return foundMatches;
    }, [value, searchQuery, buildSearchRegex]);

    // 生成带高亮的 HTML 内容
    const highlightedHTML = useMemo(() => {
      if (!searchQuery || !searchQuery.trim() || matches.length === 0) {
        // 没有搜索时，返回纯文本（需要转义 HTML）
        return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
      }
      
      let html = '';
      let lastIndex = 0;
      
      matches.forEach((match, idx) => {
        // 添加匹配项之前的文本（转义 HTML）
        if (match.index > lastIndex) {
          const textBefore = value.substring(lastIndex, match.index)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br/>');
          html += textBefore;
        }
        
        // 添加高亮的匹配项
        const isCurrentMatch = idx === currentMatchIndex;
        const matchText = value.substring(match.index, match.index + match.length)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
        
        const bgColor = isCurrentMatch 
          ? 'background-color: #fb923c; color: #000;' 
          : 'background-color: #fde047; color: #000;';
        
        html += `<mark style="${bgColor} padding: 0; border-radius: 0;">${matchText}</mark>`;
        
        lastIndex = match.index + match.length;
      });
      
      // 添加最后的文本
      if (lastIndex < value.length) {
        const textAfter = value.substring(lastIndex)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');
        html += textAfter;
      }
      
      return html;
    }, [value, searchQuery, matches, currentMatchIndex]);

    // 处理内容变化
    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
      const newValue = e.currentTarget.textContent || '';
      onChange(newValue);
    }, [onChange]);

    // 同步外部 value 到 contenteditable
    useEffect(() => {
      if (!editableRef.current || isFocused) return;
      
      // 只在非焦点状态下同步（避免打断用户输入）
      const currentText = editableRef.current.textContent || '';
      if (currentText !== value) {
        editableRef.current.innerHTML = highlightedHTML;
      }
    }, [value, highlightedHTML, isFocused]);

    // 高亮变化时更新显示
    useEffect(() => {
      if (!editableRef.current) return;
      
      // 保存光标位置
      const selection = window.getSelection();
      let cursorOffset = 0;
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editableRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorOffset = preCaretRange.toString().length;
      }
      
      // 更新内容
      editableRef.current.innerHTML = highlightedHTML;
      
      // 恢复光标位置
      if (isFocused && selection) {
        try {
          const textNodes: Text[] = [];
          const getTextNodes = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              textNodes.push(node as Text);
            } else {
              node.childNodes.forEach(getTextNodes);
            }
          };
          getTextNodes(editableRef.current);
          
          let currentOffset = 0;
          for (const textNode of textNodes) {
            const textLength = textNode.textContent?.length || 0;
            if (currentOffset + textLength >= cursorOffset) {
              const range = document.createRange();
              range.setStart(textNode, Math.min(cursorOffset - currentOffset, textLength));
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
              break;
            }
            currentOffset += textLength;
          }
        } catch (e) {
          console.warn('Failed to restore cursor position:', e);
        }
      }
    }, [highlightedHTML, isFocused]);

    // 滚动到当前匹配项
    useEffect(() => {
      if (matches.length === 0 || !editableRef.current) return;
      
      const editor = editableRef.current;
      const match = matches[currentMatchIndex];
      
      if (match) {
        // 计算匹配项在文本中的行数
        const textBeforeMatch = value.substring(0, match.index);
        const lines = textBeforeMatch.split('\n');
        const lineNumber = lines.length - 1;
        
        // 计算滚动位置
        const lineHeight = 32; // 对应 leading-8 (8 * 4px = 32px)
        const scrollTop = lineNumber * lineHeight - editor.clientHeight / 2;
        
        editor.scrollTop = Math.max(0, scrollTop);
      }
    }, [currentMatchIndex, matches, value]);

    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-bg relative group transition-colors duration-200">
        <div
          ref={editableRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 w-full h-full p-8 resize-none focus:outline-none font-mono text-[15px] leading-8 text-gray-800 dark:text-gray-200 bg-white dark:bg-dark-bg placeholder-gray-300 dark:placeholder-gray-600 overflow-auto custom-scrollbar transition-colors duration-200 whitespace-pre-wrap break-words"
          spellCheck={false}
          dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          suppressContentEditableWarning
          data-placeholder="# 开始您的写作..."
          style={{
            minHeight: '100%',
          }}
        />
        
        {/* 隐藏的 textarea 用于兼容 ref */}
        <textarea
          ref={ref}
          value={value}
          readOnly
          className="hidden"
          tabIndex={-1}
        />
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export default Editor;
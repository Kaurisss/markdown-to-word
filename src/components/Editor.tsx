﻿import React, { forwardRef, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { EditorProps } from '../types';

type Match = { index: number; length: number };

type ScrollOffset = { top: number; left: number };

const Editor = React.memo(forwardRef<HTMLTextAreaElement, EditorProps>(
  ({
    value,
    onChange,
    onKeyDown,
    onSelectionChange,
    onEditorBlur,
    searchQuery,
    currentMatchIndex = 0,
    caseSensitive = false,
    wholeWord = false,
    useRegex = false
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [scrollOffset, setScrollOffset] = useState<ScrollOffset>({ top: 0, left: 0 });

    const setTextareaRef = useCallback((node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    }, [ref]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      setScrollOffset({ top: target.scrollTop, left: target.scrollLeft });
    }, []);

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
      } catch (e) {
        console.warn('Invalid regex pattern:', e);
        return null;
      }
    }, [caseSensitive, wholeWord, useRegex]);

    const matches = useMemo<Match[]>(() => {
      if (!searchQuery || !searchQuery.trim()) return [];

      const query = searchQuery.trim();
      const regex = buildSearchRegex(query);

      if (!regex) return [];

      const foundMatches: Match[] = [];
      let match: RegExpExecArray | null;

      regex.lastIndex = 0;
      while ((match = regex.exec(value)) !== null) {
        foundMatches.push({ index: match.index, length: match[0].length });
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }

      return foundMatches;
    }, [value, searchQuery, buildSearchRegex]);

    const escapeHtml = useCallback((text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }, []);

    const toHtml = useCallback((text: string) => {
      return escapeHtml(text).replace(/\n/g, '<br/>');
    }, [escapeHtml]);

    const highlightedHTML = useMemo(() => {
      if (!searchQuery || !searchQuery.trim() || matches.length === 0) {
        return toHtml(value);
      }

      let html = '';
      let lastIndex = 0;

      matches.forEach((match, idx) => {
        if (match.index > lastIndex) {
          html += toHtml(value.substring(lastIndex, match.index));
        }

        const isCurrentMatch = idx === currentMatchIndex;
        const matchText = toHtml(value.substring(match.index, match.index + match.length));
        const bgColor = isCurrentMatch ? '#fb923c' : '#fde047';

        html += `<mark style="background-color: ${bgColor}; padding: 0; border-radius: 0; color: transparent;">${matchText}</mark>`;
        lastIndex = match.index + match.length;
      });

      if (lastIndex < value.length) {
        html += toHtml(value.substring(lastIndex));
      }

      return html;
    }, [value, searchQuery, matches, currentMatchIndex, toHtml]);

    useEffect(() => {
      const editor = textareaRef.current;
      if (!editor || matches.length === 0) return;
      const match = matches[currentMatchIndex];
      if (!match) return;

      const textBeforeMatch = value.substring(0, match.index);
      const lines = textBeforeMatch.split('\n');
      const lineNumber = lines.length - 1;

      const computed = window.getComputedStyle(editor);
      const fontSize = parseFloat(computed.fontSize || '16') || 16;
      const parsedLineHeight = parseFloat(computed.lineHeight || '');
      const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.5;
      const scrollTop = lineNumber * lineHeight - editor.clientHeight / 2;

      editor.scrollTop = Math.max(0, scrollTop);
      setScrollOffset({ top: editor.scrollTop, left: editor.scrollLeft });
    }, [currentMatchIndex, matches, value]);

    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-bg relative group transition-colors duration-200">
        <div className="relative flex-1">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="w-full h-full p-8 font-mono text-[15px] leading-8 whitespace-pre-wrap break-words text-transparent"
              style={{
                transform: `translate(${-scrollOffset.left}px, ${-scrollOffset.top}px)`
              }}
              aria-hidden
            >
              <span dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
            </div>
          </div>

          <textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onSelect={onSelectionChange}
            onMouseUp={onSelectionChange}
            onKeyUp={onSelectionChange}
            onBlur={onEditorBlur}
            onScroll={handleScroll}
            className="relative z-10 w-full h-full p-8 resize-none focus:outline-none font-mono text-[15px] leading-8 text-gray-800 dark:text-gray-200 bg-transparent placeholder-gray-300 dark:placeholder-gray-600 overflow-auto custom-scrollbar transition-colors duration-200 whitespace-pre-wrap break-words"
            spellCheck={false}
            placeholder="# 开始您的写作.."
          />
        </div>
      </div>
    );
  }
));

Editor.displayName = 'Editor';

export default Editor;

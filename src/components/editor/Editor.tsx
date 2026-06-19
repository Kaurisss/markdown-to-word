import React, { forwardRef, useCallback, useMemo, useRef, useEffect } from 'react';
import { EditorProps } from '../../types';

type Match = { index: number; length: number };

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
    useRegex = false,
    fontSize = 15,
    lineHeight = 32,
    wordWrap = true
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const setTextareaRef = useCallback((node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    }, [ref]);

    const syncScroll = useCallback(() => {
      const ta = textareaRef.current;
      const ov = overlayRef.current;
      if (ta && ov) {
        ov.scrollTop = ta.scrollTop;
        ov.scrollLeft = ta.scrollLeft;
      }
    }, []);

    const handleScroll = useCallback(() => {
      syncScroll();
    }, [syncScroll]);

    const editorTextStyle = useMemo<React.CSSProperties>(() => ({
      fontSize,
      lineHeight: `${lineHeight}px`,
      overflowWrap: wordWrap ? 'break-word' : 'normal',
      wordBreak: wordWrap ? 'break-word' : 'normal',
      whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
    }), [fontSize, lineHeight, wordWrap]);

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

    const highlightedHTML = useMemo(() => {
      // No <br/> conversion — keep \n as-is. The overlay's white-space:pre-wrap
      // renders \n identically to how the textarea renders it.
      if (!searchQuery || !searchQuery.trim() || matches.length === 0) {
        return escapeHtml(value);
      }

      let html = '';
      let lastIndex = 0;

      matches.forEach((match, idx) => {
        if (match.index > lastIndex) {
          html += escapeHtml(value.substring(lastIndex, match.index));
        }

        const isCurrentMatch = idx === currentMatchIndex;
        const matchText = escapeHtml(value.substring(match.index, match.index + match.length));
        const bgColor = isCurrentMatch ? 'var(--ui-color-search-current)' : 'var(--ui-color-search)';

        html += `<mark style="background-color: ${bgColor}; padding: 0; border-radius: 0; color: transparent;">${matchText}</mark>`;
        lastIndex = match.index + match.length;
      });

      if (lastIndex < value.length) {
        html += escapeHtml(value.substring(lastIndex));
      }

      // Hack to sync textarea and div scrollHeight:
      // A trailing newline in a textarea creates a new blank line, but in a pre-wrap div it does not.
      // Appending an extra newline forces the div to render identical line boxes.
      html += '\n';

      return html;
    }, [value, searchQuery, matches, currentMatchIndex, escapeHtml]);

    // Scroll to current match
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
      syncScroll();
    }, [currentMatchIndex, matches, value, syncScroll]);

    // Sync scroll on content/layout changes
    useEffect(() => {
      syncScroll();
    }, [value, syncScroll]);

    return (
      <div className="flex flex-col h-full bg-ui-editor relative group transition-colors duration-200">
        <div className="relative flex-1">
          {/* Single-div highlight overlay — mirrors every text-layout property of
              the textarea so \n wraps, word-breaks, and scrollbar width all match. */}
          <div
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none overflow-auto invisible-scrollbar p-ui-editor-padding font-ui-editor text-transparent"
            style={editorTextStyle}
            aria-hidden
            dangerouslySetInnerHTML={{ __html: highlightedHTML }}
          />

          <textarea
            ref={setTextareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onSelect={onSelectionChange}
            onMouseUp={onSelectionChange}
            onKeyUp={onSelectionChange}
            onBlur={(event) => {
              window.setTimeout(() => {
                if (document.activeElement !== event.currentTarget) {
                  onEditorBlur?.();
                }
              }, 0);
            }}
            onScroll={handleScroll}
            className="relative z-10 w-full h-full p-ui-editor-padding resize-none focus:outline-none font-ui-editor text-ui-editor-text bg-transparent placeholder-ui-text-subtle overflow-auto custom-scrollbar transition-colors duration-200"
            style={editorTextStyle}
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



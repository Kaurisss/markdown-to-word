import React, { CSSProperties, forwardRef, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { PreviewProps } from '../types';

function ptToPx(pt: number): string {
  return `${(pt * 96) / 72}px`;
}

function hexToRgba(hex: string, alpha: number): string {
  const s = hex.trim().replace(/^#/, '');
  const normalized = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildFontFamily(cfg: PreviewProps['cfg'], elementFontFamily?: string): string {
  const baseCn = cfg.global.baseFontCn?.trim() || 'SimSun';
  // Match backend behavior: fallback to baseFontCn when baseFontEn is empty
  const baseEn = cfg.global.baseFontEn?.trim() || baseCn;
  const parts: string[] = [];

  if (elementFontFamily?.trim()) parts.push(`"${elementFontFamily.trim()}"`);
  parts.push(`"${baseEn}"`, `"${baseCn}"`, '"Microsoft YaHei"', '"Heiti SC"', 'sans-serif');
  return parts.join(', ');
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return extractText(el.props.children);
  }
  return '';
}

function createHeadingComponent(
  Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  style: CSSProperties,
  counter: Map<string, number>
) {
  return ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => {
    const text = extractText(children);
    const baseId = text
      ? text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u00C0-\u024F\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af-]/g, '') || 'heading'
      : 'heading';
    const count = counter.get(baseId) || 0;
    counter.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count}`;
    return <Tag {...props} id={id} style={{ ...style, textIndent: undefined }}>{children}</Tag>;
  };
}

function normalizeLineSpacing(value: number | string): number | string {
  if (typeof value === 'number') return value;
  const ptMatch = value.match(/^([\d.]+)pt$/);
  if (ptMatch) return ptToPx(parseFloat(ptMatch[1]));
  return value;
}

/**
 * Restrictive sanitize schema: only allows standard Markdown-generated tags
 * plus <u> for underline. Does NOT spread defaultSchema to avoid allowing
 * raw HTML tags like img, input, video, etc.
 */
const previewSanitizeSchema = {
  tagNames: [
    // Block elements (from Markdown)
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote',
    // Lists
    'ul', 'ol', 'li',
    // Inline elements (from Markdown)
    'a', 'em', 'strong', 'del', 'code', 'pre',
    // Tables (from GFM)
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    // Text formatting
    'sup', 'sub',
    // Underline (added for our inline formatting)
    'u',
  ],
  attributes: {
    a: ['href', 'title'],
    code: [['className', /^language-./]],
    h2: [['className', 'sr-only']],
    u: [],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
  },
};

function elementStyleToCss(cfg: PreviewProps['cfg'], style: PreviewProps['cfg']['styles']['body']): CSSProperties {
  return {
    fontFamily: buildFontFamily(cfg, style.fontFamily),
    fontSize: ptToPx(style.fontSize),
    color: style.color,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    lineHeight: normalizeLineSpacing(style.lineSpacing),
    marginTop: ptToPx(style.spaceBefore),
    marginBottom: ptToPx(style.spaceAfter),
    textAlign: style.alignment,
    textIndent: style.firstLineIndent ? `${style.firstLineIndent}em` : undefined,
    backgroundColor: style.backgroundColor
  };
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ markdown, cfg }, ref) => {
  const pagePaddingCm = cfg.global.pageMargin * 2.54;
  const pageStyle: CSSProperties = {
    fontFamily: buildFontFamily(cfg),
    padding: `${pagePaddingCm}cm`,
  };

  const bodyStyle = elementStyleToCss(cfg, cfg.styles.body);
  const h1Style = elementStyleToCss(cfg, cfg.styles.h1);
  const h2Style = elementStyleToCss(cfg, cfg.styles.h2);
  const h3Style = elementStyleToCss(cfg, cfg.styles.h3);
  const quoteStyle = elementStyleToCss(cfg, cfg.styles.quote);
  const codeTextColor = cfg.styles.code.color || '#374151';
  const bodyTextColor = cfg.styles.body.color || '#374151';
  const quoteTextColor = cfg.styles.quote.color || '#6b7280';
  // 直接使用配置中的背景色，以与Word输出保持一致
  const codeBg = cfg.styles.code.backgroundColor || hexToRgba(codeTextColor, 0.08);
  const quoteBg = cfg.styles.quote.backgroundColor || hexToRgba(quoteTextColor, 0.06);

  const inlineCodeStyle: CSSProperties = {
    ...elementStyleToCss(cfg, cfg.styles.code),
    backgroundColor: codeBg,
    // 与 Word 一致：无圆角（Word 不支持圆角）
    padding: '0.1em 0.2em',
    borderRadius: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word'
  };
  const codeBlockStyle: CSSProperties = {
    ...elementStyleToCss(cfg, cfg.styles.code),
    backgroundColor: codeBg,
    // 与 Word 输出一致：无圆角，较小内边距
    borderRadius: 0,
    padding: '0.5em',
    overflowX: 'auto'
  };
  const tableBorder = `1px solid ${hexToRgba(bodyTextColor, 0.25)}`;
  // 与 Word 后端一致的表头背景色
  const tableHeadBg = '#e5e7eb';

  // Ref for heading ID deduplication — cleared each render, but the ref itself
  // persists so memoized components always point to the same Map instance.
  const headingIdCounterRef = useRef(new Map<string, number>());
  headingIdCounterRef.current.clear();

  // Memoize the entire components map so ReactMarkdown receives stable references.
  // Without this, React unmounts and remounts every heading/paragraph/code block
  // on each re-render, causing DOM thrash and losing text selection in long documents.
  const markdownComponents = useMemo(() => ({
    h1: createHeadingComponent('h1', h1Style, headingIdCounterRef.current),
    h2: createHeadingComponent('h2', h2Style, headingIdCounterRef.current),
    h3: createHeadingComponent('h3', h3Style, headingIdCounterRef.current),
    // Config only defines h1/h2/h3 styles; backend falls back to h1 for h4-h6
    h4: createHeadingComponent('h4', h1Style, headingIdCounterRef.current),
    h5: createHeadingComponent('h5', h1Style, headingIdCounterRef.current),
    h6: createHeadingComponent('h6', h1Style, headingIdCounterRef.current),
    a: ({ href, onClick, ...props }: any) => {
      const safeHref = typeof href === 'string' ? href : '';
      const isInternal = safeHref.startsWith('#');
      const handleClick: React.MouseEventHandler<HTMLAnchorElement> = async (e) => {
        onClick?.(e);

        // For in-page anchors, keep default behavior.
        if (!safeHref || isInternal) return;

        // Prevent navigating inside the preview webview (otherwise user can't go back).
        e.preventDefault();
        e.stopPropagation();

        // Ask for confirmation before opening external link
        let confirmed = false;
        try {
          const dialog = await import('@tauri-apps/plugin-dialog');
          if (typeof dialog.ask === 'function') {
            confirmed = await dialog.ask(`是否在浏览器中打开此链接？\n\n${safeHref}`, {
              title: '打开外部链接',
              kind: 'info',
              okLabel: '打开',
              cancelLabel: '取消'
            });
          } else {
            confirmed = window.confirm(`是否在浏览器中打开此链接？\n\n${safeHref}`);
          }
        } catch {
          confirmed = window.confirm(`是否在浏览器中打开此链接？\n\n${safeHref}`);
        }

        if (!confirmed) return;

        // Open in system default browser (Tauri) or new tab (browser)
        try {
          const shell = await import('@tauri-apps/plugin-shell');
          if (typeof shell.open === 'function') {
            await shell.open(safeHref);
            return;
          }
        } catch {
          // Not running in Tauri / plugin unavailable.
        }

        window.open(safeHref, '_blank', 'noopener,noreferrer');
      };

      return (
        <a
          {...props}
          href={safeHref}
          onClick={handleClick}
          target={isInternal ? undefined : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
        />
      );
    },
    p: ({ children, ...props }: any) => {
      const firstChild = Array.isArray(children) ? children[0] : children;
      const isTextStart = typeof firstChild === 'string';
      // If paragraph starts with a non-string (Element), it likely starts with MD tag (Bold, etc).
      // In this case, disable the first-line indent.
      const style = isTextStart
        ? bodyStyle
        : { ...bodyStyle, textIndent: 0 };

      return <p {...props} style={style}>{children}</p>;
    },
    li: (props: any) => <li {...props} style={{ ...bodyStyle, marginTop: 0, marginBottom: 0, textIndent: 0 }} />,
    ul: (props: any) => <ul {...props} style={{ ...bodyStyle, paddingLeft: '1.5em', listStyleType: 'disc', marginTop: 0, marginBottom: ptToPx(cfg.styles.body.spaceAfter) }} />,
    ol: (props: any) => <ol {...props} style={{ ...bodyStyle, paddingLeft: '1.5em', listStyleType: 'decimal', marginTop: 0, marginBottom: ptToPx(cfg.styles.body.spaceAfter) }} />,
    blockquote: (props: any) => (
      <blockquote
        {...props}
        style={{
          ...quoteStyle,
          // 与 Word 输出一致：只使用左缩进，不使用边框
          marginLeft: '0.25in',
          paddingLeft: 0,
          textIndent: undefined
        }}
      />
    ),
    code: ({ className, children, node, ...props }: any) => {
      // Detect if this is a fenced code block by checking:
      // 1. node.position spans multiple lines (fenced blocks have opening/closing ```)
      // 2. has language class
      // 3. contains newlines in text
      const startLine = node?.position?.start?.line ?? 0;
      const endLine = node?.position?.end?.line ?? 0;
      const spansMultipleLines = endLine > startLine;

      const text =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
            ? children.map((c: any) => (typeof c === 'string' ? c : '')).join('')
            : '';

      const hasNewline = text.includes('\n');
      const hasLanguageClass = Boolean(className && /language-/.test(className));

      // Fenced code blocks (``` ... ```) always span at least 3 lines in source,
      // or have a language class, or contain newlines
      const isFencedBlock = spansMultipleLines || hasLanguageClass || hasNewline;

      return (
        <code
          {...props}
          className={className}
          style={
            isFencedBlock
              ? {
                ...elementStyleToCss(cfg, cfg.styles.code),
                fontFamily: buildFontFamily(cfg, cfg.styles.code.fontFamily),
                backgroundColor: 'transparent',
                padding: 0,
                borderRadius: 0
              }
              : inlineCodeStyle
          }
        >
          {children}
        </code>
      );
    },
    pre: (props: any) => <pre {...props} style={codeBlockStyle} />,
    hr: (props: any) => {
      const mode = cfg.global.horizontalRule || 'default';
      if (mode === 'hidden') return null;
      if (mode === 'page_break') {
        return (
          <div
            {...props}
            className="my-8 border-t border-dashed border-brand-300 relative h-0 select-none print:break-before-page"
            title="此处将插入分页符"
          >
            <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white dark:bg-dark-bg px-2 text-[10px] text-brand-400 font-mono tracking-widest uppercase">换页符</span>
          </div>
        );
      }
      return <hr {...props} className="my-6 border-t border-gray-300" />;
    },
    table: (props: any) => <table {...props} style={{ width: '100%', borderCollapse: 'collapse' }} />,
    thead: (props: any) => <thead {...props} />,
    tbody: (props: any) => <tbody {...props} />,
    tr: (props: any) => <tr {...props} />,
    th: (props: any) => (
      <th
        {...props}
        style={{
          ...bodyStyle,
          border: tableBorder,
          padding: '0.5rem 0.75rem',
          backgroundColor: tableHeadBg,
          fontWeight: 600,
          textIndent: undefined,
          // 与 Word 一致：默认左对齐，垂直居中
          textAlign: 'left',
          verticalAlign: 'middle'
        }}
      />
    ),
    td: (props: any) => (
      <td
        {...props}
        style={{
          ...bodyStyle,
          border: tableBorder,
          padding: '0.5rem 0.75rem',
          textIndent: undefined,
          // 与 Word 一致：默认左对齐，垂直居中
          textAlign: 'left',
          verticalAlign: 'middle'
        }}
      />
    ),
    u: ({ children, ...props }: any) => (
      <u
        {...props}
        style={{
          textDecorationLine: 'underline',
          textUnderlineOffset: '0.12em',
        }}
      >
        {children}
      </u>
    ),
  }), [h1Style, h2Style, h3Style, bodyStyle, quoteStyle, inlineCodeStyle, codeBlockStyle, tableBorder, tableHeadBg, cfg]);

  return (
    <div className="flex flex-col h-full bg-gray-100/50 dark:bg-dark-bg overflow-hidden relative transition-colors duration-200">
      {/* Background pattern or subtle gradient could go here */}
      <style>{`
        .prose code::before { content: none !important; }
        .prose code::after { content: none !important; }
        .prose p:empty { display: none !important; }
        .prose > *:first-child { margin-top: 0 !important; }
        .prose > *:last-child { margin-bottom: 0 !important; }
      `}</style>

      {/* 
        Container: 滚动容器，通过 ref 暴露给父组件进行同步滚动
      */}
      <div
        ref={ref}
        className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar"
      >
        {/* 
          A4 Paper Simulation: 
          使用 max-w-[21cm] 在宽屏保持 A4 宽度，窄屏时自适应
          min-h-full 确保至少填满容器高度，h-fit 让高度随内容增长
        */}
        <div
          className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/50 w-full max-w-[21cm] min-h-[29.7cm] h-fit p-6 md:p-[2.54cm] text-gray-900 mx-auto transition-transform duration-200"
          style={pageStyle}
        >

          <div className="prose max-w-none">
            {markdown ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeRaw,
                  [rehypeSanitize, previewSanitizeSchema],
                ]}
                components={markdownComponents}
              >
                {markdown}
              </ReactMarkdown>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300 italic select-none">
                预览内容将显示在此处
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;

import React, { CSSProperties, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const baseEn = cfg.global.baseFontEn?.trim() || 'Times New Roman';
  const parts: string[] = [];

  if (elementFontFamily?.trim()) parts.push(`"${elementFontFamily.trim()}"`);
  parts.push(`"${baseEn}"`, `"${baseCn}"`, '"Microsoft YaHei"', '"Heiti SC"', 'sans-serif');
  return parts.join(', ');
}

function elementStyleToCss(cfg: PreviewProps['cfg'], style: PreviewProps['cfg']['styles']['body']): CSSProperties {
  return {
    fontFamily: buildFontFamily(cfg, style.fontFamily),
    fontSize: ptToPx(style.fontSize),
    color: style.color,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    lineHeight: style.lineSpacing,
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
  const codeBg = cfg.styles.code.backgroundColor || hexToRgba(codeTextColor, 0.08);
  const quoteBg = cfg.styles.quote.backgroundColor || hexToRgba(quoteTextColor, 0.06);

  const inlineCodeStyle: CSSProperties = {
    ...elementStyleToCss(cfg, cfg.styles.code),
    backgroundColor: codeBg,
    padding: '0.1em 0.35em',
    borderRadius: '0.25rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word'
  };
  const codeBlockStyle: CSSProperties = {
    ...elementStyleToCss(cfg, cfg.styles.code),
    backgroundColor: codeBg,
    borderRadius: '0.125rem',
    padding: '1rem',
    overflowX: 'auto'
  };
  const tableBorder = `1px solid ${hexToRgba(bodyTextColor, 0.25)}`;
  const tableHeadBg = hexToRgba(bodyTextColor, 0.06);

  return (
    <div className="flex flex-col h-full bg-gray-100/50 overflow-hidden relative">
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
                components={{
                  h1: (props) => <h1 {...props} style={{ ...h1Style, textIndent: undefined }} />,
                  h2: (props) => <h2 {...props} style={{ ...h2Style, textIndent: undefined }} />,
                  h3: (props) => <h3 {...props} style={{ ...h3Style, textIndent: undefined }} />,
                  h4: (props) => <h4 {...props} style={{ ...h3Style, textIndent: undefined }} />,
                  h5: (props) => <h5 {...props} style={{ ...h3Style, textIndent: undefined }} />,
                  h6: (props) => <h6 {...props} style={{ ...h3Style, textIndent: undefined }} />,
                  p: ({ children, ...props }) => {
                    const firstChild = Array.isArray(children) ? children[0] : children;
                    const isTextStart = typeof firstChild === 'string';
                    // If paragraph starts with a non-string (Element), it likely starts with MD tag (Bold, etc).
                    // In this case, disable the first-line indent.
                    const style = isTextStart
                      ? bodyStyle
                      : { ...bodyStyle, textIndent: 0 };
                    return <p {...props} style={style}>{children}</p>;
                  },
                  li: (props) => <li {...props} style={{ ...bodyStyle, marginTop: 0, marginBottom: 0, textIndent: 0 }} />,
                  ul: (props) => <ul {...props} style={{ ...bodyStyle, paddingLeft: '1.5em', listStyleType: 'disc', marginTop: 0, marginBottom: ptToPx(cfg.styles.body.spaceAfter) }} />,
                  ol: (props) => <ol {...props} style={{ ...bodyStyle, paddingLeft: '1.5em', listStyleType: 'decimal', marginTop: 0, marginBottom: ptToPx(cfg.styles.body.spaceAfter) }} />,
                  blockquote: (props) => (
                    <blockquote
                      {...props}
                      style={{
                        ...quoteStyle,
                        borderLeft: `4px solid ${hexToRgba(quoteTextColor, 0.35)}`,
                        paddingLeft: '1rem',
                        backgroundColor: quoteBg,
                        textIndent: undefined
                      }}
                    />
                  ),
                  code: ({ className, children, ...props }) => {
                    const text =
                      typeof children === 'string'
                        ? children
                        : Array.isArray(children)
                          ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
                          : '';
                    const isBlock = Boolean(className && /language-/.test(className)) || text.includes('\n');
                    return (
                      <code
                        {...props}
                        className={className}
                        style={
                          isBlock
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
                  pre: (props) => <pre {...props} style={codeBlockStyle} />,
                  table: (props) => <table {...props} style={{ width: '100%', borderCollapse: 'collapse' }} />,
                  thead: (props) => <thead {...props} />,
                  tbody: (props) => <tbody {...props} />,
                  tr: (props) => <tr {...props} />,
                  th: (props) => (
                    <th
                      {...props}
                      style={{
                        ...bodyStyle,
                        border: tableBorder,
                        padding: '0.5rem 0.75rem',
                        backgroundColor: tableHeadBg,
                        fontWeight: 600,
                        textIndent: undefined
                      }}
                    />
                  ),
                  td: (props) => (
                    <td
                      {...props}
                      style={{
                        ...bodyStyle,
                        border: tableBorder,
                        padding: '0.5rem 0.75rem',
                        textIndent: undefined
                      }}
                    />
                  )
                }}
              >
                {markdown}
              </ReactMarkdown>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300 italic">
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

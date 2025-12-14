import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PreviewProps } from '../types';

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ markdown }, ref) => {
  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider select-none z-10">
        预览效果 (Word 样式)
      </div>

      {/* 
         Style Overrides:
         1. Remove backticks from inline code (Tailwind Typography default).
         2. Reset styling for code blocks (pre > code) to avoid inheriting inline code styles (pink/red).
         3. 行内代码自动换行
         4. 表格样式
      */}
      <style>{`
        .prose code::before { content: none !important; }
        .prose code::after { content: none !important; }
        
        /* Reset code inside pre blocks to neutral style */
        .prose pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border-radius: 0 !important;
          font-weight: 500 !important;
        }
        
        /* 行内代码自动换行 */
        .prose code {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          white-space: pre-wrap !important;
        }
        
        /* 表格样式 */
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        .prose th, .prose td {
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .prose th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .prose tr:nth-child(even) {
          background-color: #f9fafb;
        }
      `}</style>

      {/* 
        Container: 滚动容器，通过 ref 暴露给父组件进行同步滚动
      */}
      <div
        ref={ref}
        className="flex-1 overflow-auto p-4 md:p-8 bg-gray-100"
      >
        {/* 
          A4 Paper Simulation: 
          使用 max-w-[21cm] 在宽屏保持 A4 宽度，窄屏时自适应
          min-h-full 确保至少填满容器高度，h-fit 让高度随内容增长
        */}
        <div
          className="bg-white shadow-sm border border-gray-200 w-full max-w-[21cm] min-h-full h-fit p-6 md:p-[2.54cm] text-gray-900 mx-auto"
          style={{ fontFamily: '"Microsoft YaHei", "Heiti SC", sans-serif' }}
        >

          <div className="
            prose max-w-none 
            prose-headings:text-brand-600 prose-headings:font-bold
            prose-h1:text-2xl prose-h1:mb-6 prose-h1:pb-2 prose-h1:border-b-0
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-3
            prose-li:text-gray-700 prose-li:my-1
            prose-strong:text-gray-900 prose-strong:font-bold
            
            /* Inline Code Styles */
            prose-code:text-[#c7254e] prose-code:bg-[#f9f2f4] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[0.9em] prose-code:font-normal
            
            /* Code Block Wrapper (pre) */
            prose-pre:bg-[#f3f4f6] prose-pre:text-gray-800 prose-pre:border-none prose-pre:rounded-sm prose-pre:p-4 prose-pre:overflow-x-auto
            
            /* Blockquote */
            prose-blockquote:border-l-[4px] prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:bg-transparent prose-blockquote:text-gray-600 prose-blockquote:not-italic prose-blockquote:font-normal
            
            /* Links */
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            
            /* Lists */
            prose-ul:list-disc prose-ul:pl-5
            prose-ol:list-decimal prose-ol:pl-5
          ">
            {markdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
import React, { forwardRef } from 'react';
import { EditorProps } from '../types';

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange }, ref) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-bg relative group transition-colors duration-200">
      {/* Subtle indicator for active focus or just decoration */}
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>

      <textarea
        ref={ref}
        className="flex-1 w-full h-full p-8 resize-none focus:outline-none font-mono text-[15px] leading-8 text-gray-800 dark:text-gray-200 bg-white dark:bg-dark-bg placeholder-gray-300 dark:placeholder-gray-600 custom-scrollbar transition-colors duration-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# 开始您的写作..."
        spellCheck={false}
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
import React, { forwardRef } from 'react';
import { EditorProps } from '../types';

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange }, ref) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider select-none">
        编辑区 (Markdown)
      </div>
      <textarea
        ref={ref}
        className="flex-1 w-full h-full p-6 resize-none focus:outline-none font-mono text-[15px] leading-relaxed text-gray-800 bg-white placeholder-gray-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入 Markdown 内容..."
        spellCheck={false}
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
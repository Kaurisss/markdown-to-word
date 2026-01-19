import React, { useMemo } from 'react';
import { Search } from 'lucide-react';

interface StatusBarProps {
  content: string;
  onSearchClick?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ content, onSearchClick }) => {
  const stats = useMemo(() => {
    const chars = content.length;
    // 排除所有空白字符（空格、换行、制表符等）
    const charsNoSpace = content.replace(/\s/g, '').length;
    // 行数：按换行符分割，至少有1行
    const lines = content ? content.split('\n').length : 0;
    // 段落：按双换行符分割，过滤空段落
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

    return { chars, charsNoSpace, lines, paragraphs };
  }, [content]);

  return (
    <div className="h-6 flex-shrink-0 bg-[#f3f3f3] dark:bg-[#252526] border-t border-[#e5e5e5] dark:border-[#3c3c3c] flex items-center justify-between px-3 text-xs text-gray-600 dark:text-gray-400 select-none">
      <div className="flex items-center gap-4">
        <span>字符: {stats.chars}</span>
        <span>字符(不含空格): {stats.charsNoSpace}</span>
        <span>行数: {stats.lines}</span>
        <span>段落: {stats.paragraphs}</span>
      </div>
      
      <div className="flex items-center">
        <div 
          onClick={onSearchClick}
          className="flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
        >
          <Search className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

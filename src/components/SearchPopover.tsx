import React from 'react';
import { Search2Line, Transfer3Line, CloseLine, ArrowDownCircleLine, ArrowRightCircleLine, ArrowUpCircleLine } from '@mingcute/react';
import { Separator } from '@/components/ui/separator';

export type SearchPopoverProps = {
  visible: boolean;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  currentMatchIndex: number;
  setCurrentMatchIndex: React.Dispatch<React.SetStateAction<number>>;
  replaceText: string;
  setReplaceText: React.Dispatch<React.SetStateAction<string>>;
  caseSensitive: boolean;
  setCaseSensitive: React.Dispatch<React.SetStateAction<boolean>>;
  wholeWord: boolean;
  setWholeWord: React.Dispatch<React.SetStateAction<boolean>>;
  useRegex: boolean;
  setUseRegex: React.Dispatch<React.SetStateAction<boolean>>;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
  showReplace: boolean;
  setShowReplace: (show: boolean) => void;
};

const SearchPopover: React.FC<SearchPopoverProps> = ({
  visible,
  searchQuery,
  setSearchQuery,
  currentMatchIndex,
  setCurrentMatchIndex,
  replaceText,
  setReplaceText,
  caseSensitive,
  setCaseSensitive,
  wholeWord,
  setWholeWord,
  useRegex,
  setUseRegex,
  onReplace,
  onReplaceAll,
  onClose,
  showReplace,
  setShowReplace,
}) => {
  return (
    <div
      className={`absolute top-4 right-4 z-50 transition-all duration-300 ease-out transform ${visible
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        }`}
    >
      <div className="w-[380px] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-2xl p-3 flex flex-col gap-3 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">

        {/* Search Row */}
        <div className="flex items-center gap-2">
          {/* Expand/Collapse Replace */}
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-colors"
          >
            {showReplace ? <ArrowDownCircleLine className="w-4 h-4" /> : <ArrowRightCircleLine className="w-4 h-4" />}
          </button>

          {/* Search Input Wrapper */}
          <div className="relative flex-1 group">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <Search2Line className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.shiftKey
                    ? setCurrentMatchIndex((prev) => Math.max(0, prev - 1))
                    : setCurrentMatchIndex((prev) => prev + 1);
                }
              }}
              placeholder="查找..."
              autoFocus={visible}
              className="w-full h-9 pl-9 pr-24 bg-gray-50 dark:bg-dark-element border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />

            {/* Input Actions (Clear + Toggles) */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-dark-element-hover transition-colors mr-1"
                  title="清除"
                >
                  <CloseLine className="w-3 h-3" />
                </button>
              )}

              <Separator orientation="vertical" className="h-4 mx-0.5" />

              <button
                onClick={() => setCaseSensitive((prev) => !prev)}
                className={`p-1 rounded-md transition-colors ${caseSensitive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                title="区分大小写 (Alt+C)"
              >
                <span className="font-mono font-bold text-[10px] leading-none">Aa</span>
              </button>

              <button
                onClick={() => setWholeWord((prev) => !prev)}
                className={`p-1 rounded-md transition-colors ${wholeWord
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                title="全词匹配 (Alt+W)"
              >
                <span className="font-mono font-bold text-[10px] leading-none">ab</span>
              </button>

              <button
                onClick={() => setUseRegex((prev) => !prev)}
                className={`p-1 rounded-md transition-colors ${useRegex
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                title="使用正则表达式 (Alt+R)"
              >
                <span className="font-mono font-bold text-[10px] leading-none">.*</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element border border-gray-200 dark:border-dark-border rounded-lg p-0.5 h-9">
            <button
              onClick={() => setCurrentMatchIndex((prev) => Math.max(0, prev - 1))}
              disabled={!searchQuery}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-dark-element-hover rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow"
              title="上一个 (Shift+Enter)"
            >
              <ArrowUpCircleLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMatchIndex((prev) => prev + 1)}
              disabled={!searchQuery}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-dark-element-hover rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow"
              title="下一个 (Enter)"
            >
              <ArrowDownCircleLine className="w-4 h-4" />
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded-lg transition-colors"
            title="关闭 (Escape)"
          >
            <CloseLine className="w-4 h-4" />
          </button>
        </div>

        {/* Replace Row */}
        {showReplace && (
          <div className="flex items-center gap-2 ml-8">
            {/* Replace Input */}
            <div className="relative flex-1 group">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                <Transfer3Line className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (e.ctrlKey || e.metaKey) {
                    onReplaceAll();
                  } else {
                    onReplace();
                  }
                }}
                placeholder="替换..."
                className="w-full h-9 pl-9 pr-8 bg-gray-50 dark:bg-dark-element border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              {replaceText && (
                <button
                  onClick={() => setReplaceText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-dark-element-hover transition-colors"
                  title="清除"
                >
                  <CloseLine className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Replace Actions */}
            <div className="flex items-center gap-2">
              <button
                disabled={!searchQuery}
                className="h-9 px-3 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-element border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-element-hover hover:border-gray-300 dark:hover:border-gray-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                title="替换 (Enter)"
                onClick={onReplace}
              >
                替换
              </button>
              <button
                disabled={!searchQuery}
                className="h-9 px-3 text-xs font-medium text-brand-50 dark:text-brand-50 bg-brand-600 hover:bg-brand-700 border border-transparent rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                title="全部替换 (Ctrl+Enter)"
                onClick={onReplaceAll}
              >
                全部替换
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPopover;

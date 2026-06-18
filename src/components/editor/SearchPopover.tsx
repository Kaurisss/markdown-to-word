import React from 'react';
import { Search2Line, Transfer3Line, CloseLine, ArrowDownLine, ArrowRightLine, ArrowUpLine } from '@mingcute/react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowReplace(!showReplace)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showReplace ? <ArrowDownLine className="w-4 h-4" /> : <ArrowRightLine className="w-4 h-4" />}
          </Button>

          {/* Search Input Wrapper */}
          <div className="relative flex-1 group">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500 transition-colors z-10 pointer-events-none">
              <Search2Line className="w-4 h-4" />
            </div>
            <Input
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
              className="w-full h-9 !pl-9 !pr-[104px] bg-gray-50 dark:bg-dark-element border-gray-200 dark:border-dark-border"
            />

            {/* Input Actions (Clear + Toggles) */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground mr-1"
                  title="清除"
                >
                  <CloseLine className="w-3 h-3" />
                </Button>
              )}

              <Separator orientation="vertical" className="h-4 mx-0.5" />

              <Toggle
                size="sm"
                pressed={caseSensitive}
                onPressedChange={setCaseSensitive}
                className="h-6 w-6 p-0 rounded-sm data-[state=on]:bg-brand-50 data-[state=on]:text-brand-600 dark:data-[state=on]:bg-brand-900/30 dark:data-[state=on]:text-brand-400"
                title="区分大小写 (Alt+C)"
              >
                <span className="font-mono font-bold text-[10px] leading-none">Aa</span>
              </Toggle>

              <Toggle
                size="sm"
                pressed={wholeWord}
                onPressedChange={setWholeWord}
                className="h-6 w-6 p-0 rounded-sm data-[state=on]:bg-brand-50 data-[state=on]:text-brand-600 dark:data-[state=on]:bg-brand-900/30 dark:data-[state=on]:text-brand-400"
                title="全词匹配 (Alt+W)"
              >
                <span className="font-mono font-bold text-[10px] leading-none">ab</span>
              </Toggle>

              <Toggle
                size="sm"
                pressed={useRegex}
                onPressedChange={setUseRegex}
                className="h-6 w-6 p-0 rounded-sm data-[state=on]:bg-brand-50 data-[state=on]:text-brand-600 dark:data-[state=on]:bg-brand-900/30 dark:data-[state=on]:text-brand-400"
                title="使用正则表达式 (Alt+R)"
              >
                <span className="font-mono font-bold text-[10px] leading-none">.*</span>
              </Toggle>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element border border-gray-200 dark:border-dark-border rounded-lg p-0.5 h-9">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMatchIndex((prev) => Math.max(0, prev - 1))}
              disabled={!searchQuery}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background"
              title="上一个 (Shift+Enter)"
            >
              <ArrowUpLine className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMatchIndex((prev) => prev + 1)}
              disabled={!searchQuery}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-background"
              title="下一个 (Enter)"
            >
              <ArrowDownLine className="w-4 h-4" />
            </Button>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            title="关闭 (Escape)"
          >
            <CloseLine className="w-4 h-4" />
          </Button>
        </div>

        {/* Replace Row */}
        {showReplace && (
          <div className="flex items-center gap-2 ml-8">
            {/* Replace Input */}
            <div className="relative flex-1 group">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500 transition-colors z-10 pointer-events-none">
                <Transfer3Line className="w-4 h-4" />
              </div>
              <Input
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
                className="w-full h-9 !pl-9 !pr-8 bg-gray-50 dark:bg-dark-element border-gray-200 dark:border-dark-border"
              />
              {replaceText && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setReplaceText('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  title="清除"
                >
                  <CloseLine className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Replace Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={!searchQuery}
                className="h-9 px-3 text-sm bg-gray-50 dark:bg-dark-element border-gray-200 dark:border-dark-border"
                title="替换 (Enter)"
                onClick={onReplace}
              >
                替换
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={!searchQuery}
                className="h-9 px-3 text-sm"
                title="全部替换 (Ctrl+Enter)"
                onClick={onReplaceAll}
              >
                全部替换
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPopover;

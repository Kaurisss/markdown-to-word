import React from 'react';
import { Search2Line, CloseLine, ArrowUpLine, ArrowDownLine, RightLine, DownLine, TransferHorizontalLine } from '@mingcute/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

export type SearchPopoverProps = {
  visible: boolean;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  currentMatchIndex: number;
  setCurrentMatchIndex: React.Dispatch<React.SetStateAction<number>>;
  matchCount: number;
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

const toggleActiveClass =
  'text-ui-text-subtle data-[state=on]:bg-gray-200/70 data-[state=on]:text-ui-text-subtle dark:data-[state=on]:bg-white/10 dark:data-[state=on]:text-ui-text-subtle';

const SearchPopover: React.FC<SearchPopoverProps> = ({
  visible,
  searchQuery,
  setSearchQuery,
  currentMatchIndex,
  setCurrentMatchIndex,
  matchCount,
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
  const hasQuery = searchQuery.length > 0;
  const noResults = hasQuery && matchCount === 0;

  return (
    <div
      className={`absolute top-3 right-4 z-50 transition-all duration-200 ease-out ${visible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
    >
      <div className="bg-ui-surface/95 dark:bg-dark-surface/95 border border-ui-border dark:border-dark-border rounded-xl shadow-xl backdrop-blur-sm p-2.5 grid grid-cols-[auto_280px_auto] gap-x-2 gap-y-2 items-center">

        {/* ── Row 1 ── */}
        {/* Expand / collapse replace */}
        <button
          onClick={() => setShowReplace(!showReplace)}
          className="w-6 h-6 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors shrink-0"
          title={showReplace ? '折叠替换' : '展开替换'}
        >
          {showReplace
            ? <DownLine className="w-4 h-4" />
            : <RightLine className="w-4 h-4" />}
        </button>

        {/* Search input */}
        <div className="relative min-w-0">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-text-subtle pointer-events-none z-10">
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
            placeholder="查找"
            autoFocus={visible}
            className={`h-[32px] w-full !pl-8 !pr-[104px] text-[13px] rounded-md ${noResults
              ? 'border-red-400 dark:border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500'
              : ''
              }`}
          />
          {/* Inline toggles */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors"
                title="清除"
              >
                <CloseLine className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center gap-px">
              <Toggle
                size="sm"
                pressed={caseSensitive}
                onPressedChange={setCaseSensitive}
                className={`h-[24px] w-[24px] min-w-0 p-0 rounded-sm hover:bg-ui-control-hover dark:hover:bg-white/10 ${toggleActiveClass}`}
                title="区分大小写 (Alt+C)"
              >
                <span className="font-mono font-semibold text-[11px] leading-none">Aa</span>
              </Toggle>
              <Toggle
                size="sm"
                pressed={wholeWord}
                onPressedChange={setWholeWord}
                className={`h-[24px] w-[24px] min-w-0 p-0 rounded-sm hover:bg-ui-control-hover dark:hover:bg-white/10 ${toggleActiveClass}`}
                title="全词匹配 (Alt+W)"
              >
                <span className="font-mono font-semibold text-[11px] leading-none">ab</span>
              </Toggle>
              <Toggle
                size="sm"
                pressed={useRegex}
                onPressedChange={setUseRegex}
                className={`h-[24px] w-[24px] min-w-0 p-0 rounded-sm hover:bg-ui-control-hover dark:hover:bg-white/10 ${toggleActiveClass}`}
                title="正则表达式 (Alt+R)"
              >
                <span className="font-mono font-semibold text-[11px] leading-none">.*</span>
              </Toggle>
            </div>
          </div>
        </div>

        {/* Search Right Controls */}
        <div className="flex items-center gap-1.5 justify-end min-w-0">
          {/* Match count */}
          <span
            className={`shrink-0 text-[12px] tabular-nums min-w-[52px] text-center select-none ${noResults
              ? 'text-red-500 dark:text-red-400'
              : 'text-ui-text-muted'
              }`}
          >
            {!hasQuery
              ? ''
              : noResults
                ? '无结果'
                : `${currentMatchIndex + 1} / ${matchCount}`}
          </span>

          {/* Prev / Next */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setCurrentMatchIndex((prev) => Math.max(0, prev - 1))}
              disabled={!hasQuery}
              className="w-7 h-7 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="上一个 (Shift+Enter)"
            >
              <ArrowUpLine className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMatchIndex((prev) => prev + 1)}
              disabled={!hasQuery}
              className="w-7 h-7 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="下一个 (Enter)"
            >
              <ArrowDownLine className="w-4 h-4" />
            </button>
          </div>

          {/* Close */}
          <div className="pl-1 border-l border-gray-200 dark:border-gray-700 ml-0.5">
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors shrink-0"
              title="关闭 (Escape)"
            >
              <CloseLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Row 2 ── */}
        {showReplace && (
          <>
            {/* Spacer */}
            <div className="w-6 shrink-0" />

            {/* Replace input */}
            <div className="relative min-w-0">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-text-subtle pointer-events-none z-10">
                <TransferHorizontalLine className="w-4 h-4" />
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
                placeholder="替换"
                className="h-[32px] w-full !pl-8 text-[13px] rounded-md"
              />
              {replaceText && (
                <button
                  onClick={() => setReplaceText('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors"
                  title="清除"
                >
                  <CloseLine className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Replace Controls */}
            <div className="flex items-center gap-2 w-full shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasQuery}
                className="flex-1 text-[12px] h-[32px] px-0"
                title="替换 (Enter)"
                onClick={onReplace}
              >
                替换
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={!hasQuery}
                className="flex-1 text-[12px] h-[32px] px-0 bg-brand-500 hover:bg-brand-600 text-white border-0"
                title="全部替换 (Ctrl+Enter)"
                onClick={onReplaceAll}
              >
                全部替换
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPopover;

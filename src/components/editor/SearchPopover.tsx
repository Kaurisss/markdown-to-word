import React from 'react';
import { Search2Line, CloseLine, ArrowUpLine, ArrowDownLine, RightLine, DownLine } from '@mingcute/react';
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
  'data-[state=on]:bg-brand-50 data-[state=on]:text-brand-600 dark:data-[state=on]:bg-brand-900/30 dark:data-[state=on]:text-brand-400';

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
      className={`absolute top-0 right-4 z-50 transition-all duration-200 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <div className="bg-ui-surface/95 dark:bg-dark-surface/95 border border-ui-border dark:border-dark-border rounded-b-lg shadow-lg backdrop-blur-sm py-1.5 px-1.5 flex flex-col">

        {/* ── Row 1: Search ── */}
        <div className="flex items-center gap-1">

          {/* Expand / collapse replace */}
          <button
            onClick={() => setShowReplace(!showReplace)}
            className="w-5 h-5 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors shrink-0"
            title={showReplace ? '折叠替换' : '展开替换'}
          >
            {showReplace
              ? <DownLine className="w-3.5 h-3.5" />
              : <RightLine className="w-3.5 h-3.5" />}
          </button>

          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-ui-text-subtle pointer-events-none z-10">
              <Search2Line className="w-3.5 h-3.5" />
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
              className={`h-[30px] !pl-7 !pr-[100px] text-[13px] rounded-md ${
                noResults
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
                  <CloseLine className="w-3 h-3" />
                </button>
              )}
              <div className="flex items-center gap-px">
                <Toggle
                  size="sm"
                  pressed={caseSensitive}
                  onPressedChange={setCaseSensitive}
                  className={`h-[22px] w-[22px] min-w-0 p-0 rounded-sm hover:bg-ui-control-hover dark:hover:bg-white/10 ${toggleActiveClass}`}
                  title="区分大小写 (Alt+C)"
                >
                  <span className="font-mono font-semibold text-[10px] leading-none">Aa</span>
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={wholeWord}
                  onPressedChange={setWholeWord}
                  className={`h-[22px] w-[22px] min-w-0 p-0 rounded-sm hover:bg-ui-control-hover dark:hover:bg-white/10 ${toggleActiveClass}`}
                  title="全词匹配 (Alt+W)"
                >
                  <span className="font-mono font-semibold text-[10px] leading-none">ab</span>
                </Toggle>
                <Toggle
                  size="sm"
                  pressed={useRegex}
                  onPressedChange={setUseRegex}
                  className={`h-[22px] w-[22px] min-w-0 p-0 rounded-sm hover:bg-ui-control-hover dark:hover:bg-white/10 ${toggleActiveClass}`}
                  title="正则表达式 (Alt+R)"
                >
                  <span className="font-mono font-semibold text-[10px] leading-none">.*</span>
                </Toggle>
              </div>
            </div>
          </div>

          {/* Match count */}
          <span
            className={`shrink-0 text-[11px] tabular-nums min-w-[52px] text-center select-none ${
              noResults
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
              className="w-6 h-6 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="上一个 (Shift+Enter)"
            >
              <ArrowUpLine className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentMatchIndex((prev) => prev + 1)}
              disabled={!hasQuery}
              className="w-6 h-6 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="下一个 (Enter)"
            >
              <ArrowDownLine className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors shrink-0"
            title="关闭 (Escape)"
          >
            <CloseLine className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Row 2: Replace ── */}
        {showReplace && (
          <div className="flex items-center gap-1 mt-1">

            {/* Spacer aligned with chevron */}
            <div className="w-5 shrink-0" />

            {/* Replace input */}
            <div className="relative flex-1 min-w-0">
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
                className="h-[30px] text-[13px] rounded-md"
              />
              {replaceText && (
                <button
                  onClick={() => setReplaceText('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-ui-text-muted hover:text-ui-text hover:bg-ui-control-hover transition-colors"
                  title="清除"
                >
                  <CloseLine className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Replace / Replace All */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="xs"
                disabled={!hasQuery}
                className="text-[11px] h-[30px] px-2"
                title="替换 (Enter)"
                onClick={onReplace}
              >
                替换
              </Button>
              <Button
                variant="default"
                size="xs"
                disabled={!hasQuery}
                className="text-[11px] h-[30px] px-2 bg-brand-500 hover:bg-brand-600 text-white border-0"
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

import React from 'react';
import { DownSmallFill } from '@mingcute/react';

interface SpinnerInputProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
}

export const SpinnerInput = ({ value, onChange, step = 1, min, max, suffix, className = 'w-20' }: SpinnerInputProps) => {
  const decimals = step < 1 ? Math.max(1, String(step).split('.')[1]?.length ?? 1) : 0;
  const displayVal = decimals > 0 ? value.toFixed(decimals) : String(value);

  const adjust = (delta: number) => {
    let next = parseFloat((value + delta).toFixed(decimals));
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onChange(next);
  };

  return (
    <div className={`flex items-center border border-gray-200 dark:border-dark-border rounded-md bg-white dark:bg-dark-element overflow-hidden h-8 ${className}`}>
      <input
        className="flex-1 min-w-0 text-[13px] text-center border-0 bg-transparent outline-none focus-visible:ring-0 h-full dark:text-gray-100 px-1"
        value={displayVal}
        onChange={(e) => {
          const raw = e.target.value.trim();
          if (raw === '' || raw === '-') return;
          const num = parseFloat(raw);
          if (isNaN(num)) return;
          let v = decimals > 0 ? parseFloat(num.toFixed(decimals)) : Math.round(num);
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }}
      />
      {suffix && (
        <span className="text-[11px] text-ui-text-muted pr-0.5 flex-shrink-0 select-none">{suffix}</span>
      )}
      <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 flex-shrink-0 h-full">
        <button type="button" className="flex items-center justify-center w-6 flex-1 text-ui-text-muted hover:text-ui-text hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-colors border-b border-gray-200 dark:border-gray-700" onClick={() => adjust(step)} tabIndex={-1}>
          <DownSmallFill className="w-4 h-4 rotate-180" />
        </button>
        <button type="button" className="flex items-center justify-center w-6 flex-1 text-ui-text-muted hover:text-ui-text hover:bg-gray-100 dark:hover:bg-dark-element-hover transition-colors" onClick={() => adjust(-step)} tabIndex={-1}>
          <DownSmallFill className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

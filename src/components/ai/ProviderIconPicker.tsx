import React from 'react';
import { CloseLine } from '@mingcute/react';
import { cn } from '@/lib/utils';
import { ProviderIcon } from './ProviderIcon';
import { PROVIDER_ICON_KEYS, PROVIDER_ICON_LABELS } from './providerIcons';

interface ProviderIconPickerProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export function ProviderIconPicker({ value, onChange, compact }: ProviderIconPickerProps) {
  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="ui-field-label">供应商图标</div>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex h-6 items-center gap-1 rounded-sm px-1.5 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
            >
              <CloseLine className="size-3.5" />
              清除
            </button>
          )}
        </div>
      )}
      <div
        className={cn('grid', compact ? 'grid-cols-6 gap-1.5' : 'grid-cols-4 gap-2')}
        onWheel={(e) => e.stopPropagation()}
      >
        {PROVIDER_ICON_KEYS.map((iconKey) => {
          const selected = value === iconKey;
          return (
            <button
              key={iconKey}
              type="button"
              onClick={() => onChange(iconKey)}
              className={cn(
                'flex items-center justify-center rounded-xl border transition-all cursor-pointer',
                compact
                  ? 'size-11'
                  : 'h-16 flex-col gap-1 text-[11px]',
                selected
                  ? 'border-brand-500 bg-brand-50/80 text-brand-700 dark:border-brand-600 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm ring-1 ring-brand-500/20'
                  : 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-element text-ui-text-muted hover:bg-gray-100 dark:hover:bg-dark-element-hover hover:text-ui-text'
              )}
              aria-pressed={selected}
              title={PROVIDER_ICON_LABELS[iconKey]}
            >
              <ProviderIcon iconKey={iconKey} name={PROVIDER_ICON_LABELS[iconKey]} size={compact ? 20 : 22} />
              {!compact && <span className="max-w-full truncate px-1">{PROVIDER_ICON_LABELS[iconKey]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

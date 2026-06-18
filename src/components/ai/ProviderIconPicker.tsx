import React from 'react';
import { CloseLine } from '@mingcute/react';
import { cn } from '@/lib/utils';
import { ProviderIcon } from './ProviderIcon';
import { PROVIDER_ICON_KEYS, PROVIDER_ICON_LABELS } from './providerIcons';

interface ProviderIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProviderIconPicker({ value, onChange }: ProviderIconPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="ui-field-label">供应商图标</div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex h-6 items-center gap-1 rounded-ui-control px-1.5 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
          >
            <CloseLine className="size-3.5" />
            清除
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PROVIDER_ICON_KEYS.map((iconKey) => {
          const selected = value === iconKey;
          return (
            <button
              key={iconKey}
              type="button"
              onClick={() => onChange(iconKey)}
              className={cn(
                'flex h-16 flex-col items-center justify-center gap-1 rounded-ui-panel border text-[11px] transition-colors',
                selected
                  ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  : 'border-ui-border bg-ui-control text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text'
              )}
              aria-pressed={selected}
            >
              <ProviderIcon iconKey={iconKey} name={PROVIDER_ICON_LABELS[iconKey]} size={22} />
              <span className="max-w-full truncate px-1">{PROVIDER_ICON_LABELS[iconKey]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

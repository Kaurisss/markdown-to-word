import React, { useState } from 'react';
import { CloseLine, DownLine } from '@mingcute/react';
import { Button } from '../../../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../../../ui/popover';
import { Textarea } from '../../../ui/textarea';
import { cn } from '../../../../lib/utils';

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const PROMPT_EXAMPLES = [
  {
    label: '公文风格',
    value: '正文仿宋三号，标题黑体小二加粗，行距1.5倍',
  },
  {
    label: '技术文档',
    value: '正文宋体小四，标题微软雅黑小三，代码块灰色背景',
  },
  {
    label: '论文排版',
    value: '正文宋体小四，一级标题黑体三号居中，段前段后间距适中',
  },
];

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = '描述文档样式...',
}) => {
  const [open, setOpen] = useState(false);
  const preview = value.trim() || placeholder;

  const submit = () => {
    const cleanedValue = value.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    if (disabled || !cleanedValue) return;
    
    if (cleanedValue !== value) {
      onChange(cleanedValue);
    }
    
    setTimeout(() => {
      onSubmit();
      setOpen(false);
    }, 0);
  };

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        onChange(value);
      }
    }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          className={cn(
            'flex h-7 w-full min-w-[320px] max-w-[520px] items-center justify-between gap-2 rounded-ui-control border border-ui-border bg-ui-control px-3 text-left text-[13px] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:ring-offset-0',
            value.trim() ? 'text-ui-text' : 'text-ui-text-subtle'
          )}
          aria-label={preview}
        >
          <span className="truncate">{preview}</span>
          <DownLine className="size-3.5 shrink-0 text-ui-text-subtle" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[var(--radix-popover-trigger-width)] p-3 z-[10000]">
        <PopoverHeader className="mb-2">
          <PopoverTitle className="flex items-center justify-between text-[13px]">
            <span>描述样式</span>
            {value.trim() && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex h-6 items-center gap-1 rounded-ui-control px-1.5 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
              >
                <CloseLine className="size-3.5" />
                清空
              </button>
            )}
          </PopoverTitle>
        </PopoverHeader>

        <Textarea
          aria-label="详细描述样式"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="min-h-[112px] resize-none text-[13px]"
          placeholder="例如：正文仿宋三号，标题黑体小二加粗，行距1.5倍。也可以描述页边距、代码块、引用、标题层级。"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              submit();
            }
          }}
        />

        <div className="mt-3">
          <div className="mb-1 text-[11px] text-ui-text-subtle">范例</div>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_EXAMPLES.map(example => (
              <button
                key={example.label}
                type="button"
                className="h-7 rounded-ui-control border border-ui-border bg-ui-control px-2 text-[12px] text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
                onClick={() => onChange(example.value)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-ui-text-subtle">Ctrl+Enter 生成。生成会覆盖当前样式设置。</div>
          <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white" onClick={submit} disabled={disabled || !value.trim()}>
            生成样式
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

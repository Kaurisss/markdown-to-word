import React, { useMemo, useState } from 'react';
import { CheckLine, DownLine, Settings1Line } from '@mingcute/react';
import { AIProvider } from '../../../../types/ai';
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../../../ui/popover';
import { Separator } from '../../../ui/separator';
import { cn } from '../../../../lib/utils';
import { ProviderIcon } from '../../../ai/ProviderIcon';

interface AIModelSelectorProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  onModelChange: (model: { providerId: string; modelId: string } | null) => void;
  onConfigClick: () => void;
}

function getSelectedModelLabel(
  providers: AIProvider[],
  selectedModel: { providerId: string; modelId: string } | null
) {
  if (!selectedModel) return null;
  const provider = providers.find(item => item.id === selectedModel.providerId);
  const model = provider?.models.find(item => item.id === selectedModel.modelId);
  if (!provider || !model) return null;
  return {
    providerName: provider.name,
    modelName: model.name,
    isEnabled: provider.isEnabled,
    hasApiKey: Boolean(provider.apiKey.trim()),
  };
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  aiProviders,
  selectedModel,
  onModelChange,
  onConfigClick,
}) => {
  const [open, setOpen] = useState(false);
  const enabledProviders = useMemo(
    () => aiProviders.filter(provider => provider.isEnabled),
    [aiProviders]
  );
  const selected = getSelectedModelLabel(enabledProviders, selectedModel);
  const hasSelectableModels = enabledProviders.some(provider => provider.models.length > 0);
  const triggerLabel = selected?.modelName || (hasSelectableModels ? '选择模型' : '配置模型');
  const statusClass = selected?.isEnabled && selected?.hasApiKey
    ? 'bg-green-500'
    : selected
      ? 'bg-amber-500'
      : 'bg-ui-text-subtle';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex h-7 w-44 items-center justify-between gap-1.5 rounded-ui-control border border-ui-border bg-ui-control px-ui-control-x text-ui-text transition-colors hover:bg-ui-control-hover"
          aria-label={triggerLabel}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className={cn('size-1.5 shrink-0 rounded-full', statusClass)} />
            <span className="truncate text-left text-[13px]">{triggerLabel}</span>
          </span>
          <span className="text-ui-text-subtle group-hover:text-ui-text-muted transition-colors">
            <DownLine className="size-3.5 shrink-0" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={6} className="w-80 p-2 z-[10000]">
        <PopoverHeader className="px-1 pb-2">
          <PopoverTitle className="flex items-center justify-between text-[13px]">
            <span>选择模型</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTimeout(() => onConfigClick(), 150);
              }}
              className="inline-flex h-6 items-center justify-center gap-1 rounded-ui-control px-1.5 text-[12px] font-medium text-ui-text-muted hover:bg-ui-control-hover hover:text-ui-text"
            >
              <Settings1Line className="size-3.5 shrink-0" />
              <span className="leading-none mt-px">AI 配置</span>
            </button>
          </PopoverTitle>
        </PopoverHeader>

        {enabledProviders.length === 0 ? (
          <div className="rounded-ui-panel border border-ui-border-subtle bg-ui-surface-subtle px-3 py-4 text-center text-[13px] text-ui-text-muted">
            <div>没有已启用的平台</div>
            <button
              type="button"
              className="mt-2 h-7 rounded-ui-control bg-brand-500 px-3 text-[13px] font-medium text-white hover:bg-brand-600"
              onClick={() => {
                setOpen(false);
                setTimeout(() => onConfigClick(), 150);
              }}
            >
              打开 AI 配置
            </button>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto pr-1">
            {enabledProviders.map((provider, index) => (
              <div key={provider.id}>
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <ProviderIcon
                    providerId={provider.id}
                    name={provider.name}
                    iconKey={provider.iconKey}
                    size={14}
                  />
                  <span className="text-[11px] font-medium text-ui-text-subtle">{provider.name}</span>
                </div>
                {provider.models.length === 0 ? (
                  <div className="px-2 py-1.5 text-[12px] text-ui-text-subtle">暂无模型</div>
                ) : (
                  provider.models.map(model => {
                    const isSelected = selectedModel?.providerId === provider.id && selectedModel.modelId === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        className={cn(
                          'flex h-8 w-full items-center justify-between rounded-ui-control px-2 text-left text-[13px] transition-colors hover:bg-ui-control-hover',
                          isSelected && 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                        )}
                        aria-label={model.name}
                        onClick={() => {
                          onModelChange({ providerId: provider.id, modelId: model.id });
                          setOpen(false);
                        }}
                      >
                        <span className="min-w-0 truncate">{model.name}</span>
                        {isSelected && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px]">
                            <CheckLine className="size-3.5" />
                            已选择
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

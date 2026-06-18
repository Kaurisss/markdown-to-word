import React from 'react';
import {
  Alibaba,
  Anthropic,
  DeepSeek,
  Gemini,
  Github,
  Google,
  Grok,
  Moonshot,
  Ollama,
  OpenAI,
  Qwen,
  SiliconCloud,
  Zhipu,
} from '@lobehub/icons';
import { cn } from '@/lib/utils';
import {
  DEFAULT_PROVIDER_ICON_BY_ID,
  ProviderIconKey,
  getProviderInitials,
  isProviderIconKey,
} from './providerIcons';

// NOTE: Not all @lobehub/icons exports have a .Color sub-component.
// Icons with .Color: Alibaba, DeepSeek, Gemini, Google, Qwen, SiliconCloud
// Icons without .Color (use base Mono): Anthropic, Github, Grok, Moonshot, Ollama, OpenAI, Zhipu
const ICON_COMPONENTS: Record<ProviderIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  alibaba: Alibaba.Color,
  anthropic: Anthropic,
  deepseek: DeepSeek.Color,
  gemini: Gemini.Color,
  github: Github,
  google: Google.Color,
  grok: Grok,
  moonshot: Moonshot,
  ollama: Ollama,
  openai: OpenAI,
  qwen: Qwen.Color,
  siliconflow: SiliconCloud.Color,
  zhipu: Zhipu,
};

interface ProviderIconProps {
  providerId?: string;
  name: string;
  iconKey?: string;
  size?: number;
  className?: string;
}

export function ProviderIcon({
  providerId,
  name,
  iconKey,
  size = 20,
  className,
}: ProviderIconProps) {
  const resolvedKey = isProviderIconKey(iconKey)
    ? iconKey
    : providerId
      ? DEFAULT_PROVIDER_ICON_BY_ID[providerId]
      : undefined;

  if (resolvedKey) {
    const Icon = ICON_COMPONENTS[resolvedKey];
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-ui-control', className)}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Icon size={size} />
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-ui-control bg-ui-surface-subtle text-[10px] font-semibold text-ui-text-muted', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {getProviderInitials(name)}
    </span>
  );
}

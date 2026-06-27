import React from 'react';
import {
  Anthropic,
  Baichuan,
  Bailian,
  ChatGLM,
  Claude,
  DeepSeek,
  Doubao,
  Gemini,
  Grok,
  Groq,
  Hailuo,
  Hunyuan,
  InternLM,
  Kling,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  Nvidia,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  Qwen,
  SiliconCloud,
  Spark,
  Wenxin,
  XAI,
  Yi,
  Zhipu,
} from '@lobehub/icons';
import { cn } from '@/lib/utils';
import {
  DEFAULT_PROVIDER_ICON_BY_ID,
  ProviderIconKey,
  getProviderInitials,
  isProviderIconKey,
} from './providerIcons';

const ICON_COMPONENTS: Record<ProviderIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  anthropic: Anthropic,
  baichuan: Baichuan.Color,
  bailian: Bailian.Color,
  chatglm: ChatGLM.Color,
  claude: Claude.Color,
  deepseek: DeepSeek.Color,
  doubao: Doubao.Color,
  gemini: Gemini.Color,
  grok: Grok,
  groq: Groq,
  hailuo: Hailuo.Color,
  hunyuan: Hunyuan.Color,
  internlm: InternLM.Color,
  kling: Kling.Color,
  meta: Meta.Color,
  minimax: Minimax.Color,
  mistral: Mistral.Color,
  moonshot: Moonshot,
  nvidia: Nvidia.Color,
  ollama: Ollama,
  openai: OpenAI,
  openrouter: OpenRouter,
  perplexity: Perplexity.Color,
  qwen: Qwen.Color,
  siliconcloud: SiliconCloud.Color,
  spark: Spark.Color,
  wenxin: Wenxin.Color,
  xai: XAI,
  yi: Yi.Color,
  zhipu: Zhipu.Color,
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

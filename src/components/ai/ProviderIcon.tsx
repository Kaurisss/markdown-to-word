import React from 'react';
import {
  Alibaba,
  Anthropic,
  Aws,
  Azure,
  Baichuan,
  ChatGLM,
  Cerebras,
  Claude,
  Cloudflare,
  CodeGeeX,
  Cohere,
  Copilot,
  Cursor,
  DeepInfra,
  DeepSeek,
  Dify,
  Doubao,
  Fireworks,
  Gemini,
  Github,
  GoogleCloud,
  Grok,
  Groq,
  Hailuo,
  HuggingFace,
  Hunyuan,
  Hyperbolic,
  InternLM,
  Kling,
  LangChain,
  MetaAI,
  Meta,
  Minimax,
  Mistral,
  Moonshot,
  Nvidia,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  Phind,
  Qwen,
  Replicate,
  Runway,
  SambaNova,
  SiliconCloud,
  Skywork,
  Spark,
  Stability,
  Stepfun,
  Together,
  Trae,
  VertexAI,
  Wenxin,
  Windsurf,
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

// Icons with .Color sub-component use full-color brand logos.
// Icons without .Color fall back to monochrome.
const ICON_COMPONENTS: Record<ProviderIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  alibaba: Alibaba.Color,
  anthropic: Anthropic,
  aws: Aws.Color,
  azure: Azure.Color,
  baichuan: Baichuan.Color,
  chatglm: ChatGLM.Color,
  cerebras: Cerebras.Color,
  claude: Claude.Color,
  cloudflare: Cloudflare.Color,
  codegeex: CodeGeeX.Color,
  cohere: Cohere.Color,
  copilot: Copilot.Color,
  cursor: Cursor,
  deepinfra: DeepInfra.Color,
  deepseek: DeepSeek.Color,
  dify: Dify.Color,
  doubao: Doubao.Color,
  fireworks: Fireworks.Color,
  gemini: Gemini.Color,
  github: Github,
  googlecloud: GoogleCloud.Color,
  grok: Grok,
  groq: Groq,
  hailuo: Hailuo.Color,
  huggingface: HuggingFace.Color,
  hunyuan: Hunyuan.Color,
  hyperbolic: Hyperbolic.Color,
  internlm: InternLM.Color,
  kling: Kling.Color,
  langchain: LangChain.Color,
  llama: MetaAI.Color,
  meta: Meta.Color,
  minimax: Minimax.Color,
  mistral: Mistral.Color,
  moonshot: Moonshot,
  nvidia: Nvidia.Color,
  ollama: Ollama,
  openai: OpenAI,
  openrouter: OpenRouter,
  perplexity: Perplexity.Color,
  phind: Phind,
  qwen: Qwen.Color,
  replicate: Replicate,
  runway: Runway,
  sambanova: SambaNova.Color,
  siliconflow: SiliconCloud.Color,
  skywork: Skywork.Color,
  spark: Spark.Color,
  stability: Stability.Color,
  stepfun: Stepfun.Color,
  together: Together.Color,
  trae: Trae.Color,
  vertexai: VertexAI.Color,
  wenxin: Wenxin.Color,
  windsurf: Windsurf,
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

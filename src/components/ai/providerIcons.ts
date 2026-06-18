export const PROVIDER_ICON_KEYS = [
  'alibaba',
  'anthropic',
  'deepseek',
  'gemini',
  'github',
  'google',
  'grok',
  'moonshot',
  'ollama',
  'openai',
  'qwen',
  'siliconflow',
  'zhipu',
] as const;

export type ProviderIconKey = typeof PROVIDER_ICON_KEYS[number];

export const PROVIDER_ICON_LABELS: Record<ProviderIconKey, string> = {
  alibaba: '阿里云',
  anthropic: 'Anthropic',
  deepseek: 'DeepSeek',
  gemini: 'Gemini',
  github: 'GitHub',
  google: 'Google',
  grok: 'Grok',
  moonshot: 'Moonshot',
  ollama: 'Ollama',
  openai: 'OpenAI',
  qwen: 'Qwen',
  siliconflow: '硅基流动',
  zhipu: '智谱',
};

export const DEFAULT_PROVIDER_ICON_BY_ID: Record<string, ProviderIconKey> = {
  dashscope: 'alibaba',
  siliconflow: 'siliconflow',
  zhipu: 'zhipu',
  deepseek: 'deepseek',
  moonshot: 'moonshot',
  openai: 'openai',
  google: 'gemini',
};

export function isProviderIconKey(value: string | undefined): value is ProviderIconKey {
  return !!value && (PROVIDER_ICON_KEYS as readonly string[]).includes(value);
}

export function getProviderInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const asciiWords = trimmed.match(/[A-Za-z0-9]+/g);
  if (asciiWords && asciiWords.length > 0) {
    return asciiWords.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  }
  return Array.from(trimmed).slice(0, 2).join('');
}

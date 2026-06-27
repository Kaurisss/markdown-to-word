export const PROVIDER_ICON_KEYS = [
  'anthropic',
  'baichuan',
  'bailian',
  'chatglm',
  'claude',
  'deepseek',
  'doubao',
  'gemini',
  'grok',
  'groq',
  'hailuo',
  'hunyuan',
  'internlm',
  'kling',
  'meta',
  'minimax',
  'mistral',
  'moonshot',
  'nvidia',
  'ollama',
  'openai',
  'openrouter',
  'perplexity',
  'qwen',
  'siliconcloud',
  'spark',
  'wenxin',
  'xai',
  'yi',
  'zhipu',
] as const;

export type ProviderIconKey = typeof PROVIDER_ICON_KEYS[number];

export const PROVIDER_ICON_LABELS: Record<ProviderIconKey, string> = {
  anthropic: 'Anthropic',
  baichuan: '百川',
  bailian: 'BaiLian',
  chatglm: 'ChatGLM',
  claude: 'Claude',
  deepseek: 'DeepSeek',
  doubao: '豆包',
  gemini: 'Gemini',
  grok: 'Grok',
  groq: 'Groq',
  hailuo: 'Hailuo',
  hunyuan: '混元',
  internlm: 'InternLM',
  kling: 'Kling',
  meta: 'Meta',
  minimax: 'MiniMax',
  mistral: 'Mistral',
  moonshot: 'Moonshot',
  nvidia: 'NVIDIA',
  ollama: 'Ollama',
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
  perplexity: 'Perplexity',
  qwen: 'Qwen',
  siliconcloud: 'SiliconCloud',
  spark: 'Spark',
  wenxin: '文心',
  xai: 'xAI',
  yi: 'Yi',
  zhipu: '智谱',
};

export const DEFAULT_PROVIDER_ICON_BY_ID: Record<string, ProviderIconKey> = {
  dashscope: 'bailian',
  siliconflow: 'siliconcloud',
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

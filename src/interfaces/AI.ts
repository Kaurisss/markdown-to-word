export interface AIModel {
  id: string;
  name: string;
}

export interface AIProvider {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  apiKey: string;
  baseUrl: string;
  models: AIModel[];
  isCustom?: boolean;
}

export const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'dashscope',
    name: '阿里云百炼',
    description: '阿里云大模型服务平台，提供 Qwen 系列模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { id: 'qwen-plus', name: 'Qwen-Plus' },
      { id: 'qwen-flash', name: 'Qwen-Flash' },
      { id: 'qwen-max', name: 'Qwen-Max' }, 
    ]
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    description: '硅基流动服务商，提供 Qwen 系列模型 与 DeepSeek 模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B-Instruct' },
      { id: 'Qwen/Qwen3-8B', name: 'Qwen3-8B' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1' },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
    ]
  },
  {
    id: 'zhipu',
    name: '智谱开放平台',
    description: '智谱开放平台服务商，提供 GLM 系列模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { id: 'glm-4.6-flash', name: 'GLM-4.6-Flash' },
      { id: 'glm-4.5-flash', name: 'GLM-4.5-Flash' },
      { id: 'glm-4.5-air', name: 'GLM-4.5-Air' },
    ]
  },
  {
    id: 'deepseek',
    name: '深度求索',
    description: 'DeepSeek服务商，提供DeepSeek-Chat 与 DeepSeek-Reasoner 模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    models: [
      { id: 'deepseek-chat', name: 'Deepseek-Chat' },
      { id: 'deepseek-reasoner', name: 'Deepseek-Reasoner' },
    ]
  },
  {
    id: 'moonshot',
    name: '月之暗面',
    description: '月之暗面服务商，提供 Kimi 模型 与 Moonshot 模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { id: 'kimi-k2-0711-preview', name: 'Kimi-K2-0711-Preview' },
      { id: 'moonshot-v1-auto', name: 'Moonshot-V1-Auto' },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI服务商，提供 GPT 系列模型 与 o系列 模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini' },
      { id: 'o4-mini', name: 'o4-mini' },
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Google Gemini 服务商，提供 Gemini 系列模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini-1.5-Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini-1.5-Flash' },
    ]
  }
];

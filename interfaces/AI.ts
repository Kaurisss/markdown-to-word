export interface AIModel {
  id: string;
  name: string;
}

export interface AIProvider {
  id: string;
  name: string;
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
    isEnabled: true,
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { id: 'qwen-plus', name: 'qwen-plus' },
      { id: 'qwen-turbo', name: 'qwen-turbo' },
      { id: 'qwen-max', name: 'qwen-max' },
    ]
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    models: []
  },
  {
    id: 'zhipu',
    name: '智谱AI',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: []
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    models: [
      { id: 'deepseek-chat', name: 'deepseek-chat' },
      { id: 'deepseek-coder', name: 'deepseek-coder' },
    ]
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: []
  },
  {
    id: 'openai',
    name: 'OpenAI',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o', name: 'gpt-4o' },
      { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo' },
    ]
  },
  {
    id: 'google',
    name: 'Google Gemini',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: [
      { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro' },
      { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash' },
    ]
  }
];

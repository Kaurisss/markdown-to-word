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
    description: '阿里云大模型服务平台，专为企业打造的大模型服务与应用开发平台',
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
    description: '全场景产品矩阵，支撑 AI 应用全流程落地，助力用户一站式实现 AI 能力与应用的快速对接',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B-Instruct' },
      { id: 'Qwen/Qwen3-8B', name: 'Qwen3-8B' },
    ]
  },
  {
    id: 'zhipu',
    name: '智谱开放平台',
    description: 'Z智谱·一站式大模型开发平台',
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
    name: 'DeepSeek',
    description: '专注于代码理解与生成的国产模型',
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
    description: 'Kimi 技术提供商，支持长文本处理',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: []
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'ChatGPT 开发商，提供 GPT 系列模型',
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
    description: 'Google 的下一代多模态模型',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: [
      { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro' },
      { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash' },
    ]
  }
];

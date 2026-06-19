export interface ApiEndpointExample {
  provider: string;
  url: string;
  note: string;
}

export const AI_API_GUIDE = {
  supportedProtocol: '支持 OpenAI-compatible Chat Completions API。',
  baseUrlRule: 'Base URL 需要填写完整请求端点，通常以 /chat/completions 结尾；不要只填域名或 /v1。',
  authRule: 'API Key 会作为 Authorization: Bearer <API Key> 发送。',
  requestShape: '测试连接会向 Base URL 发起 POST 请求，请求体包含 model、messages、max_tokens、stream:false。',
  unsupportedRule: '暂不直接支持原生 Gemini、Anthropic Messages、SSE-only 或非 chat/completions 接口；这些服务需要使用其 OpenAI 兼容地址。',
};

export const AI_API_ENDPOINT_EXAMPLES: ApiEndpointExample[] = [
  {
    provider: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    note: 'OpenAI 官方 Chat Completions 端点',
  },
  {
    provider: '阿里云百炼',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    note: '百炼 OpenAI 兼容模式',
  },
  {
    provider: '硅基流动',
    url: 'https://api.siliconflow.cn/v1/chat/completions',
    note: '硅基流动 OpenAI 兼容端点',
  },
  {
    provider: 'Google Gemini OpenAI 兼容',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    note: 'Gemini 的 OpenAI 兼容端点，不是原生 generateContent 地址',
  },
];

export const AI_MODEL_ID_EXAMPLES = [
  'gpt-4o',
  'qwen-plus',
  'deepseek-chat',
  'gemini-1.5-flash',
];

export const PROVIDER_CONSOLE_URLS: Record<string, string> = {
  dashscope: 'https://bailian.console.aliyun.com/#/api-key',
  siliconflow: 'https://cloud.siliconflow.cn/account/ak',
  zhipu: 'https://open.bigmodel.cn/usercenter/apikeys',
  deepseek: 'https://platform.deepseek.com/api_keys',
  moonshot: 'https://platform.moonshot.cn/console/api-keys',
  openai: 'https://platform.openai.com/api-keys',
  google: 'https://aistudio.google.com/apikey',
};
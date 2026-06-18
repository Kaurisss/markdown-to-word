import { create } from 'zustand';
import { AIProvider } from '../../types/ai';

const CUSTOM_PROVIDERS_KEY = 'md2word_custom_providers';
const BUILTIN_CONFIG_KEY = 'md2word_builtin_config';
const MODEL_STORAGE_KEY = 'md2word_selected_model';

const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'dashscope',
    name: '阿里云百炼',
    description: '阿里云大模型服务平台，提供 Qwen 系列模型',
    iconKey: 'alibaba',
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
    description: '硅基流动平台，提供 Qwen 系列模型 与 DeepSeek 模型',
    iconKey: 'siliconflow',
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
    description: '智谱开放平台，提供 GLM 系列模型',
    iconKey: 'zhipu',
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
    description: '深度求索平台，提供 DeepSeek 系列模型',
    iconKey: 'deepseek',
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
    description: '月之暗面平台，提供 Kimi 模型 与 Moonshot 模型',
    iconKey: 'moonshot',
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
    description: 'OpenAI平台，提供 GPT 系列模型 与 o 系列模型',
    iconKey: 'openai',
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
    description: 'Google Gemini 平台，提供 Gemini 系列模型',
    iconKey: 'gemini',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini-1.5-Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini-1.5-Flash' },
    ]
  }
];

interface BuiltinProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  models?: { id: string; name: string }[];
  isEnabled?: boolean;
  iconKey?: string;
}

type SelectedModel = { providerId: string; modelId: string } | null;

interface AIConfigStoreState {
  providers: AIProvider[];
  updateProviders: (providers: AIProvider[]) => void;
  selectedModel: SelectedModel;
  updateSelectedModel: (model: SelectedModel) => void;
}

function loadProvidersFromStorage(): AIProvider[] {
  try {
    const storedBuiltin = localStorage.getItem(BUILTIN_CONFIG_KEY);
    const builtinConfig: Record<string, BuiltinProviderConfig> = storedBuiltin
      ? JSON.parse(storedBuiltin)
      : {};

    const mergedBuiltins = DEFAULT_PROVIDERS.map(p => ({
      ...p,
      ...(builtinConfig[p.id] || {}),
    }));

    const storedCustom = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
    const custom: AIProvider[] = storedCustom ? JSON.parse(storedCustom) : [];

    return [...mergedBuiltins, ...custom];
  } catch {
    return DEFAULT_PROVIDERS;
  }
}

function loadSelectedModelFromStorage(): SelectedModel {
  try {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function splitProviders(newProviders: AIProvider[]) {
  const builtinIds = new Set(DEFAULT_PROVIDERS.map(p => p.id));
  const customProviders = newProviders.filter(p => p.isCustom || !builtinIds.has(p.id));
  const builtinProviders = newProviders.filter(p => builtinIds.has(p.id) && !p.isCustom);

  const builtinConfig: Record<string, BuiltinProviderConfig> = {};
  builtinProviders.forEach(p => {
    builtinConfig[p.id] = {
      apiKey: p.apiKey,
      baseUrl: p.baseUrl,
      models: p.models,
      isEnabled: p.isEnabled,
      iconKey: p.iconKey,
    };
  });

  return { builtinConfig, customProviders };
}

function persistProviders(newProviders: AIProvider[]) {
  const { builtinConfig, customProviders } = splitProviders(newProviders);

  localStorage.setItem(BUILTIN_CONFIG_KEY, JSON.stringify(builtinConfig));
  localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(customProviders));

  window.dispatchEvent(new StorageEvent('storage', {
    key: BUILTIN_CONFIG_KEY,
    newValue: JSON.stringify(builtinConfig),
  }));
  window.dispatchEvent(new StorageEvent('storage', {
    key: CUSTOM_PROVIDERS_KEY,
    newValue: JSON.stringify(customProviders),
  }));
}

function persistSelectedModel(model: SelectedModel) {
  if (model) {
    localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(model));
    window.dispatchEvent(new StorageEvent('storage', {
      key: MODEL_STORAGE_KEY,
      newValue: JSON.stringify(model),
    }));
    return;
  }

  localStorage.removeItem(MODEL_STORAGE_KEY);
  window.dispatchEvent(new StorageEvent('storage', {
    key: MODEL_STORAGE_KEY,
    newValue: null,
  }));
}

export const useAIConfigStore = create<AIConfigStoreState>((set) => ({
  providers: loadProvidersFromStorage(),
  updateProviders: (providers) => {
    persistProviders(providers);
    set({ providers });
  },
  selectedModel: loadSelectedModelFromStorage(),
  updateSelectedModel: (selectedModel) => {
    persistSelectedModel(selectedModel);
    set({ selectedModel });
  },
}));

function handleStorageChange(e: StorageEvent) {
  if (e.key === BUILTIN_CONFIG_KEY || e.key === CUSTOM_PROVIDERS_KEY) {
    useAIConfigStore.setState({ providers: loadProvidersFromStorage() });
  }
  if (e.key === MODEL_STORAGE_KEY) {
    useAIConfigStore.setState({ selectedModel: loadSelectedModelFromStorage() });
  }
}

window.addEventListener('storage', handleStorageChange);

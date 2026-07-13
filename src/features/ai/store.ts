import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { AIProvider } from '../../types/ai';
import { persistedAIConfigSchema, type PersistedAIConfig } from './schemas';

const AI_CONFIG_KEY = 'md2word_ai_config';

// Legacy storage keys (read for migration, written for backward compat)
const BUILTIN_CONFIG_KEY = 'md2word_builtin_config';
const CUSTOM_PROVIDERS_KEY = 'md2word_custom_providers';
const MODEL_STORAGE_KEY = 'md2word_selected_model';

const BUILTIN_ICON_KEY_MIGRATIONS: Record<string, string> = {
  alibaba: 'bailian',
  siliconflow: 'siliconcloud',
};

const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: 'dashscope',
    name: '阿里云百炼',
    description: '阿里云大模型服务平台，提供 Qwen 系列模型',
    iconKey: 'bailian',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-flash', name: 'Qwen Flash' },
      { id: 'qwen-max', name: 'Qwen Max' },
    ]
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    description: '硅基流动平台，提供 Qwen 系列模型 与 DeepSeek 模型',
    iconKey: 'siliconcloud',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    models: [
      { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen 2.5 7B Instruct' },
      { id: 'Qwen/Qwen3-8B', name: 'Qwen 3 8B' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1' },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3' },
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
      { id: 'glm-4.6-flash', name: 'GLM 4.6 Flash' },
      { id: 'glm-4.5-flash', name: 'GLM 4.5 Flash' },
      { id: 'glm-4.5-air', name: 'GLM 4.5 Air' },
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
      { id: 'deepseek-v4-flash', name: 'Deepseek V4 Flash' },
      { id: 'deepseek-v4-pro', name: 'Deepseek V4 Pro' },
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
      { id: 'kimi-k2-thinking', name: 'Kimi K2 Thinking' },
      { id: 'moonshot-v1-auto', name: 'Moonshot V1 Auto' },
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
      { id: 'gpt-4.1-nano', name: 'GPT 4.1 Nano' },
      { id: 'gpt-4.1-mini', name: 'GPT 4.1 Mini' },
      { id: 'o4-mini', name: 'O4 Mini' },
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
      { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
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

/** Merge builtin overrides with defaults, applying icon-key migration. */
function mergeProviders(
  builtinConfig: Record<string, BuiltinProviderConfig>,
  customProviders: AIProvider[],
): AIProvider[] {
  const mergedBuiltins = DEFAULT_PROVIDERS.map(p => {
    const storedConfig = builtinConfig[p.id] || {};
    return {
      ...p,
      ...storedConfig,
      iconKey: storedConfig.iconKey
        ? BUILTIN_ICON_KEY_MIGRATIONS[storedConfig.iconKey] ?? storedConfig.iconKey
        : p.iconKey,
    };
  });
  return [...mergedBuiltins, ...customProviders];
}

/** Split providers into builtin overrides (compact) + custom providers. */
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

/**
 * Custom persist storage that handles v0 (3-key) format migration.
 * Reads from old 3 keys when the new consolidated key is missing.
 * Writes to new key AND old keys (for backward compat / rollback).
 */
const aiStorage: PersistStorage<PersistedAIConfig> = {
  getItem: (name: string): StorageValue<PersistedAIConfig> | null => {
    // Try new consolidated key first
    const raw = localStorage.getItem(name);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && 'state' in parsed) {
          return parsed as StorageValue<PersistedAIConfig>;
        }
      } catch {
        return null;
      }
    }

    // Fall back to old 3 keys (v0 format)
    const storedBuiltin = localStorage.getItem(BUILTIN_CONFIG_KEY);
    const storedCustom = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
    const storedModel = localStorage.getItem(MODEL_STORAGE_KEY);

    if (!storedBuiltin && !storedCustom && !storedModel) {
      return null;
    }

    try {
      const builtinConfig: Record<string, BuiltinProviderConfig> = storedBuiltin ? JSON.parse(storedBuiltin) : {};
      const customProviders: AIProvider[] = storedCustom ? JSON.parse(storedCustom) : [];
      const selectedModel: SelectedModel = storedModel ? JSON.parse(storedModel) : null;

      return {
        state: { builtinConfig, customProviders, selectedModel },
        version: 0,
      };
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<PersistedAIConfig>): void => {
    const mainStr = JSON.stringify(value);
    localStorage.setItem(name, mainStr);

    // Write back to old keys for backward compat / rollback
    const { builtinConfig, customProviders, selectedModel } = value.state;
    const builtinStr = JSON.stringify(builtinConfig);
    const customStr = JSON.stringify(customProviders);
    localStorage.setItem(BUILTIN_CONFIG_KEY, builtinStr);
    localStorage.setItem(CUSTOM_PROVIDERS_KEY, customStr);
    if (selectedModel) {
      const modelStr = JSON.stringify(selectedModel);
      localStorage.setItem(MODEL_STORAGE_KEY, modelStr);
    } else {
      localStorage.removeItem(MODEL_STORAGE_KEY);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
    localStorage.removeItem(BUILTIN_CONFIG_KEY);
    localStorage.removeItem(CUSTOM_PROVIDERS_KEY);
    localStorage.removeItem(MODEL_STORAGE_KEY);
  },
};

export const useAIConfigStore = create<AIConfigStoreState>()(
  persist(
    (set) => ({
      providers: DEFAULT_PROVIDERS,
      updateProviders: (providers) => {
        set({ providers });
      },
      selectedModel: null,
      updateSelectedModel: (selectedModel) => {
        set({ selectedModel });
      },
    }),
    {
      name: AI_CONFIG_KEY,
      version: 2,
      storage: aiStorage,
      partialize: (state) => {
        const { builtinConfig, customProviders } = splitProviders(state.providers);
        return {
          builtinConfig,
          customProviders,
          selectedModel: state.selectedModel,
        };
      },
      merge: (persisted, current) => {
        const parsed = persistedAIConfigSchema.safeParse(persisted);
        if (parsed.success) {
          return {
            ...current,
            providers: mergeProviders(
              parsed.data.builtinConfig,
              parsed.data.customProviders,
            ),
            selectedModel: parsed.data.selectedModel,
          };
        }
        // Fall back to defaults on validation failure
        return {
          ...current,
          providers: DEFAULT_PROVIDERS,
          selectedModel: null,
        };
      },
      migrate: (persistedState: unknown) => {
        // V0 (3-key format) → V2: validate through Zod schema
        const parsed = persistedAIConfigSchema.safeParse(persistedState);
        if (parsed.success) {
          return parsed.data;
        }
        // Fall back to empty state
        return { builtinConfig: {}, customProviders: [], selectedModel: null };
      },
    }
  )
);

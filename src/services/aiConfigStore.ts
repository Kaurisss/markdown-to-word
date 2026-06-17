import { create } from 'zustand';
import { AIProvider, DEFAULT_PROVIDERS } from '../interfaces/AI';

const CUSTOM_PROVIDERS_KEY = 'md2word_custom_providers';
const BUILTIN_CONFIG_KEY = 'md2word_builtin_config';
const MODEL_STORAGE_KEY = 'md2word_selected_model';

interface BuiltinProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  models?: { id: string; name: string }[];
  isEnabled?: boolean;
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

import { useSyncExternalStore } from 'react';
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

interface AIConfigState {
  providers: AIProvider[];
  selectedModel: SelectedModel;
}

// ── Persistence helpers ───────────────────────────────────────────

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

// ── Singleton state ───────────────────────────────────────────────

let state: AIConfigState = {
  providers: loadProvidersFromStorage(),
  selectedModel: loadSelectedModelFromStorage(),
};

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach(cb => cb());
}

function getSnapshot(): AIConfigState {
  return state;
}

// ── Actions ───────────────────────────────────────────────────────

function updateProviders(newProviders: AIProvider[]) {
  state = { ...state, providers: newProviders };

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

  localStorage.setItem(BUILTIN_CONFIG_KEY, JSON.stringify(builtinConfig));
  localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(customProviders));

  // Cross-window sync via StorageEvent
  window.dispatchEvent(new StorageEvent('storage', {
    key: BUILTIN_CONFIG_KEY,
    newValue: JSON.stringify(builtinConfig),
  }));
  window.dispatchEvent(new StorageEvent('storage', {
    key: CUSTOM_PROVIDERS_KEY,
    newValue: JSON.stringify(customProviders),
  }));

  emit();
}

function updateSelectedModel(model: SelectedModel) {
  state = { ...state, selectedModel: model };

  if (model) {
    localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(model));
    window.dispatchEvent(new StorageEvent('storage', {
      key: MODEL_STORAGE_KEY,
      newValue: JSON.stringify(model),
    }));
  } else {
    localStorage.removeItem(MODEL_STORAGE_KEY);
    window.dispatchEvent(new StorageEvent('storage', {
      key: MODEL_STORAGE_KEY,
      newValue: null,
    }));
  }

  emit();
}

// ── Cross-window sync (registered once at module load) ───────────

function handleStorageChange(e: StorageEvent) {
  if (e.key === BUILTIN_CONFIG_KEY || e.key === CUSTOM_PROVIDERS_KEY) {
    state = { ...state, providers: loadProvidersFromStorage() };
    emit();
  }
  if (e.key === MODEL_STORAGE_KEY) {
    state = { ...state, selectedModel: loadSelectedModelFromStorage() };
    emit();
  }
}

window.addEventListener('storage', handleStorageChange);

// ── Hook ──────────────────────────────────────────────────────────

export const useAIConfigStore = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return {
    providers: snapshot.providers,
    updateProviders,
    selectedModel: snapshot.selectedModel,
    updateSelectedModel,
  };
};

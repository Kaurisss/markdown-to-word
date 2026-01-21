import { useState, useEffect, useCallback } from 'react';
import { AIProvider, DEFAULT_PROVIDERS } from '../interfaces/AI';

const CUSTOM_PROVIDERS_KEY = 'md2word_custom_providers';
const BUILTIN_CONFIG_KEY = 'md2word_builtin_config';
const MODEL_STORAGE_KEY = 'md2word_selected_model';

// Store user modifications to built-in providers (apiKey, models, isEnabled, baseUrl)
interface BuiltinProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  models?: { id: string; name: string }[];
  isEnabled?: boolean;
}

export const useAIConfigStore = () => {
  // Merge built-in providers with stored config + custom providers
  const [providers, setProviders] = useState<AIProvider[]>(() => {
    try {
      // Load stored configs for built-in providers
      const storedBuiltinConfig = localStorage.getItem(BUILTIN_CONFIG_KEY);
      const builtinConfig: Record<string, BuiltinProviderConfig> = storedBuiltinConfig
        ? JSON.parse(storedBuiltinConfig)
        : {};

      // Merge built-in providers with stored config
      const mergedBuiltins = DEFAULT_PROVIDERS.map(defaultProvider => ({
        ...defaultProvider,
        ...(builtinConfig[defaultProvider.id] || {})
      }));

      // Load custom providers
      const storedCustom = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
      const customProviders: AIProvider[] = storedCustom ? JSON.parse(storedCustom) : [];

      return [...mergedBuiltins, ...customProviders];
    } catch (e) {
      console.error('Failed to load AI providers from storage:', e);
      return DEFAULT_PROVIDERS;
    }
  });

  const [selectedModel, setSelectedModel] = useState<{ providerId: string, modelId: string } | null>(() => {
    try {
      const stored = localStorage.getItem(MODEL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist providers when they change
  const updateProviders = useCallback((newProviders: AIProvider[]) => {
    setProviders(newProviders);

    // Separate built-in and custom providers
    const builtinIds = new Set(DEFAULT_PROVIDERS.map(p => p.id));
    const customProviders = newProviders.filter(p => p.isCustom || !builtinIds.has(p.id));
    const builtinProviders = newProviders.filter(p => builtinIds.has(p.id) && !p.isCustom);

    // Extract only user-modified fields for built-in providers
    const builtinConfig: Record<string, BuiltinProviderConfig> = {};
    builtinProviders.forEach(provider => {
      builtinConfig[provider.id] = {
        apiKey: provider.apiKey,
        baseUrl: provider.baseUrl,
        models: provider.models,
        isEnabled: provider.isEnabled
      };
    });

    localStorage.setItem(BUILTIN_CONFIG_KEY, JSON.stringify(builtinConfig));
    localStorage.setItem(CUSTOM_PROVIDERS_KEY, JSON.stringify(customProviders));

    // Trigger storage event for other windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: BUILTIN_CONFIG_KEY,
      newValue: JSON.stringify(builtinConfig)
    }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: CUSTOM_PROVIDERS_KEY,
      newValue: JSON.stringify(customProviders)
    }));
  }, []);

  // Persist selected model
  const updateSelectedModel = useCallback((model: { providerId: string, modelId: string } | null) => {
    setSelectedModel(model);
    if (model) {
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(model));
      window.dispatchEvent(new StorageEvent('storage', {
        key: MODEL_STORAGE_KEY,
        newValue: JSON.stringify(model)
      }));
    } else {
      localStorage.removeItem(MODEL_STORAGE_KEY);
    }
  }, []);

  // Listen for storage changes (from other windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === BUILTIN_CONFIG_KEY || e.key === CUSTOM_PROVIDERS_KEY) && e.newValue) {
        try {
          // Reload all providers
          const storedBuiltinConfig = localStorage.getItem(BUILTIN_CONFIG_KEY);
          const builtinConfig: Record<string, BuiltinProviderConfig> = storedBuiltinConfig
            ? JSON.parse(storedBuiltinConfig)
            : {};

          const mergedBuiltins = DEFAULT_PROVIDERS.map(defaultProvider => ({
            ...defaultProvider,
            ...(builtinConfig[defaultProvider.id] || {})
          }));

          const storedCustom = localStorage.getItem(CUSTOM_PROVIDERS_KEY);
          const customProviders: AIProvider[] = storedCustom ? JSON.parse(storedCustom) : [];

          setProviders([...mergedBuiltins, ...customProviders]);
        } catch (err) {
          console.error('Failed to parse synced providers:', err);
        }
      }
      if (e.key === MODEL_STORAGE_KEY && e.newValue) {
        try {
          setSelectedModel(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Failed to parse synced model:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    providers,
    updateProviders,
    selectedModel,
    updateSelectedModel
  };
};

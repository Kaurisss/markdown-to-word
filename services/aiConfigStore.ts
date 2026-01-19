import { useState, useEffect, useCallback } from 'react';
import { AIProvider, DEFAULT_PROVIDERS } from '../interfaces/AI';

const STORAGE_KEY = 'md2word_ai_providers';
const MODEL_STORAGE_KEY = 'md2word_selected_model';

export const useAIConfigStore = () => {
  // Load initial state from localStorage or default
  const [providers, setProviders] = useState<AIProvider[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_PROVIDERS;
    } catch (e) {
      console.error('Failed to load AI providers from storage:', e);
      return DEFAULT_PROVIDERS;
    }
  });

  const [selectedModel, setSelectedModel] = useState<{providerId: string, modelId: string} | null>(() => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProviders));
    // Trigger storage event for other windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(newProviders)
    }));
  }, []);

  // Persist selected model
  const updateSelectedModel = useCallback((model: {providerId: string, modelId: string} | null) => {
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
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setProviders(JSON.parse(e.newValue));
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

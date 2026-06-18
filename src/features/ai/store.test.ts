// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '../../types/ai';

async function loadModule() {
  vi.resetModules();
  return import('./store');
}

describe('aiConfigStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default providers', async () => {
    const { useAIConfigStore } = await loadModule();

    const { result } = renderHook(() => useAIConfigStore());

    expect(result.current.providers.length).toBeGreaterThan(0);
    expect(result.current.providers.some((provider) => provider.id === 'openai')).toBe(true);
    expect(result.current.selectedModel).toBeNull();
  });

  it('merges stored builtin provider config', async () => {
    localStorage.setItem('md2word_builtin_config', JSON.stringify({
      openai: {
        apiKey: 'sk-test',
        isEnabled: true,
      },
    }));

    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    const openai = result.current.providers.find((provider) => provider.id === 'openai');
    expect(openai).toMatchObject({
      apiKey: 'sk-test',
      isEnabled: true,
    });
  });

  it('persists builtin overrides separately from custom providers', async () => {
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    const openai = result.current.providers.find((provider) => provider.id === 'openai');
    expect(openai).toBeTruthy();

    const customProvider: AIProvider = {
      id: 'custom-local',
      name: 'Custom Local',
      isEnabled: true,
      apiKey: 'local-key',
      baseUrl: 'http://localhost:11434/v1/chat/completions',
      models: [{ id: 'local-model', name: 'Local Model' }],
      isCustom: true,
    };

    act(() => {
      result.current.updateProviders([
        ...result.current.providers.filter((provider) => provider.id !== 'openai'),
        { ...openai!, apiKey: 'sk-updated', isEnabled: true },
        customProvider,
      ]);
    });

    const builtinConfig = JSON.parse(localStorage.getItem('md2word_builtin_config') || '{}');
    const customProviders = JSON.parse(localStorage.getItem('md2word_custom_providers') || '[]');

    expect(builtinConfig.openai).toMatchObject({
      apiKey: 'sk-updated',
      isEnabled: true,
    });
    expect(customProviders).toEqual([customProvider]);
  });

  it('persists and clears the selected model', async () => {
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    act(() => {
      result.current.updateSelectedModel({ providerId: 'openai', modelId: 'gpt-4o' });
    });

    expect(JSON.parse(localStorage.getItem('md2word_selected_model') || '{}')).toEqual({
      providerId: 'openai',
      modelId: 'gpt-4o',
    });

    act(() => {
      result.current.updateSelectedModel(null);
    });

    expect(localStorage.getItem('md2word_selected_model')).toBeNull();
    expect(result.current.selectedModel).toBeNull();
  });

  it('updates from storage events', async () => {
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    act(() => {
      localStorage.setItem('md2word_selected_model', JSON.stringify({
        providerId: 'dashscope',
        modelId: 'qwen-plus',
      }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'md2word_selected_model',
        newValue: localStorage.getItem('md2word_selected_model'),
      }));
    });

    expect(result.current.selectedModel).toEqual({
      providerId: 'dashscope',
      modelId: 'qwen-plus',
    });
  });
});

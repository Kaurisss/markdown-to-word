// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '@/types/ai';

class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];

  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(readonly name: string) {
    MockBroadcastChannel.instances.push(this);
  }

  emit(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }
}

async function loadModule() {
  vi.resetModules();
  return import('@/features/ai/store');
}

describe('aiConfigStore', () => {
  beforeEach(() => {
    localStorage.clear();
    MockBroadcastChannel.instances = [];
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads default providers', async () => {
    const { useAIConfigStore } = await loadModule();

    const { result } = renderHook(() => useAIConfigStore());

    expect(result.current.providers.length).toBeGreaterThan(0);
    expect(result.current.providers.some((provider) => provider.id === 'openai')).toBe(true);
    expect(result.current.providers.find((provider) => provider.id === 'dashscope')?.iconKey).toBe('bailian');
    expect(result.current.providers.find((provider) => provider.id === 'siliconflow')?.iconKey).toBe('siliconcloud');
    expect(result.current.selectedModel).toBeNull();
  });

  it('merges stored builtin provider config from legacy keys', async () => {
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
      iconKey: 'openai',
    };

    act(() => {
      result.current.updateProviders([
        ...result.current.providers.filter((provider) => provider.id !== 'openai'),
        { ...openai!, apiKey: 'sk-updated', isEnabled: true },
        customProvider,
      ]);
    });

    // Check new consolidated key
    const stored = JSON.parse(localStorage.getItem('md2word_ai_config') || '{}');
    expect(stored.version).toBe(2);
    expect(stored.state.builtinConfig.openai).toMatchObject({
      apiKey: 'sk-updated',
      isEnabled: true,
    });
    expect(stored.state.customProviders).toEqual([customProvider]);

    // Check old keys are also written for backward compat
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

    const stored = JSON.parse(localStorage.getItem('md2word_ai_config') || '{}');
    expect(stored.state.selectedModel).toEqual({
      providerId: 'openai',
      modelId: 'gpt-4o',
    });
    // Old key also written for backward compat
    expect(JSON.parse(localStorage.getItem('md2word_selected_model') || 'null')).toEqual({
      providerId: 'openai',
      modelId: 'gpt-4o',
    });

    act(() => {
      result.current.updateSelectedModel(null);
    });

    const updatedStored = JSON.parse(localStorage.getItem('md2word_ai_config') || '{}');
    expect(updatedStored.state.selectedModel).toBeNull();
    expect(localStorage.getItem('md2word_selected_model')).toBeNull();
    expect(result.current.selectedModel).toBeNull();
  });

  it('rehydrates when a storage event is received', async () => {
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    const newValue = JSON.stringify({
      state: {
        builtinConfig: {},
        customProviders: [],
        selectedModel: { providerId: 'dashscope', modelId: 'qwen-plus' },
      },
      version: 2,
    });
    localStorage.setItem('md2word_ai_config', newValue);

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'md2word_ai_config',
        newValue,
      }));
    });

    await waitFor(() => {
      expect(result.current.selectedModel).toEqual({
        providerId: 'dashscope',
        modelId: 'qwen-plus',
      });
    });
  });

  it('rehydrates when a broadcast message is received', async () => {
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());
    const channel = MockBroadcastChannel.instances.find(
      (instance) => instance.name === 'md2word_ai_channel',
    );

    localStorage.setItem('md2word_ai_config', JSON.stringify({
      state: {
        builtinConfig: {},
        customProviders: [],
        selectedModel: { providerId: 'openai', modelId: 'gpt-4.1-mini' },
      },
      version: 2,
    }));

    act(() => {
      channel?.emit({});
    });

    await waitFor(() => {
      expect(result.current.selectedModel).toEqual({
        providerId: 'openai',
        modelId: 'gpt-4.1-mini',
      });
    });
  });

  it('persists builtin provider icon overrides', async () => {
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    const openai = result.current.providers.find((provider) => provider.id === 'openai');
    expect(openai).toBeTruthy();

    act(() => {
      result.current.updateProviders([
        ...result.current.providers.filter((provider) => provider.id !== 'openai'),
        { ...openai!, iconKey: 'anthropic' },
      ]);
    });

    const stored = JSON.parse(localStorage.getItem('md2word_ai_config') || '{}');
    expect(stored.state.builtinConfig.openai.iconKey).toBe('anthropic');
    // Old key also written
    const builtinConfig = JSON.parse(localStorage.getItem('md2word_builtin_config') || '{}');
    expect(builtinConfig.openai.iconKey).toBe('anthropic');
  });

  it('migrates legacy builtin provider icon keys', async () => {
    localStorage.setItem('md2word_builtin_config', JSON.stringify({
      dashscope: {
        iconKey: 'alibaba',
      },
      siliconflow: {
        iconKey: 'siliconflow',
      },
    }));

    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    expect(result.current.providers.find((provider) => provider.id === 'dashscope')?.iconKey).toBe('bailian');
    expect(result.current.providers.find((provider) => provider.id === 'siliconflow')?.iconKey).toBe('siliconcloud');
  });

  it('falls back to defaults when builtin config storage is corrupted', async () => {
    localStorage.setItem('md2word_builtin_config', '{bad json');
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    expect(result.current.providers.length).toBeGreaterThan(0);
    expect(result.current.providers.find((p) => p.id === 'openai')).toBeTruthy();
    expect(result.current.selectedModel).toBeNull();
  });

  it('falls back to defaults when persisted state has invalid types', async () => {
    // V2 persist format with corrupted state (builtinConfig is a string instead of object)
    localStorage.setItem('md2word_ai_config', JSON.stringify({
      state: {
        builtinConfig: 'not-a-record',
        customProviders: 'not-an-array',
        selectedModel: 42,
      },
      version: 2,
    }));
    const { useAIConfigStore } = await loadModule();
    const { result } = renderHook(() => useAIConfigStore());

    expect(result.current.providers.length).toBeGreaterThan(0);
    expect(result.current.selectedModel).toBeNull();
  });
});

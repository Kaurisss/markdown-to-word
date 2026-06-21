// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProvider } from '@/types/ai';
import { DEFAULT_CUSTOM_PROVIDER_BASE_URL } from '@/features/ai/validation';
import { useAIConfig } from '@/features/ai/useAIConfig';

const baseProviders: AIProvider[] = [
  {
    id: 'builtin',
    name: 'Built In',
    description: 'Default provider',
    isEnabled: false,
    apiKey: '',
    baseUrl: 'https://builtin.example.com/v1/chat/completions',
    models: [{ id: 'builtin-model', name: 'Built In Model' }],
  },
  {
    id: 'custom-existing',
    name: 'Existing Custom',
    description: 'Old description',
    isEnabled: true,
    apiKey: '',
    baseUrl: 'https://old.example.com/v1/chat/completions',
    models: [],
    isCustom: true,
  },
];

function renderConfig(overrides?: Partial<{
  providers: AIProvider[];
}>) {
  let providers = overrides?.providers ?? baseProviders;
  const updateProviders = vi.fn((next: AIProvider[]) => {
    providers = next;
  });
  const rendered = renderHook(() =>
    useAIConfig({
      providers,
      updateProviders,
    })
  );

  return {
    ...rendered,
    get providers() {
      return providers;
    },
    updateProviders,
  };
}

describe('useAIConfig forms', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('selects the first provider on initial render', () => {
    const { result } = renderConfig();

    expect(result.current.selectedProviderId).toBe('builtin');
    expect(result.current.selectedProvider?.id).toBe('builtin');
  });

  it('adds a custom provider from normalized form values', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);
    const { result, updateProviders } = renderConfig();

    await act(async () => {
      result.current.setNewPlatformName('  Local AI  ');
      result.current.setNewPlatformUrl('   ');
      result.current.setNewPlatformDescription('  Local endpoint  ');
      result.current.setNewPlatformIconKey('openai');
    });

    await act(async () => {
      await result.current.handleAddPlatform();
    });

    expect(updateProviders).toHaveBeenCalledWith([
      ...baseProviders,
      {
        id: 'custom-12345',
        name: 'Local AI',
        description: 'Local endpoint',
        iconKey: 'openai',
        isEnabled: true,
        apiKey: '',
        baseUrl: DEFAULT_CUSTOM_PROVIDER_BASE_URL,
        models: [],
        isCustom: true,
      },
    ]);
    expect(result.current.selectedProviderId).toBe('custom-12345');
    expect(result.current.newPlatformName).toBe('');
  });

  it('does not add a provider when the schema rejects the form', async () => {
    const { result, updateProviders } = renderConfig();

    await act(async () => {
      result.current.setNewPlatformName(' ');
      result.current.setNewPlatformUrl('ftp://bad.example.com');
    });

    await act(async () => {
      await result.current.handleAddPlatform();
    });

    expect(updateProviders).not.toHaveBeenCalled();
  });

  it('loads an existing custom provider into the edit form and saves a normalized patch', async () => {
    const { result, updateProviders } = renderConfig();
    const provider = baseProviders[1];

    act(() => {
      result.current.handleStartEditPlatform(provider);
    });

    expect(result.current.editPlatformName).toBe('Existing Custom');
    expect(result.current.editPlatformUrl).toBe('https://old.example.com/v1/chat/completions');
    expect(result.current.editPlatformIconKey).toBe(provider.iconKey ?? '');

    await act(async () => {
      result.current.setEditPlatformName('  Renamed Provider  ');
      result.current.setEditPlatformUrl(' ');
      result.current.setEditPlatformDescription(' ');
      result.current.setEditPlatformIconKey('deepseek');
    });

    await act(async () => {
      await result.current.handleSaveEditPlatform();
    });

    expect(updateProviders).toHaveBeenCalledWith([
      baseProviders[0],
      {
        ...provider,
        name: 'Renamed Provider',
        baseUrl: DEFAULT_CUSTOM_PROVIDER_BASE_URL,
        description: undefined,
        iconKey: 'deepseek',
      },
    ]);
  });

  it('adds a model from normalized form values', async () => {
    const { result, updateProviders } = renderConfig();

    act(() => {
      result.current.setSelectedProviderId('builtin');
    });

    await act(async () => {
      result.current.setNewModelId('  qwen-plus  ');
      result.current.setNewModelName(' ');
    });

    await act(async () => {
      await result.current.handleAddModel();
    });

    expect(updateProviders).toHaveBeenCalledWith([
      {
        ...baseProviders[0],
        models: [
          ...baseProviders[0].models,
          { id: 'qwen-plus', name: 'qwen-plus' },
        ],
      },
      baseProviders[1],
    ]);
    expect(result.current.newModelId).toBe('');
  });

  it('does not add a model when model id is empty', async () => {
    const { result, updateProviders } = renderConfig();

    act(() => {
      result.current.setSelectedProviderId('builtin');
    });

    await act(async () => {
      result.current.setNewModelId(' ');
      result.current.setNewModelName('Display Name');
    });

    await act(async () => {
      await result.current.handleAddModel();
    });

    expect(updateProviders).not.toHaveBeenCalled();
  });

  it('loads an existing model into the edit form and saves normalized values', async () => {
    const { result, updateProviders } = renderConfig();

    act(() => {
      result.current.setSelectedProviderId('builtin');
    });

    const model = baseProviders[0].models[0];

    act(() => {
      result.current.handleEditModel(model);
    });

    expect(result.current.editModelId).toBe('builtin-model');
    expect(result.current.editModelName).toBe('Built In Model');

    await act(async () => {
      result.current.setEditModelId('  renamed-model  ');
      result.current.setEditModelName(' ');
    });

    await act(async () => {
      await result.current.handleSaveEditModel();
    });

    expect(updateProviders).toHaveBeenCalledWith([
      {
        ...baseProviders[0],
        models: [{ id: 'renamed-model', name: 'renamed-model' }],
      },
      baseProviders[1],
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CUSTOM_PROVIDER_BASE_URL,
  buildCustomProvider,
  buildModel,
  patchCustomProvider,
  providerFormSchema,
  modelFormSchema,
  toModelFormValues,
  toProviderFormValues,
} from './validation';

describe('aiConfigValidation', () => {
  it('validates required provider names', () => {
    const result = providerFormSchema.safeParse({
      name: '   ',
      baseUrl: '',
      description: '',
      iconKey: '',
    });

    expect(result.success).toBe(false);
  });

  it('accepts empty provider baseUrl so callers can use the default', () => {
    const result = providerFormSchema.safeParse({
      name: ' Local ',
      baseUrl: '   ',
      description: ' test provider ',
      iconKey: '',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({
      name: 'Local',
      baseUrl: '',
      description: 'test provider',
      iconKey: '',
    });
  });

  it('rejects non-http provider baseUrl values', () => {
    const result = providerFormSchema.safeParse({
      name: 'Local',
      baseUrl: 'ftp://example.com',
      description: '',
      iconKey: '',
    });

    expect(result.success).toBe(false);
  });

  it('builds a custom provider with default baseUrl and trimmed fields', () => {
    const provider = buildCustomProvider({
      id: 'custom-fixed',
      values: {
        name: ' Local ',
        baseUrl: ' ',
        description: '  ',
        iconKey: '',
      },
    });

    expect(provider).toEqual({
      id: 'custom-fixed',
      name: 'Local',
      description: undefined,
      iconKey: undefined,
      isEnabled: true,
      apiKey: '',
      baseUrl: DEFAULT_CUSTOM_PROVIDER_BASE_URL,
      models: [],
      isCustom: true,
    });
  });

  it('builds a provider patch with optional description removed when empty', () => {
    const patch = patchCustomProvider({
      name: ' New Name ',
      baseUrl: ' https://api.example.com/v1/chat/completions ',
      description: ' ',
      iconKey: ' openai ',
    });

    expect(patch).toEqual({
      name: 'New Name',
      baseUrl: 'https://api.example.com/v1/chat/completions',
      description: undefined,
      iconKey: 'openai',
    });
  });

  it('validates required model IDs', () => {
    const result = modelFormSchema.safeParse({
      id: ' ',
      name: 'Display',
    });

    expect(result.success).toBe(false);
  });

  it('builds model display name from id when name is empty', () => {
    expect(buildModel({
      id: ' qwen-plus ',
      name: ' ',
    })).toEqual({
      id: 'qwen-plus',
      name: 'qwen-plus',
    });
  });

  it('maps existing provider and model values back to form values', () => {
    expect(toProviderFormValues({
      id: 'custom-a',
      name: 'Custom A',
      isEnabled: true,
      apiKey: 'secret',
      baseUrl: 'https://api.example.com',
      description: 'Example',
      iconKey: 'deepseek',
      models: [],
      isCustom: true,
    })).toEqual({
      name: 'Custom A',
      baseUrl: 'https://api.example.com',
      description: 'Example',
      iconKey: 'deepseek',
    });

    expect(toModelFormValues({ id: 'gpt-4o', name: 'GPT-4o' })).toEqual({
      id: 'gpt-4o',
      name: 'GPT-4o',
    });
  });
});

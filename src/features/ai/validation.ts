import { z } from 'zod';
import { AIModel, AIProvider } from '../../types/ai';

export const DEFAULT_CUSTOM_PROVIDER_BASE_URL = 'https://api.example.com/v1/chat/completions';

const httpUrlOrEmpty = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^https?:\/\/\S+$/i.test(value),
    'Base URL 必须以 http:// 或 https:// 开头'
  );

export const providerFormSchema = z.object({
  name: z.string().trim().min(1, '平台名称不能为空'),
  baseUrl: httpUrlOrEmpty,
  description: z.string().trim(),
});

export const modelFormSchema = z.object({
  id: z.string().trim().min(1, '模型 ID 不能为空'),
  name: z.string().trim(),
});

export type ProviderFormValues = z.input<typeof providerFormSchema>;
export type NormalizedProviderFormValues = z.output<typeof providerFormSchema>;
export type ModelFormValues = z.input<typeof modelFormSchema>;
export type NormalizedModelFormValues = z.output<typeof modelFormSchema>;

export const EMPTY_PROVIDER_FORM: ProviderFormValues = {
  name: '',
  baseUrl: '',
  description: '',
};

export const EMPTY_MODEL_FORM: ModelFormValues = {
  id: '',
  name: '',
};

export function normalizeProviderForm(values: ProviderFormValues): NormalizedProviderFormValues {
  return providerFormSchema.parse(values);
}

export function normalizeModelForm(values: ModelFormValues): NormalizedModelFormValues {
  return modelFormSchema.parse(values);
}

export function toProviderFormValues(provider: AIProvider): ProviderFormValues {
  return {
    name: provider.name,
    baseUrl: provider.baseUrl,
    description: provider.description ?? '',
  };
}

export function toModelFormValues(model: AIModel): ModelFormValues {
  return {
    id: model.id,
    name: model.name,
  };
}

export function buildCustomProvider({
  id,
  values,
}: {
  id: string;
  values: ProviderFormValues;
}): AIProvider {
  const parsed = normalizeProviderForm(values);
  return {
    id,
    name: parsed.name,
    description: parsed.description || undefined,
    isEnabled: true,
    apiKey: '',
    baseUrl: parsed.baseUrl || DEFAULT_CUSTOM_PROVIDER_BASE_URL,
    models: [],
    isCustom: true,
  };
}

export function patchCustomProvider(values: ProviderFormValues): Pick<AIProvider, 'name' | 'baseUrl' | 'description'> {
  const parsed = normalizeProviderForm(values);
  return {
    name: parsed.name,
    baseUrl: parsed.baseUrl || DEFAULT_CUSTOM_PROVIDER_BASE_URL,
    description: parsed.description || undefined,
  };
}

export function buildModel(values: ModelFormValues): AIModel {
  const parsed = normalizeModelForm(values);
  return {
    id: parsed.id,
    name: parsed.name || parsed.id,
  };
}

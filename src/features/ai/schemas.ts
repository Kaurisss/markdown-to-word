import { z } from 'zod';

export const aiModelSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const aiProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  iconKey: z.string().optional(),
  isEnabled: z.boolean(),
  apiKey: z.string(),
  baseUrl: z.string(),
  models: z.array(aiModelSchema),
  isCustom: z.boolean().optional(),
});

export const selectedModelSchema = z.object({
  providerId: z.string(),
  modelId: z.string(),
});

export const builtinProviderConfigSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  models: z.array(aiModelSchema).optional(),
  isEnabled: z.boolean().optional(),
  iconKey: z.string().optional(),
});

/**
 * Persisted shape of the AI config store.
 * Builtin overrides are stored separately from custom providers
 * to preserve the compact storage contract.
 */
export const persistedAIConfigSchema = z.object({
  builtinConfig: z.record(z.string(), builtinProviderConfigSchema),
  customProviders: z.array(aiProviderSchema),
  selectedModel: selectedModelSchema.nullable(),
});

export type PersistedAIConfig = z.output<typeof persistedAIConfigSchema>;

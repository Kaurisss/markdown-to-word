import { describe, it, expect } from 'vitest';
import { addMultipleModelsToProvider } from '@/features/ai/modelActions';
import { AIProvider } from '@/types/ai';

describe('modelActions', () => {
  describe('addMultipleModelsToProvider', () => {
    it('should add multiple models and skip existing ones', () => {
      const providers: AIProvider[] = [
        {
          id: 'provider-1',
          name: 'Provider 1',
          baseUrl: 'https://api.openai.com/v1',
          models: [{ id: 'gpt-3.5-turbo', name: 'GPT 3.5' }],
          isCustom: true,
        }
      ];

      const newModels = [
        { id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo' }, // should be skipped
        { id: 'gpt-4', name: 'gpt-4' } // should be added
      ];

      const updated = addMultipleModelsToProvider(providers, 'provider-1', newModels);
      
      const providerModels = updated[0].models;
      expect(providerModels).toHaveLength(2);
      expect(providerModels[0].id).toBe('gpt-3.5-turbo');
      expect(providerModels[0].name).toBe('GPT 3.5'); // preserves old name
      expect(providerModels[1].id).toBe('gpt-4');
      expect(providerModels[1].name).toBe('gpt-4');
    });

    it('should ignore other providers', () => {
      const providers: AIProvider[] = [
        {
          id: 'provider-1',
          name: 'Provider 1',
          baseUrl: 'https://api.openai.com/v1',
          models: [],
          isCustom: true,
        },
        {
          id: 'provider-2',
          name: 'Provider 2',
          baseUrl: 'https://api.openai.com/v1',
          models: [],
          isCustom: true,
        }
      ];

      const updated = addMultipleModelsToProvider(providers, 'provider-1', [{ id: 'm1', name: 'm1' }]);
      expect(updated[0].models).toHaveLength(1);
      expect(updated[1].models).toHaveLength(0);
    });
  });
});

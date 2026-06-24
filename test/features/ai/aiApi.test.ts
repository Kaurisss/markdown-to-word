import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deriveModelsUrl, fetchRemoteModels } from '@/features/ai/aiApi';

describe('aiApi', () => {
  describe('deriveModelsUrl', () => {
    it('should derive from standard chat completions endpoint', () => {
      expect(deriveModelsUrl('https://api.openai.com/v1/chat/completions')).toBe('https://api.openai.com/v1/models');
      expect(deriveModelsUrl('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1/models');
      expect(deriveModelsUrl('https://api.siliconflow.cn/v1/chat/completions')).toBe('https://api.siliconflow.cn/v1/models');
    });

    it('should handle endpoints that end with /models', () => {
      expect(deriveModelsUrl('https://api.openai.com/v1/models')).toBe('https://api.openai.com/v1/models');
    });

    it('should append /models if not chat completions', () => {
      expect(deriveModelsUrl('https://api.openai.com/v1')).toBe('https://api.openai.com/v1/models');
      expect(deriveModelsUrl('https://api.openai.com/v1/')).toBe('https://api.openai.com/v1/models');
    });
  });

  describe('fetchRemoteModels', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
      vi.restoreAllMocks();
    });

    it('should parse models successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'model-1' }, { id: 'model-2' }] }),
      });

      const models = await fetchRemoteModels({ baseUrl: 'https://api.openai.com/v1', apiKey: 'test-key' });
      expect(models).toEqual([{ id: 'model-1' }, { id: 'model-2' }]);
    });

    it('should throw if api key is missing', async () => {
      await expect(fetchRemoteModels({ baseUrl: 'https://api.openai.com/v1', apiKey: '' })).rejects.toThrow('缺少 API Key');
    });

    it('should throw if data is missing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: 'bad' }),
      });

      await expect(fetchRemoteModels({ baseUrl: 'https://api.openai.com/v1', apiKey: 'test-key' })).rejects.toThrow('响应结构不符合预期 (缺少 data 数组)');
    });

    it('should throw if id is missing in non-empty array', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ name: 'model-1' }] }),
      });

      await expect(fetchRemoteModels({ baseUrl: 'https://api.openai.com/v1', apiKey: 'test-key' })).rejects.toThrow('响应结构不符合预期 (缺少 id 字段)');
    });

    it('should handle HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });

      await expect(fetchRemoteModels({ baseUrl: 'https://api.openai.com/v1', apiKey: 'test-key' })).rejects.toThrow('HTTP 错误: 401');
    });

    it('should handle Abort/Network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(fetchRemoteModels({ baseUrl: 'https://api.openai.com/v1', apiKey: 'test-key' })).rejects.toThrow('网络错误');
    });
  });
});

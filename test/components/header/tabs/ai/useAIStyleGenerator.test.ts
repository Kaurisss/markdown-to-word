// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { useAIStyleGenerator } from '@/components/header/tabs/ai/useAIStyleGenerator';
import { AIProvider } from '@/types/ai';

const provider: AIProvider = {
  id: 'test-provider',
  name: 'Test Provider',
  isEnabled: true,
  apiKey: 'test-key',
  baseUrl: 'https://example.com/chat/completions',
  models: [{ id: 'test-model', name: 'Test Model' }],
};

function mockAIResponse(content: string) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content } }],
    }),
  }));
}

describe('useAIStyleGenerator', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('extracts and applies a supported patch from a JSON code fence', async () => {
    mockAIResponse([
      '配置如下：',
      '```json',
      '{"styles":{"body":{"color":"#123456","bold":false}}}',
      '```',
    ].join('\n'));
    const onCfgChange = vi.fn();
    const onShowToast = vi.fn();
    const { result } = renderHook(() => useAIStyleGenerator({
      aiProviders: [provider],
      selectedModel: { providerId: provider.id, modelId: 'test-model' },
      cfg: structuredClone(DEFAULT_CONFIG),
      onCfgChange,
      onShowToast,
      onShowConfig: vi.fn(),
    }));

    let succeeded = false;
    await act(async () => {
      succeeded = await result.current.generate('正文改成深灰色');
    });

    expect(succeeded).toBe(true);
    expect(onCfgChange).toHaveBeenCalledWith(expect.objectContaining({
      styles: expect.objectContaining({
        body: expect.objectContaining({
          color: '#123456',
          bold: false,
        }),
      }),
    }));
    expect(onShowToast).toHaveBeenCalledWith('AI 样式生成成功！', 'success');
  });

  it.each([
    ['unknown fields', '{"foo":"bar"}'],
    ['string booleans', '{"styles":{"body":{"bold":"false"}}}'],
  ])('rejects %s without applying a config', async (_case, content) => {
    mockAIResponse(content);
    const onCfgChange = vi.fn();
    const onShowToast = vi.fn();
    const { result } = renderHook(() => useAIStyleGenerator({
      aiProviders: [provider],
      selectedModel: { providerId: provider.id, modelId: 'test-model' },
      cfg: structuredClone(DEFAULT_CONFIG),
      onCfgChange,
      onShowToast,
      onShowConfig: vi.fn(),
    }));

    let succeeded = true;
    await act(async () => {
      succeeded = await result.current.generate('更新正文样式');
    });

    expect(succeeded).toBe(false);
    expect(onCfgChange).not.toHaveBeenCalled();
    expect(onShowToast).toHaveBeenCalledWith(
      expect.stringContaining('配置格式无效'),
      'error',
    );
  });
});

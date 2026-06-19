import { describe, expect, it } from 'vitest';
import {
  AI_API_GUIDE,
  AI_API_ENDPOINT_EXAMPLES,
  AI_MODEL_ID_EXAMPLES,
} from './apiGuide';

describe('apiGuide', () => {
  it('documents the supported OpenAI-compatible chat completions contract', () => {
    expect(AI_API_GUIDE.supportedProtocol).toContain('OpenAI-compatible');
    expect(AI_API_GUIDE.supportedProtocol).toContain('Chat Completions');
    expect(AI_API_GUIDE.requestShape).toContain('POST');
    expect(AI_API_GUIDE.requestShape).toContain('messages');
    expect(AI_API_GUIDE.requestShape).toContain('Authorization: Bearer');
  });

  it('uses full chat completions endpoint examples', () => {
    expect(AI_API_ENDPOINT_EXAMPLES).toEqual(expect.arrayContaining([
      expect.objectContaining({
        provider: 'OpenAI',
        url: 'https://api.openai.com/v1/chat/completions',
      }),
      expect.objectContaining({
        provider: '阿里云百炼',
        url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      }),
      expect.objectContaining({
        provider: 'Google Gemini OpenAI 兼容',
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      }),
    ]));
    expect(AI_API_ENDPOINT_EXAMPLES.every(item => item.url.endsWith('/chat/completions'))).toBe(true);
  });

  it('contains model id examples that match configured provider style', () => {
    expect(AI_MODEL_ID_EXAMPLES).toEqual(expect.arrayContaining([
      'gpt-4o',
      'qwen-plus',
      'deepseek-chat',
      'gemini-1.5-flash',
    ]));
  });
});
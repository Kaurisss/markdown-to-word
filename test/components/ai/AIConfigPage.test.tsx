// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIConfigPage } from '@/components/ai/AIConfigPage';

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    isMaximized: vi.fn().mockResolvedValue(false),
    listen: vi.fn().mockResolvedValue(vi.fn()),
    toggleMaximize: vi.fn(),
    minimize: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('@lobehub/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted
  const React = require('react');
  function makeIcon(name: string) {
    const MockSvg = ({ size }: { size?: number }) =>
      React.createElement('svg', { width: size, height: size, 'data-testid': `${name.toLowerCase()}-icon` });
    return Object.assign(MockSvg, { Color: MockSvg });
  }
  return Object.fromEntries([
    'Anthropic',
    'Baichuan',
    'Bailian',
    'ChatGLM',
    'Claude',
    'DeepSeek',
    'Doubao',
    'Gemini',
    'Grok',
    'Groq',
    'Hailuo',
    'Hunyuan',
    'InternLM',
    'Kling',
    'Meta',
    'Minimax',
    'Mistral',
    'Moonshot',
    'Nvidia',
    'Ollama',
    'OpenAI',
    'OpenRouter',
    'Perplexity',
    'Qwen',
    'SiliconCloud',
    'Spark',
    'Wenxin',
    'XAI',
    'Yi',
    'Zhipu',
  ].map((name) => [name, makeIcon(name)]));
});

describe('AIConfigPage', () => {
  it('shows supported API setup guidance', () => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<AIConfigPage isActive onBack={vi.fn()} />);
    fireEvent.click(screen.getByTitle('API 配置指南'));

    expect(screen.getByText('支持的 API 类型')).toBeDefined();
    expect(screen.getByText(/OpenAI-compatible Chat Completions/)).toBeDefined();
    expect(screen.getByText(/Authorization: Bearer/)).toBeDefined();
    expect(screen.getByText('https://api.openai.com/v1/chat/completions')).toBeDefined();
    expect(screen.getByText('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')).toBeDefined();
  });
});

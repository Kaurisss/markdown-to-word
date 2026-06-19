// @vitest-environment jsdom

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIConfigWindow } from './AIConfigWindow';

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    show: vi.fn(),
  }),
}));

vi.mock('@lobehub/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted
  const React = require('react');
  const MockSvg = ({ size }: { size?: number }) =>
    React.createElement('svg', { width: size, height: size, 'data-testid': 'mock-icon' });
  function makeIcon() {
    return Object.assign(MockSvg, { Color: MockSvg });
  }
  return {
    Alibaba: makeIcon(),
    Anthropic: MockSvg,
    DeepSeek: makeIcon(),
    Gemini: makeIcon(),
    Github: MockSvg,
    Google: makeIcon(),
    Grok: MockSvg,
    Moonshot: MockSvg,
    Ollama: MockSvg,
    OpenAI: MockSvg,
    Qwen: makeIcon(),
    SiliconCloud: makeIcon(),
    Zhipu: MockSvg,
  };
});

describe('AIConfigWindow', () => {
  it('shows supported API setup guidance', () => {
    localStorage.clear();

    render(<AIConfigWindow />);

    expect(screen.getByText('支持的 API 类型')).toBeDefined();
    expect(screen.getByText(/OpenAI-compatible Chat Completions/)).toBeDefined();
    expect(screen.getByText(/Authorization: Bearer/)).toBeDefined();
    expect(screen.getByText('https://api.openai.com/v1/chat/completions')).toBeDefined();
    expect(screen.getByText('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')).toBeDefined();
  });
});
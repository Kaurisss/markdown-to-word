// @vitest-environment jsdom

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock @lobehub/icons to avoid transitive @emoji-mart/data JSON import issues in vitest.
// vi.mock is hoisted, so all helpers must be defined inside the factory.
vi.mock('@lobehub/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted; cannot use ESM imports
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

import { ProviderIcon } from '@/components/ai/ProviderIcon';
import { getProviderInitials } from '@/components/ai/providerIcons';

describe('ProviderIcon', () => {
  it('renders initials fallback for unknown provider icons', () => {
    render(<ProviderIcon name="Local AI" iconKey="unknown" />);
    expect(screen.getByText('LA')).toBeDefined();
  });

  it('renders Chinese initials fallback', () => {
    render(<ProviderIcon name="本地模型" />);
    expect(screen.getByText('本地')).toBeDefined();
  });

  it('derives fallback icon from provider id', () => {
    const { container } = render(<ProviderIcon providerId="openai" name="OpenAI" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('uses Bailian for DashScope by default', () => {
    render(<ProviderIcon providerId="dashscope" name="阿里云百炼" />);
    expect(screen.getByTestId('bailian-icon')).toBeDefined();
  });

  it('builds ascii initials from words', () => {
    expect(getProviderInitials('Local AI')).toBe('LA');
  });
});

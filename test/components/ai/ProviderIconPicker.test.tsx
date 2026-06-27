// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
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

import { ProviderIconPicker } from '@/components/ai/ProviderIconPicker';

describe('ProviderIconPicker', () => {
  it('selects an icon key', () => {
    const onChange = vi.fn();

    render(<ProviderIconPicker value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /OpenAI/ }));

    expect(onChange).toHaveBeenCalledWith('openai');
  });

  it('clears selected icon key', () => {
    const onChange = vi.fn();

    render(<ProviderIconPicker value="openai" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /清除/ }));

    expect(onChange).toHaveBeenCalledWith('');
  });
});

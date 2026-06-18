// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock @lobehub/icons to avoid transitive @emoji-mart/data JSON import issues in vitest.
// vi.mock is hoisted, so all helpers must be defined inside the factory.
vi.mock('@lobehub/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted; cannot use ESM imports
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

import { ProviderIconPicker } from './ProviderIconPicker';

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

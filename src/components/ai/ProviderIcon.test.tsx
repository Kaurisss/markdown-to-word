// @vitest-environment jsdom

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock @lobehub/icons to avoid transitive @emoji-mart/data JSON import issues in vitest.
// vi.mock is hoisted, so all helpers must be defined inside the factory.
vi.mock('@lobehub/icons', () => {
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

import { ProviderIcon } from './ProviderIcon';
import { getProviderInitials } from './providerIcons';

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

  it('builds ascii initials from words', () => {
    expect(getProviderInitials('Local AI')).toBe('LA');
  });
});

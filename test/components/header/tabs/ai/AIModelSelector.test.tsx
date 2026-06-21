// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIProvider } from '@/types/ai';
import { AIModelSelector } from '@/components/header/tabs/ai/AIModelSelector';

const providers: AIProvider[] = [
  {
    id: 'enabled-a',
    name: 'Enabled A',
    isEnabled: true,
    apiKey: 'key-a',
    baseUrl: 'https://a.example.com',
    models: [
      { id: 'a-fast', name: 'A Fast' },
      { id: 'a-pro', name: 'A Pro' },
    ],
  },
  {
    id: 'disabled-b',
    name: 'Disabled B',
    isEnabled: false,
    apiKey: 'key-b',
    baseUrl: 'https://b.example.com',
    models: [{ id: 'b-model', name: 'B Model' }],
  },
  {
    id: 'enabled-empty',
    name: 'Enabled Empty',
    isEnabled: true,
    apiKey: '',
    baseUrl: 'https://empty.example.com',
    models: [],
  },
];

describe('AIModelSelector', () => {
  it('shows enabled providers grouped in the popover and hides disabled providers', () => {
    render(
      <AIModelSelector
        aiProviders={providers}
        selectedModel={null}
        onModelChange={vi.fn()}
        onConfigClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /选择模型/ }));

    expect(screen.getByText('Enabled A')).toBeDefined();
    expect(screen.queryByText('Disabled B')).toBeNull();
    expect(screen.getByText('A Fast')).toBeDefined();
    expect(screen.getByText('A Pro')).toBeDefined();
    expect(screen.getByText('Enabled Empty')).toBeDefined();
    expect(screen.getByText('暂无模型')).toBeDefined();
  });

  it('selects a model from the grouped picker', () => {
    const onModelChange = vi.fn();

    render(
      <AIModelSelector
        aiProviders={providers}
        selectedModel={null}
        onModelChange={onModelChange}
        onConfigClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /选择模型/ }));
    fireEvent.click(screen.getByRole('button', { name: /A Pro/ }));

    expect(onModelChange).toHaveBeenCalledWith({ providerId: 'enabled-a', modelId: 'a-pro' });
  });

  it('marks the current selected model', () => {
    render(
      <AIModelSelector
        aiProviders={providers}
        selectedModel={{ providerId: 'enabled-a', modelId: 'a-fast' }}
        onModelChange={vi.fn()}
        onConfigClick={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /A Fast/ }));
    expect(screen.getByText('已选择')).toBeDefined();
  });

  it('opens configuration when no enabled provider has selectable models', async () => {
    const onConfigClick = vi.fn();

    render(
      <AIModelSelector
        aiProviders={providers.map(provider => ({ ...provider, isEnabled: false }))}
        selectedModel={null}
        onModelChange={vi.fn()}
        onConfigClick={onConfigClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /配置模型/ }));
    fireEvent.click(screen.getByRole('button', { name: /打开 AI 配置/ }));

    await waitFor(() => expect(onConfigClick).toHaveBeenCalledTimes(1));
  });
});

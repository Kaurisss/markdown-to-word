// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIPromptInput } from './AIPromptInput';

describe('AIPromptInput', () => {
  it('shows a compact trigger with the current prompt preview', () => {
    render(
      <AIPromptInput
        value="正文仿宋三号，标题黑体"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /正文仿宋三号，标题黑体/ })).toBeDefined();
  });

  it('opens a textarea panel and edits the prompt', () => {
    const onChange = vi.fn();

    render(
      <AIPromptInput
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /描述文档样式/ }));
    fireEvent.change(screen.getByRole('textbox', { name: /详细描述样式/ }), {
      target: { value: '正文宋体小四' },
    });

    expect(onChange).toHaveBeenCalledWith('正文宋体小四');
  });

  it('fills template text from a prompt example', () => {
    const onChange = vi.fn();

    render(
      <AIPromptInput
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /描述文档样式/ }));
    fireEvent.click(screen.getByRole('button', { name: /公文风格/ }));

    expect(onChange).toHaveBeenCalledWith('正文仿宋三号，标题黑体小二加粗，行距1.5倍');
  });

  it('submits from the panel button', async () => {
    const onSubmit = vi.fn();

    render(
      <AIPromptInput
        value="正文宋体小四"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /正文宋体小四/ }));
    fireEvent.click(screen.getByRole('button', { name: /生成样式/ }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('submits with Enter from the compact trigger when focused', async () => {
    const onSubmit = vi.fn();

    render(
      <AIPromptInput
        value="正文宋体小四"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: /正文宋体小四/ }), { key: 'Enter' });

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});

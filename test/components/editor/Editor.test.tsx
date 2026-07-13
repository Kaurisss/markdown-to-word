// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Editor from '@/components/editor/Editor';

vi.mock('@uiw/react-md-editor', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted
  const React = require('react');
  const command = {};

  return {
    default: React.forwardRef(function MockMDEditor(
      props: {
        value: string;
        preview: string;
        onChange: (value?: string) => void;
        commands: Array<{
          name?: string;
          keyCommand?: string;
          buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
          execute?: () => void;
        }>;
      },
      ref: React.ForwardedRef<HTMLDivElement>,
    ) {
      return (
        <div ref={ref} data-testid="md-editor" data-preview={props.preview}>
          <span>{props.value}</span>
          <button type="button" onClick={() => props.onChange('updated')}>更新内容</button>
          {props.commands
            .filter((command) => command.name === 'toggle-markdown-mode')
            .map((command) => (
              <button
                key={command.name}
                type="button"
                disabled={
                  props.preview === 'preview'
                  && !/(preview|fullscreen)/.test(command.keyCommand ?? '')
                }
                {...command.buttonProps}
                onClick={() => command.execute?.()}
              />
            ))}
        </div>
      );
    }),
    commands: {
      bold: command,
      italic: command,
      strikethrough: command,
      code: command,
      link: command,
      divider: command,
      quote: command,
      unorderedListCommand: command,
      orderedListCommand: command,
      table: command,
    },
    MarkdownUtil: {
      selectWord: vi.fn(),
      executeCommand: vi.fn(),
    },
  };
});

describe('Editor', () => {
  it('passes the controlled mode and content to the third-party editor', () => {
    const { rerender } = render(
      <Editor
        value="# Title"
        onChange={vi.fn()}
        mode="edit"
        onModeChange={vi.fn()}
        theme="light"
      />,
    );

    expect(screen.getByTestId('md-editor').getAttribute('data-preview')).toBe('edit');
    expect(screen.getByText('# Title')).toBeDefined();

    rerender(
      <Editor
        value="# Title"
        onChange={vi.fn()}
        mode="preview"
        onModeChange={vi.fn()}
        theme="dark"
      />,
    );

    expect(screen.getByTestId('md-editor').getAttribute('data-preview')).toBe('preview');
  });

  it('writes third-party editor changes back to the app', () => {
    const onChange = vi.fn();
    render(
      <Editor
        value="initial"
        onChange={onChange}
        mode="edit"
        onModeChange={vi.fn()}
        theme="light"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '更新内容' }));
    expect(onChange).toHaveBeenCalledWith('updated');
  });

  it('toggles Markdown edit and preview modes from the editor toolbar', () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <Editor
        value="initial"
        onChange={vi.fn()}
        mode="edit"
        onModeChange={onModeChange}
        theme="light"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '切换 Markdown 预览' }));
    expect(onModeChange).toHaveBeenCalledWith('preview');

    rerender(
      <Editor
        value="initial"
        onChange={vi.fn()}
        mode="preview"
        onModeChange={onModeChange}
        theme="light"
      />,
    );

    const editModeButton = screen.getByRole('button', { name: '切换 Markdown 编辑' });
    expect((editModeButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(editModeButton);
    expect(onModeChange).toHaveBeenLastCalledWith('edit');
  });
});

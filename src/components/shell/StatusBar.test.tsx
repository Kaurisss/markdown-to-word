// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusBar } from './StatusBar';

vi.mock('@mingcute/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted; cannot use ESM imports
  const React = require('react');
  const MockIcon = ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'statusbar-icon' });

  return {
    Search2Line: MockIcon,
    TransferHorizontalLine: MockIcon,
    EditLine: MockIcon,
    Columns2Line: MockIcon,
    Eye2Line: MockIcon,
    Download2Line: MockIcon,
    Settings3Line: MockIcon,
  };
});

describe('StatusBar', () => {
  it('renders document stats and the left/right quick action groups', () => {
    render(
      <StatusBar
        content={'# Title\n\nBody text'}
        viewMode="split"
        onSearchClick={vi.fn()}
        onReplaceClick={vi.fn()}
        onViewModeChange={vi.fn()}
        onExport={vi.fn()}
        onSettingsClick={vi.fn()}
      />
    );

    expect(screen.getByText('字符: 18')).toBeDefined();
    expect(screen.getByText('字符(不含空格): 14')).toBeDefined();
    expect(screen.getByText('行数: 3')).toBeDefined();
    expect(screen.getByText('段落: 2')).toBeDefined();
    expect(screen.getByRole('button', { name: '搜索' })).toBeDefined();
    expect(screen.getByRole('button', { name: '替换' })).toBeDefined();
    expect(screen.getByRole('button', { name: '编辑器视图' })).toBeDefined();
    expect(screen.getByRole('button', { name: '双栏视图' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '预览视图' })).toBeDefined();
    expect(screen.getByRole('button', { name: '导出 Word' })).toBeDefined();
    expect(screen.getByRole('button', { name: '设置' })).toBeDefined();
  });

  it('calls action callbacks from statusbar buttons', () => {
    const onSearchClick = vi.fn();
    const onReplaceClick = vi.fn();
    const onViewModeChange = vi.fn();
    const onExport = vi.fn();
    const onSettingsClick = vi.fn();

    render(
      <StatusBar
        content="body"
        viewMode="editor"
        onSearchClick={onSearchClick}
        onReplaceClick={onReplaceClick}
        onViewModeChange={onViewModeChange}
        onExport={onExport}
        onSettingsClick={onSettingsClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '搜索' }));
    fireEvent.click(screen.getByRole('button', { name: '替换' }));
    fireEvent.click(screen.getByRole('button', { name: '双栏视图' }));
    fireEvent.click(screen.getByRole('button', { name: '导出 Word' }));
    fireEvent.click(screen.getByRole('button', { name: '设置' }));

    expect(onSearchClick).toHaveBeenCalledTimes(1);
    expect(onReplaceClick).toHaveBeenCalledTimes(1);
    expect(onViewModeChange).toHaveBeenCalledWith('split');
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('disables export while exporting', () => {
    const onExport = vi.fn();

    render(
      <StatusBar
        content="body"
        viewMode="preview"
        onViewModeChange={vi.fn()}
        onExport={onExport}
        isExporting
      />
    );

    const exportButton = screen.getByRole('button', { name: '正在导出' });
    expect((exportButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(exportButton);
    expect(onExport).not.toHaveBeenCalled();
  });
});
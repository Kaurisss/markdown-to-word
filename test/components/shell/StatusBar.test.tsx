// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StatusBar } from '@/components/shell/StatusBar';

vi.mock('@mingcute/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- vi.mock is hoisted; cannot use ESM imports
  const React = require('react');
  const MockIcon = ({ className }: { className?: string }) =>
    React.createElement('svg', { className, 'data-testid': 'statusbar-icon' });

  return {
    Search2Line: MockIcon,
    TransferHorizontalLine: MockIcon,
    Download2Line: MockIcon,
  };
});

describe('StatusBar', () => {
  it('renders document stats and the remaining quick action buttons', () => {
    render(
      <StatusBar
        content={'# Title\n\nBody text'}
        onSearchClick={vi.fn()}
        onReplaceClick={vi.fn()}
        onExport={vi.fn()}
      />
    );

    expect(screen.getByText('字符: 18')).toBeDefined();
    expect(screen.getByText('字符(不含空格): 14')).toBeDefined();
    expect(screen.getByText('行数: 3')).toBeDefined();
    expect(screen.getByText('段落: 2')).toBeDefined();
    expect(screen.getByRole('button', { name: '搜索' })).toBeDefined();
    expect(screen.getByRole('button', { name: '替换' })).toBeDefined();
    expect(screen.getByRole('button', { name: '导出 Word' })).toBeDefined();
    expect(screen.queryByRole('button', { name: '编辑器视图' })).toBeNull();
    expect(screen.queryByRole('button', { name: '双栏视图' })).toBeNull();
    expect(screen.queryByRole('button', { name: '预览视图' })).toBeNull();
    expect(screen.queryByRole('button', { name: '设置' })).toBeNull();
  });

  it('calls action callbacks from statusbar buttons', () => {
    const onSearchClick = vi.fn();
    const onReplaceClick = vi.fn();
    const onExport = vi.fn();

    render(
      <StatusBar
        content="body"
        onSearchClick={onSearchClick}
        onReplaceClick={onReplaceClick}
        onExport={onExport}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '搜索' }));
    fireEvent.click(screen.getByRole('button', { name: '替换' }));
    fireEvent.click(screen.getByRole('button', { name: '导出 Word' }));

    expect(onSearchClick).toHaveBeenCalledTimes(1);
    expect(onReplaceClick).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('disables export while exporting', () => {
    const onExport = vi.fn();

    render(
      <StatusBar
        content="body"
        onExport={onExport}
        isExporting
      />
    );

    const exportButton = screen.getByRole('button', { name: '正在导出' });
    expect((exportButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(exportButton);
    expect(onExport).not.toHaveBeenCalled();
  });

  it('shows preview loading and page count status', () => {
    const { rerender } = render(
      <StatusBar
        content="body"
        previewStatus="loading"
        previewPageCount={3}
      />
    );

    expect(screen.getByText('正在生成预览…')).toBeDefined();
    expect(screen.queryByText('3 页')).toBeNull();

    rerender(
      <StatusBar
        content="body"
        previewStatus="ready"
        previewPageCount={3}
      />
    );

    expect(screen.queryByText('正在生成预览…')).toBeNull();
    expect(screen.getByText('3 页')).toBeDefined();
  });
});

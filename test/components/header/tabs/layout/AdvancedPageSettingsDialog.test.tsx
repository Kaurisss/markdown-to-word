// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdvancedPageSettingsDialog } from '@/components/header/tabs/layout/AdvancedPageSettingsDialog';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { DocumentConfig } from '@/types/config';

function cloneConfig(): DocumentConfig {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG)) as DocumentConfig;
}

describe('AdvancedPageSettingsDialog', () => {
  it('updates header text and advanced export switches', () => {
    const cfg = cloneConfig();
    const onCfgChange = vi.fn();

    render(
      <AdvancedPageSettingsDialog
        open
        onOpenChange={vi.fn()}
        cfg={cfg}
        onCfgChange={onCfgChange}
      />
    );

    // Switch to Header tab
    fireEvent.click(screen.getByText('页眉设置'));

    fireEvent.change(screen.getByPlaceholderText('留空则不显示文字'), {
      target: { value: '课程设计' },
    });

    expect(onCfgChange).toHaveBeenLastCalledWith({
      ...cfg,
      global: {
        ...cfg.global,
        header: {
          ...cfg.global.header,
          text: '课程设计',
        },
      },
    });

    // Switch to Other tab
    fireEvent.click(screen.getByText('表格与规范'));

    fireEvent.click(screen.getByRole('switch', { name: '表头加粗' }));

    expect(onCfgChange).toHaveBeenLastCalledWith({
      ...cfg,
      global: {
        ...cfg.global,
        tableHeaderBold: true,
      },
    });
  });

  it('updates page size and body start settings', () => {
    const cfg = cloneConfig();
    const onCfgChange = vi.fn();

    render(
      <AdvancedPageSettingsDialog
        open
        onOpenChange={vi.fn()}
        cfg={cfg}
        onCfgChange={onCfgChange}
      />
    );

    // Click Paper Size tab (default)
    fireEvent.change(screen.getByDisplayValue('8.3'), {
      target: { value: '8.5' },
    });

    expect(onCfgChange).toHaveBeenLastCalledWith({
      ...cfg,
      global: {
        ...cfg.global,
        pageSize: {
          width: 8.5,
          height: 11.69,
          unit: 'in',
        },
      },
    });

    // Switch to Body Start tab
    fireEvent.click(screen.getByText('目录与正文'));

    fireEvent.click(screen.getByRole('switch', { name: '目录后正文重新编号' }));

    expect(onCfgChange).toHaveBeenLastCalledWith({
      ...cfg,
      global: {
        ...cfg.global,
        bodyStart: {
          ...cfg.global.bodyStart,
          restartPageNumberAfterToc: false,
        },
      },
    });
  });
});

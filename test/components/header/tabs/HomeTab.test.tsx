// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeTab } from '@/components/header/tabs/HomeTab';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { ConfigStyleKey } from '@/types/config';

describe('HomeTab style selector', () => {
  it('exposes document title, table, and caption styles', () => {
    const setActiveStyle = vi.fn();

    render(
      <HomeTab
        cfg={DEFAULT_CONFIG}
        onCfgChange={vi.fn()}
        activeStyle="body"
        setActiveStyle={setActiveStyle}
      />
    );

    (['题名', '表格', '题注'] as const).forEach((label) => {
      fireEvent.click(screen.getByRole('button', { name: label }));
    });

    expect(setActiveStyle).toHaveBeenNthCalledWith(1, 'documentTitle' satisfies ConfigStyleKey);
    expect(setActiveStyle).toHaveBeenNthCalledWith(2, 'table' satisfies ConfigStyleKey);
    expect(setActiveStyle).toHaveBeenNthCalledWith(3, 'caption' satisfies ConfigStyleKey);
  });
});

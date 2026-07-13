// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EditorSection } from '@/components/settings/EditorSection';

describe('EditorSection', () => {
  it('updates the synchronized scrolling preference', () => {
    const updateSettings = vi.fn();

    render(
      <EditorSection
        settings={{
          autoSave: false,
          showStatusBar: true,
          editorFontSize: 15,
          editorLineHeight: 32,
          editorWordWrap: true,
          scrollSyncEnabled: true,
        }}
        updateSettings={updateSettings}
      />,
    );

    fireEvent.click(screen.getByRole('switch', { name: '同步滚动' }));

    expect(updateSettings).toHaveBeenCalledWith({ scrollSyncEnabled: false });
  });
});

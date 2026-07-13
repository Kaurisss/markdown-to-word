// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '@/App';

vi.mock('@/components/header/Header', async () => {
  const ReactModule = await import('react');

  const MockHeader = ({
    onOpenAIConfig,
    onOpenSettings,
  }: {
    onOpenAIConfig: () => void;
    onOpenSettings: () => void;
  }) => {
    const [activeTab, setActiveTab] = ReactModule.useState('home');

    return (
      <div>
        <button type="button" onClick={() => setActiveTab('layout')}>切换布局标签</button>
        <button type="button" onClick={onOpenAIConfig}>打开 AI 配置</button>
        <button type="button" onClick={onOpenSettings}>打开设置</button>
        <span data-testid="active-ribbon-tab">{activeTab}</span>
      </div>
    );
  };

  return { default: MockHeader };
});

vi.mock('@/components/ai/AIConfigPage', async () => {
  const ReactModule = await import('react');

  const MockAIConfigPage = ({ onBack }: { onBack: () => void }) => {
    const [provider, setProvider] = ReactModule.useState('openai');

    return (
      <div>
        <button type="button" onClick={() => setProvider('anthropic')}>选择 Anthropic</button>
        <button type="button" onClick={onBack}>从 AI 返回</button>
        <span data-testid="selected-provider">{provider}</span>
      </div>
    );
  };

  return { AIConfigPage: MockAIConfigPage };
});

vi.mock('@/components/settings/SettingsPage', async () => {
  const ReactModule = await import('react');

  const MockSettingsPage = ({ onBack }: { onBack: () => void }) => {
    const [section, setSection] = ReactModule.useState('appearance');

    return (
      <div>
        <button type="button" onClick={() => setSection('shortcuts')}>选择快捷键</button>
        <button type="button" onClick={onBack}>从设置返回</button>
        <span data-testid="selected-settings-section">{section}</span>
      </div>
    );
  };

  return { SettingsPage: MockSettingsPage };
});

vi.mock('@/components/editor/Editor', async () => {
  const ReactModule = await import('react');
  return {
    default: ReactModule.forwardRef(() => <div data-testid="editor-surface" />),
  };
});

vi.mock('@/components/preview/Preview', async () => {
  const ReactModule = await import('react');
  return {
    default: ReactModule.forwardRef(() => <div data-testid="preview-surface" />),
  };
});

vi.mock('@/components/editor/SearchPopover', () => ({
  default: () => null,
}));

vi.mock('@/components/shell/StatusBar', () => ({
  StatusBar: () => null,
}));

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => null,
}));

vi.mock('@/components/ui/context-menu', () => ({
  DynamicContextMenu: () => null,
}));

vi.mock('@/components/shell/Toast', () => ({
  showAppToast: vi.fn(),
}));

vi.mock('@/config/documentConfigStorage', () => ({
  loadDocumentConfig: () => ({
    global: {},
    styles: { body: {} },
  }),
  saveDocumentConfig: vi.fn(),
}));

vi.mock('@/features/settings/store', () => ({
  useSettingsStore: () => ({
    settings: {
      theme: 'light',
      defaultViewMode: 'split',
      autoSave: false,
      defaultFontCn: 'SimSun',
      defaultFontEn: '',
      defaultFontSize: 12,
      defaultLineSpacing: 1.5,
      defaultSpaceAfter: 8,
      defaultAlignment: 'left',
      editorFontSize: 15,
      editorLineHeight: 32,
      editorWordWrap: true,
      scrollSyncEnabled: true,
      showStatusBar: false,
      windowBarDisplayMode: 'tabs',
      keyboardShortcuts: {},
    },
  }),
}));

vi.mock('@/features/editor/useEditorState', () => ({
  useEditorState: () => ({
    content: '# Test',
    canUndo: false,
    canRedo: false,
    updateContent: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    handleEditorKeyDown: vi.fn(),
    undoStackRef: { current: [] },
    redoStackRef: { current: [] },
  }),
}));

vi.mock('@/features/editor/useEditorFormatting', () => ({
  useEditorFormatting: () => ({ applyFormat: vi.fn() }),
}));

vi.mock('@/features/editor/useSearchReplace', () => ({
  useSearchReplace: () => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
    showSearch: false,
    setShowSearch: vi.fn(),
    showReplace: false,
    setShowReplace: vi.fn(),
    currentMatchIndex: 0,
    setCurrentMatchIndex: vi.fn(),
    matchCount: 0,
    replaceText: '',
    setReplaceText: vi.fn(),
    caseSensitive: false,
    setCaseSensitive: vi.fn(),
    wholeWord: false,
    setWholeWord: vi.fn(),
    useRegex: false,
    setUseRegex: vi.fn(),
    handleReplace: vi.fn(),
    handleReplaceAll: vi.fn(),
    closeSearch: vi.fn(),
  }),
}));

vi.mock('@/features/editor/useContextMenu', () => ({
  useContextMenu: () => ({
    contextMenu: { visible: false, x: 0, y: 0, items: [] },
    handleContextMenu: vi.fn(),
    closeContextMenu: vi.fn(),
  }),
}));

vi.mock('@/features/editor/useFileDrop', () => ({
  useFileDrop: () => ({ isFileDragActive: false }),
}));

vi.mock('@/features/export/useExport', () => ({
  useExport: () => ({ isExporting: false, handleExport: vi.fn() }),
}));

vi.mock('@/features/settings/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/features/editor/useScrollSync', () => ({
  useScrollSync: vi.fn(),
}));

vi.mock('@/features/editor/useAutoSave', () => ({
  useAutoSave: vi.fn(),
}));

vi.mock('@/features/editor/useClipboard', () => ({
  useClipboard: () => ({
    handleCopy: vi.fn(),
    handleCut: vi.fn(),
    handlePaste: vi.fn(),
  }),
}));

vi.mock('@/features/editor/useGlobalShortcuts', () => ({
  useGlobalShortcuts: vi.fn(),
}));

describe('App page navigation', () => {
  it('keeps all pages mounted and preserves local page state while navigating', () => {
    render(<App />);

    const editorPage = document.querySelector('[data-app-page="editor"]');
    const aiPage = document.querySelector('[data-app-page="ai-config"]');
    const settingsPage = document.querySelector('[data-app-page="settings"]');

    expect(editorPage?.getAttribute('aria-hidden')).toBe('false');
    expect(aiPage?.getAttribute('aria-hidden')).toBe('true');
    expect(settingsPage?.getAttribute('aria-hidden')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '切换布局标签' }));
    fireEvent.click(screen.getByRole('button', { name: '打开 AI 配置' }));

    expect(editorPage?.getAttribute('aria-hidden')).toBe('true');
    expect(aiPage?.getAttribute('aria-hidden')).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: '选择 Anthropic' }));
    fireEvent.click(screen.getByRole('button', { name: '从 AI 返回' }));

    expect(screen.getByTestId('active-ribbon-tab').textContent).toBe('layout');

    fireEvent.click(screen.getByRole('button', { name: '打开 AI 配置' }));
    expect(screen.getByTestId('selected-provider').textContent).toBe('anthropic');
    fireEvent.click(screen.getByRole('button', { name: '从 AI 返回' }));

    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));
    fireEvent.click(screen.getByRole('button', { name: '选择快捷键' }));
    fireEvent.click(screen.getByRole('button', { name: '从设置返回' }));
    fireEvent.click(screen.getByRole('button', { name: '打开设置' }));

    expect(screen.getByTestId('selected-settings-section').textContent).toBe('shortcuts');
    expect(settingsPage?.getAttribute('aria-hidden')).toBe('false');
  });
});

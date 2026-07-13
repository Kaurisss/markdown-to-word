// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadModule() {
  vi.resetModules();
  return import('@/features/settings/store');
}

describe('settingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default settings', async () => {
    const { useSettingsStore } = await loadModule();

    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings).toMatchObject({
      theme: 'light',
      defaultViewMode: 'split',
      autoSave: false,
      defaultFontCn: 'SimSun',
      defaultFontEn: '',
      defaultFontSize: 12,
      editorFontSize: 15,
      editorLineHeight: 32,
      editorWordWrap: true,
      scrollSyncEnabled: true,
      showStatusBar: true,
      keyboardShortcuts: {
        find: { ctrl: true, alt: false, shift: false, meta: false, key: 'F' },
        replace: { ctrl: true, alt: false, shift: false, meta: false, key: 'H' },
        bold: { ctrl: true, alt: false, shift: false, meta: false, key: 'B' },
      },
    });
  });

  it('migrates legacy app_theme when md2word_settings is missing', async () => {
    localStorage.setItem('app_theme', 'dark');
    const { useSettingsStore } = await loadModule();

    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.theme).toBe('dark');
  });

  it('migrates old settings by filling default keyboard shortcuts', async () => {
    localStorage.setItem('md2word_settings', JSON.stringify({
      theme: 'dark',
      defaultViewMode: 'preview',
      autoSave: true,
      defaultFontCn: 'SimHei',
      defaultFontEn: 'Arial',
      defaultFontSize: 14,
    }));

    const { useSettingsStore } = await loadModule();
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.keyboardShortcuts.find).toEqual({
      ctrl: true,
      alt: false,
      shift: false,
      meta: false,
      key: 'F',
    });
    expect(result.current.settings).toMatchObject({
      editorFontSize: 15,
      editorLineHeight: 32,
      editorWordWrap: true,
      scrollSyncEnabled: true,
      showStatusBar: true,
    });
  });

  it('persists setting updates to both storage keys', async () => {
    const { useSettingsStore } = await loadModule();
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateSettings({
        theme: 'dark',
        autoSave: true,
        editorFontSize: 16,
        editorLineHeight: 34,
        editorWordWrap: false,
        scrollSyncEnabled: false,
        showStatusBar: false,
      });
    });

    // V2 persist format: { state: { ...settings }, version: 2 }
    const stored = JSON.parse(localStorage.getItem('md2word_settings') || '{}');
    expect(stored.state).toMatchObject({
      theme: 'dark',
      autoSave: true,
      editorFontSize: 16,
      editorLineHeight: 34,
      editorWordWrap: false,
      scrollSyncEnabled: false,
      showStatusBar: false,
    });
    expect(stored.version).toBe(2);
    expect(localStorage.getItem('app_theme')).toBe('dark');
  });

  it('keeps auto-save helpers outside the zustand store', async () => {
    const {
      loadAutoSavedContent,
      saveAutoSaveContent,
      clearAutoSaveContent,
    } = await loadModule();

    saveAutoSaveContent('draft');
    expect(loadAutoSavedContent()).toBe('draft');

    clearAutoSaveContent();
    expect(loadAutoSavedContent()).toBeNull();
  });

  it('falls back to defaults when storage is corrupted', async () => {
    localStorage.setItem('md2word_settings', '{bad json');
    const { useSettingsStore } = await loadModule();

    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.theme).toBe('light');
    expect(result.current.settings.defaultViewMode).toBe('split');
  });

  it('migrates legacy compact windowBarDisplayMode to tabs', async () => {
    localStorage.setItem('md2word_settings', JSON.stringify({
      theme: 'dark',
      windowBarDisplayMode: 'compact',
    }));

    const { useSettingsStore } = await loadModule();
    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.windowBarDisplayMode).toBe('tabs');
    expect(result.current.settings.theme).toBe('dark');
  });
});

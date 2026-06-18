// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadModule() {
  vi.resetModules();
  return import('./store');
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
    });
  });

  it('migrates legacy app_theme when md2word_settings is missing', async () => {
    localStorage.setItem('app_theme', 'dark');
    const { useSettingsStore } = await loadModule();

    const { result } = renderHook(() => useSettingsStore());

    expect(result.current.settings.theme).toBe('dark');
  });

  it('persists setting updates to both storage keys', async () => {
    const { useSettingsStore } = await loadModule();
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      result.current.updateSettings({ theme: 'dark', autoSave: true });
    });

    expect(JSON.parse(localStorage.getItem('md2word_settings') || '{}')).toMatchObject({
      theme: 'dark',
      autoSave: true,
    });
    expect(localStorage.getItem('app_theme')).toBe('dark');
  });

  it('updates from storage events', async () => {
    const { useSettingsStore } = await loadModule();
    const { result } = renderHook(() => useSettingsStore());

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'md2word_settings',
        newValue: JSON.stringify({ theme: 'dark', defaultViewMode: 'preview' }),
      }));
    });

    expect(result.current.settings.theme).toBe('dark');
    expect(result.current.settings.defaultViewMode).toBe('preview');
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
});

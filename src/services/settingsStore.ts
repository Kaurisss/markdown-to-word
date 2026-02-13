import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'md2word_settings';
const AUTO_SAVE_CONTENT_KEY = 'md2word_auto_save_content';
const SETTINGS_CHANNEL = 'md2word_settings_channel';

export type ViewMode = 'editor' | 'preview' | 'split';

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultViewMode: ViewMode;
  autoSave: boolean;
  defaultFontCn: string;
  defaultFontEn: string;
  defaultFontSize: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultViewMode: 'split',
  autoSave: false,
  defaultFontCn: 'SimSun',
  defaultFontEn: '',
  defaultFontSize: 12,
};

function loadSettings(): AppSettings {
  try {
    // Migrate existing theme from old key
    const oldTheme = localStorage.getItem('app_theme');
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : { ...DEFAULT_SETTINGS };

    // If old theme key exists and settings don't have it yet, migrate
    if (oldTheme && !stored) {
      settings.theme = oldTheme === 'dark' ? 'dark' : 'light';
    }

    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // Keep old theme key in sync for backward compatibility
  localStorage.setItem('app_theme', settings.theme);
}

export const useSettingsStore = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      // Dispatch storage event for other windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: SETTINGS_KEY,
        newValue: JSON.stringify(next),
      }));
      // Broadcast update for multi-webview sync in Tauri.
      try {
        const channel = new BroadcastChannel(SETTINGS_CHANNEL);
        channel.postMessage(next);
        channel.close();
      } catch {
        // Ignore when BroadcastChannel is unavailable.
      }
      return next;
    });
  }, []);

  // Listen for storage changes from other windows
  useEffect(() => {
    let channel: BroadcastChannel | null = null;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY && e.newValue) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
        } catch {
          // ignore
        }
      }
    };

    const handleBroadcastMessage = (event: MessageEvent<AppSettings>) => {
      if (!event.data) return;
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...event.data });
      } catch {
        // ignore
      }
    };

    try {
      channel = new BroadcastChannel(SETTINGS_CHANNEL);
      channel.onmessage = handleBroadcastMessage;
    } catch {
      // Ignore when BroadcastChannel is unavailable.
    }

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) {
        channel.onmessage = null;
        channel.close();
      }
    };
  }, []);

  return { settings, updateSettings };
};

// Auto-save helpers
export function loadAutoSavedContent(): string | null {
  try {
    return localStorage.getItem(AUTO_SAVE_CONTENT_KEY);
  } catch {
    return null;
  }
}

export function saveAutoSaveContent(content: string) {
  localStorage.setItem(AUTO_SAVE_CONTENT_KEY, content);
}

export function clearAutoSaveContent() {
  localStorage.removeItem(AUTO_SAVE_CONTENT_KEY);
}

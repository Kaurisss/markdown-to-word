import { create } from 'zustand';
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  KeyboardShortcutMap,
} from './keyboardShortcuts';

const SETTINGS_KEY = 'md2word_settings';
const AUTO_SAVE_CONTENT_KEY = 'md2word_auto_save_content';
const SETTINGS_CHANNEL = 'md2word_settings_channel';

export type ViewMode = 'editor' | 'preview' | 'split';

export type WindowBarDisplayMode = 'tabs' | 'dropdown';

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultViewMode: ViewMode;
  autoSave: boolean;
  defaultFontCn: string;
  defaultFontEn: string;
  defaultFontSize: number;
  defaultLineSpacing: number;
  defaultSpaceAfter: number;
  defaultAlignment: 'left' | 'center' | 'right' | 'justify';
  editorFontSize: number;
  editorLineHeight: number;
  editorWordWrap: boolean;
  showStatusBar: boolean;
  windowBarDisplayMode: WindowBarDisplayMode;
  keyboardShortcuts: KeyboardShortcutMap;
}

interface SettingsStoreState {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
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
  showStatusBar: true,
  windowBarDisplayMode: 'tabs',
  keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

function normalizeSettings(settings: Partial<AppSettings>): AppSettings {
  // 兼容旧版本：已移除的 'compact' 模式回退为 'tabs'
  const rawMode = settings.windowBarDisplayMode as unknown;
  if (rawMode === 'compact') {
    settings = { ...settings, windowBarDisplayMode: 'tabs' };
  }

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    keyboardShortcuts: {
      ...DEFAULT_KEYBOARD_SHORTCUTS,
      ...(settings.keyboardShortcuts ?? {}),
    },
  };
}

function loadFromStorage(): AppSettings {
  try {
    const oldTheme = localStorage.getItem('app_theme');
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : { ...DEFAULT_SETTINGS };
    if (oldTheme && !stored) {
      settings.theme = oldTheme === 'dark' ? 'dark' : 'light';
    }
    return normalizeSettings(settings);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveToStorage(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem('app_theme', settings.theme);
}

function emitSettingsChange(settings: AppSettings) {
  window.dispatchEvent(new StorageEvent('storage', {
    key: SETTINGS_KEY,
    newValue: JSON.stringify(settings),
  }));

  try {
    const channel = new BroadcastChannel(SETTINGS_CHANNEL);
    channel.postMessage(settings);
    channel.close();
  } catch {
    // Ignore when BroadcastChannel is unavailable.
  }
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  settings: loadFromStorage(),
  updateSettings: (patch) => {
    set((state) => {
      const settings = { ...state.settings, ...patch };
      saveToStorage(settings);
      emitSettingsChange(settings);
      return { settings };
    });
  },
}));

function applyExternalSettings(settings: Partial<AppSettings>) {
  useSettingsStore.setState({
    settings: normalizeSettings(settings),
  });
}

function handleStorageChange(e: StorageEvent) {
  if (e.key === SETTINGS_KEY && e.newValue) {
    try {
      applyExternalSettings(JSON.parse(e.newValue));
    } catch {
      // ignore
    }
  }
}

function handleBroadcastMessage(event: MessageEvent<AppSettings>) {
  if (!event.data) return;
  try {
    applyExternalSettings(event.data);
  } catch {
    // ignore
  }
}

window.addEventListener('storage', handleStorageChange);

let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel(SETTINGS_CHANNEL);
  broadcastChannel.onmessage = handleBroadcastMessage;
} catch {
  // Ignore when BroadcastChannel is unavailable.
}

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

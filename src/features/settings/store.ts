import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  KeyboardShortcutMap,
} from './keyboardShortcuts';
import { parseSettings } from './schemas';

const SETTINGS_KEY = 'md2word_settings';
const AUTO_SAVE_CONTENT_KEY = 'md2word_auto_save_content';

export type ViewMode = 'editor' | 'preview' | 'split';

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
  scrollSyncEnabled: boolean;
  showStatusBar: boolean;
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
  scrollSyncEnabled: true,
  showStatusBar: true,
  keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

/**
 * Custom persist storage that handles v1 (pre-persist) format migration.
 * V1 stored raw settings JSON; v2 wraps in { state, version }.
 * Also checks legacy 'app_theme' key when 'md2word_settings' is missing.
 */
const settingsStorage: PersistStorage<AppSettings> = {
  getItem: (name: string): StorageValue<AppSettings> | null => {
    const raw = localStorage.getItem(name);
    if (!raw) {
      // Legacy: check app_theme when md2word_settings is missing
      const oldTheme = localStorage.getItem('app_theme');
      if (oldTheme) {
        return {
          state: { ...DEFAULT_SETTINGS, theme: oldTheme === 'dark' ? 'dark' : 'light' },
          version: 0,
        };
      }
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      // V2+ format: { state, version }
      if (parsed && typeof parsed === 'object' && 'state' in parsed) {
        return parsed as StorageValue<AppSettings>;
      }
      // V1: raw settings JSON — wrap with version 0
      return { state: parsed as AppSettings, version: 0 };
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<AppSettings>): void => {
    const str = JSON.stringify(value);
    localStorage.setItem(name, str);
    // Write app_theme for backward compat with older code that reads it directly
    if (value.state?.theme) {
      localStorage.setItem('app_theme', value.state.theme);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) => {
        set((state) => {
          const settings = { ...state.settings, ...patch };
          return { settings };
        });
      },
    }),
    {
      name: SETTINGS_KEY,
      version: 2,
      storage: settingsStorage,
      partialize: (state) => state.settings,
      merge: (persisted, current) => ({
        ...current,
        settings: parseSettings(persisted) as AppSettings,
      }),
      migrate: (persistedState: unknown) => {
        // V0/V1 → V2: normalize through Zod schema (fills defaults, migrates compact mode)
        return parseSettings(persistedState) as AppSettings;
      },
    }
  )
);

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

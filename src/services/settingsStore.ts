import { useSyncExternalStore } from 'react';

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

// ── Persistence helpers ───────────────────────────────────────────

function loadFromStorage(): AppSettings {
  try {
    const oldTheme = localStorage.getItem('app_theme');
    const stored = localStorage.getItem(SETTINGS_KEY);
    const settings = stored ? JSON.parse(stored) : { ...DEFAULT_SETTINGS };
    if (oldTheme && !stored) {
      settings.theme = oldTheme === 'dark' ? 'dark' : 'light';
    }
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveToStorage(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem('app_theme', settings.theme);
}

// ── Singleton state ───────────────────────────────────────────────

let settings: AppSettings = loadFromStorage();

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach(cb => cb());
}

function getSnapshot(): AppSettings {
  return settings;
}

// ── Actions ───────────────────────────────────────────────────────

function updateSettings(patch: Partial<AppSettings>) {
  settings = { ...settings, ...patch };
  saveToStorage(settings);

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

  emit();
}

// ── Cross-window sync (registered once at module load) ───────────

function handleStorageChange(e: StorageEvent) {
  if (e.key === SETTINGS_KEY && e.newValue) {
    try {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) };
      emit();
    } catch {
      // ignore
    }
  }
}

function handleBroadcastMessage(event: MessageEvent<AppSettings>) {
  if (!event.data) return;
  try {
    settings = { ...DEFAULT_SETTINGS, ...event.data };
    emit();
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

// ── Hook ──────────────────────────────────────────────────────────

export const useSettingsStore = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return { settings: snapshot, updateSettings };
};

// ── Auto-save helpers (pure, not part of store) ──────────────────

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

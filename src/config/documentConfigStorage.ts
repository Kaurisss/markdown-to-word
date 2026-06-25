import { DocumentConfig } from '../types/config';
import { DEFAULT_CONFIG } from './defaultConfig';

export const DOCUMENT_CONFIG_STORAGE_KEY = 'md2word_document_config';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function clone<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults)) {
    return stored === undefined || stored === null ? clone(defaults) : clone(stored as T);
  }

  if (!isPlainObject(stored)) {
    return clone(defaults);
  }

  const merged: Record<string, unknown> = clone(defaults as Record<string, unknown>);
  for (const [key, value] of Object.entries(stored)) {
    const defaultValue = (defaults as Record<string, unknown>)[key];
    merged[key] = isPlainObject(defaultValue)
      ? (isPlainObject(value) ? mergeDefaults(defaultValue, value) : clone(defaultValue))
      : clone(value);
  }

  return merged as T;
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function normalizeDocumentConfig(value: unknown): DocumentConfig {
  const source = isPlainObject(value) ? value : undefined;
  const normalized = mergeDefaults(DEFAULT_CONFIG, source);
  const sourceGlobal = source && isPlainObject(source.global) ? source.global : undefined;

  if (typeof sourceGlobal?.pageMargin === 'number') {
    normalized.global.pageMargin = clone(sourceGlobal.pageMargin) as DocumentConfig['global']['pageMargin'];
  }

  return normalized;
}

export function loadDocumentConfig(storage: StorageLike | null = getBrowserStorage()): DocumentConfig {
  if (!storage) return clone(DEFAULT_CONFIG);

  try {
    const raw = storage.getItem(DOCUMENT_CONFIG_STORAGE_KEY);
    if (!raw) return clone(DEFAULT_CONFIG);
    return normalizeDocumentConfig(JSON.parse(raw));
  } catch {
    return clone(DEFAULT_CONFIG);
  }
}

export function saveDocumentConfig(config: DocumentConfig, storage: StorageLike | null = getBrowserStorage()): void {
  if (!storage) return;

  try {
    storage.setItem(DOCUMENT_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors so document editing and export stay available.
  }
}

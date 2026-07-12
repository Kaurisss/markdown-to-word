import { DocumentConfig } from '../types/config';
import { DEFAULT_CONFIG } from './defaultConfig';
import { parseDocumentConfig } from './documentConfigSchema';

export const DOCUMENT_CONFIG_STORAGE_KEY = 'md2word_document_config';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function clone<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
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
  return parseDocumentConfig(value);
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

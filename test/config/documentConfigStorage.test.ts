import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_CONFIG_STORAGE_KEY,
  loadDocumentConfig,
  normalizeDocumentConfig,
  saveDocumentConfig,
} from '@/config/documentConfigStorage';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe('documentConfigStorage', () => {
  it('fills missing fields from DEFAULT_CONFIG', () => {
    const normalized = normalizeDocumentConfig({
      global: {
        pageMargin: 1,
      },
      styles: {
        body: {
          ...DEFAULT_CONFIG.styles.body,
          fontSize: 14,
        },
      },
    });

    expect(normalized.global.pageMargin).toBe(1);
    expect(normalized.global.header).toEqual(DEFAULT_CONFIG.global.header);
    expect(normalized.styles.body.fontSize).toBe(14);
    expect(normalized.styles.documentTitle).toEqual(DEFAULT_CONFIG.styles.documentTitle);
    expect(normalized.styles.table).toEqual(DEFAULT_CONFIG.styles.table);
    expect(normalized.styles.caption).toEqual(DEFAULT_CONFIG.styles.caption);
  });

  it('falls back to default object fields when stored fields are malformed', () => {
    const normalized = normalizeDocumentConfig({
      global: 'bad',
      styles: {
        body: 'bad',
      },
    });

    expect(normalized.global).toEqual(DEFAULT_CONFIG.global);
    expect(normalized.styles.body).toEqual(DEFAULT_CONFIG.styles.body);
  });

  it('fills partial page margin objects while preserving numeric page margin values', () => {
    const partialMargin = normalizeDocumentConfig({
      global: {
        pageMargin: { top: 1 },
      },
    });
    const numericMargin = normalizeDocumentConfig({
      global: {
        pageMargin: 1,
      },
    });

    expect(partialMargin.global.pageMargin).toEqual({
      ...(DEFAULT_CONFIG.global.pageMargin as object),
      top: 1,
    });
    expect(numericMargin.global.pageMargin).toBe(1);
  });

  it('loads defaults when stored JSON is invalid', () => {
    const storage = new MemoryStorage();
    storage.setItem(DOCUMENT_CONFIG_STORAGE_KEY, '{bad json');

    expect(loadDocumentConfig(storage).global).toEqual(DEFAULT_CONFIG.global);
  });

  it('saves the document config under the document config key', () => {
    const storage = new MemoryStorage();

    saveDocumentConfig(DEFAULT_CONFIG, storage);

    expect(JSON.parse(storage.getItem(DOCUMENT_CONFIG_STORAGE_KEY) ?? '{}')).toEqual(DEFAULT_CONFIG);
  });
});

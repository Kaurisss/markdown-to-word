import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';

describe('DEFAULT_CONFIG', () => {
  it('keeps the default header text empty while preserving header support', () => {
    expect(DEFAULT_CONFIG.global.header?.enabled).toBe(true);
    expect(DEFAULT_CONFIG.global.header?.text).toBe('');
  });
});

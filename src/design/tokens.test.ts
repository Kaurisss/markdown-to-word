import { describe, expect, it } from 'vitest';
import { tokens, validateDesignTokens } from './tokens';

describe('design tokens', () => {
  it('keeps the checked-in token file valid', () => {
    expect(validateDesignTokens(tokens)).toEqual([]);
  });

  it('rejects invalid semantic colors', () => {
    const invalidTokens = structuredClone(tokens);
    invalidTokens.color.light.app = 'gray-50';

    expect(validateDesignTokens(invalidTokens)).toContain('color.light.app must be a 6-digit hex color');
  });
});

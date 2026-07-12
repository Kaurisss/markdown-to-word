import { describe, expect, it } from 'vitest';
import {
  documentConfigPatchSchema,
  documentConfigSchema,
} from '@/config/documentConfigSchema';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';

describe('documentConfigSchema', () => {
  it('rejects string boolean values instead of coercing them', () => {
    const config = structuredClone(DEFAULT_CONFIG) as unknown as {
      styles: { body: { bold: unknown } };
    };
    config.styles.body.bold = 'false';

    expect(documentConfigSchema.safeParse(config).success).toBe(false);
  });

  it('rejects empty and unknown AI patches', () => {
    expect(documentConfigPatchSchema.safeParse({}).success).toBe(false);
    expect(documentConfigPatchSchema.safeParse({ foo: 'bar' }).success).toBe(false);
    expect(documentConfigPatchSchema.safeParse({ global: {} }).success).toBe(false);
    expect(documentConfigPatchSchema.safeParse({
      styles: { body: { unsupported: true } },
    }).success).toBe(false);
  });

  it('accepts a supported partial AI patch', () => {
    expect(documentConfigPatchSchema.safeParse({
      styles: {
        body: {
          bold: false,
          lineSpacing: 1.5,
        },
      },
    }).success).toBe(true);
  });
});

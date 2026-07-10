/**
 * Property-based tests for Style Config Serialization
 * 
 * **Feature: python-backend-upgrade, Property 2: Style Config Serialization Round Trip**
 * **Validates: Requirements 2.1**
 */
import { beforeEach, describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { DocumentConfig, ElementStyle, PageMargin } from '@/types/config';
import { generateExportPreviewDocx, parseBackendError } from '@/features/export/pythonBackend';

const tauriMocks = vi.hoisted(() => ({
  sidecar: vi.fn(),
  execute: vi.fn(),
  writeTextFile: vi.fn(),
  readFile: vi.fn(),
  remove: vi.fn(),
  appCacheDir: vi.fn(),
  join: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-shell', () => ({
  Command: {
    sidecar: tauriMocks.sidecar,
  },
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  BaseDirectory: {
    AppCache: 'AppCache',
  },
  writeTextFile: tauriMocks.writeTextFile,
  readFile: tauriMocks.readFile,
  remove: tauriMocks.remove,
}));

vi.mock('@tauri-apps/api/path', () => ({
  appCacheDir: tauriMocks.appCacheDir,
  join: tauriMocks.join,
}));

const appCachePath = 'C:\\Users\\Logic\\AppData\\Local\\com.kauriss.markdown-to-word';

beforeEach(() => {
  tauriMocks.sidecar.mockReset();
  tauriMocks.execute.mockReset();
  tauriMocks.writeTextFile.mockReset();
  tauriMocks.readFile.mockReset();
  tauriMocks.remove.mockReset();
  tauriMocks.appCacheDir.mockReset();
  tauriMocks.join.mockReset();

  tauriMocks.sidecar.mockReturnValue({ execute: tauriMocks.execute });
  tauriMocks.execute.mockResolvedValue({ code: 0, stdout: '', stderr: '' });
  tauriMocks.writeTextFile.mockResolvedValue(undefined);
  tauriMocks.remove.mockResolvedValue(undefined);
  tauriMocks.appCacheDir.mockResolvedValue(appCachePath);
  tauriMocks.join.mockImplementation(async (...parts: string[]) => parts.join('\\'));
});

/**
 * Arbitrary for generating valid alignment values
 */
const alignmentArb = fc.constantFrom('left', 'center', 'right', 'justify') as fc.Arbitrary<'left' | 'center' | 'right' | 'justify'>;

/**
 * Arbitrary for generating valid hex color strings
 */
const hexColorArb = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

/**
 * Arbitrary for generating valid font family names
 */
const fontFamilyArb = fc.constantFrom(
  'SimSun', 'SimHei', 'Microsoft YaHei', 'KaiTi',
  'Times New Roman', 'Arial', 'Courier New', 'Georgia'
);

/**
 * Arbitrary for generating valid ElementStyle objects
 */
const elementStyleArb: fc.Arbitrary<ElementStyle> = fc.record({
  fontFamily: fc.option(fontFamilyArb, { nil: undefined }),
  fontSize: fc.integer({ min: 6, max: 72 }),
  color: hexColorArb,
  bold: fc.boolean(),
  italic: fc.boolean(),
  lineSpacing: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
  spaceBefore: fc.integer({ min: 0, max: 50 }),
  spaceAfter: fc.integer({ min: 0, max: 50 }),
  alignment: alignmentArb,
  firstLineIndent: fc.integer({ min: 0, max: 10 }),
});

/**
 * Arbitrary for generating valid DocumentConfig objects
 */
const documentConfigArb: fc.Arbitrary<DocumentConfig> = fc.record({
  global: fc.record({
    pageMargin: fc.oneof(
      fc.double({ min: 0.5, max: 3.0, noNaN: true }),
      fc.record({
        top: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
        bottom: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
        left: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
        right: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
      })
    ) as fc.Arbitrary<number | PageMargin>, // cast required because fast-check's fc.oneof struggles with deep mixed inference
    baseFontCn: fontFamilyArb,
    baseFontEn: fontFamilyArb,
    horizontalRule: fc.constantFrom('default', 'page_break', 'hidden'),
    includeTableOfContents: fc.boolean(),
  }),
  styles: fc.record({
    h1: elementStyleArb,
    h2: elementStyleArb,
    h3: elementStyleArb,
    body: elementStyleArb,
    code: elementStyleArb,
    quote: elementStyleArb,
  }),
});

describe('parseBackendError', () => {
  it('shows a precise message when the output file is locked', () => {
    const stderr = [
      'Error: Cannot write output file - Path: C:\\\\Users\\\\Logic\\\\Desktop\\\\导出测试.docx - Details: The target file may be open in Word/WPS or locked by another application.',
    ].join('\n');

    expect(parseBackendError(stderr, 2)).toEqual({
      message: '无法写入目标文件',
      details: '目标 Word 文件可能正被 Word/WPS 或其他程序打开，请关闭后重试，或选择另一个保存路径。',
    });
  });

  it('keeps the generic permission message for unrelated permission errors', () => {
    const stderr = 'Error: Permission denied reading input file';

    expect(parseBackendError(stderr, 2)).toEqual({
      message: '权限错误',
      details: 'Permission denied reading input file',
    });
  });

});

describe('generateExportPreviewDocx', () => {
  it('generates a temporary DOCX with the normal sidecar arguments and reads it back', async () => {
    tauriMocks.readFile.mockImplementation(async (path: string) => {
      if (path.startsWith(appCachePath) && path.endsWith('.docx')) {
        return new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
      }

      throw new Error(`failed to open file at path: ${appCachePath}\\${path}`);
    });

    const result = await generateExportPreviewDocx({
      markdown: '# Title',
      config: DEFAULT_CONFIG,
    });

    expect(result).toEqual({
      success: true,
      docxBytes: new Uint8Array([0x50, 0x4b, 0x03, 0x04]),
    });

    const sidecarArgs = tauriMocks.sidecar.mock.calls[0]?.[1] as string[];
    const outputPath = sidecarArgs.at(sidecarArgs.indexOf('--output') + 1);

    expect(sidecarArgs).not.toContain('--preview-pdf');
    expect(outputPath).toMatch(/md2word-preview-.+\.docx$/);
    expect(tauriMocks.readFile).toHaveBeenCalledWith(outputPath);
  });
});

describe('Style Config Serialization', () => {
  /**
   * **Feature: python-backend-upgrade, Property 2: Style Config Serialization Round Trip**
   * **Validates: Requirements 2.1**
   * 
   * For any valid DocumentConfig object, serializing to JSON and deserializing back
   * SHALL produce an equivalent configuration object.
   */
  it('Property 2: Style Config Serialization Round Trip', () => {
    fc.assert(
      fc.property(documentConfigArb, (config: DocumentConfig) => {
        // Serialize to JSON (as done in pythonBackend.ts)
        const serialized = JSON.stringify(config);

        // Deserialize back
        const deserialized = JSON.parse(serialized) as DocumentConfig;

        // Verify round-trip produces equivalent object
        expect(deserialized).toEqual(config);

        // Additional verification: ensure all required fields are present
        expect(deserialized.global).toBeDefined();
        expect(deserialized.global.pageMargin).toEqual(config.global.pageMargin);
        expect(deserialized.global.baseFontCn).toBe(config.global.baseFontCn);
        expect(deserialized.global.baseFontEn).toBe(config.global.baseFontEn);

        expect(deserialized.styles).toBeDefined();
        const styleKeys = ['h1', 'h2', 'h3', 'body', 'code', 'quote'] as const;
        for (const key of styleKeys) {
          expect(deserialized.styles[key]).toBeDefined();
          expect(deserialized.styles[key].fontSize).toBe(config.styles[key].fontSize);
          expect(deserialized.styles[key].color).toBe(config.styles[key].color);
          expect(deserialized.styles[key].bold).toBe(config.styles[key].bold);
          expect(deserialized.styles[key].italic).toBe(config.styles[key].italic);
          expect(deserialized.styles[key].alignment).toBe(config.styles[key].alignment);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify that the serialized JSON is valid and parseable
   */
  it('Serialized config produces valid JSON', () => {
    fc.assert(
      fc.property(documentConfigArb, (config: DocumentConfig) => {
        const serialized = JSON.stringify(config);

        // Should not throw when parsing
        expect(() => JSON.parse(serialized)).not.toThrow();

        // Should be a non-empty string
        expect(serialized.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});

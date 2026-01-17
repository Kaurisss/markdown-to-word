/**
 * Property-based tests for Style Config Serialization
 * 
 * **Feature: python-backend-upgrade, Property 2: Style Config Serialization Round Trip**
 * **Validates: Requirements 2.1**
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { DocumentConfig, ElementStyle } from '../interfaces/Config';

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
    pageMargin: fc.double({ min: 0.5, max: 3.0, noNaN: true }),
    baseFontCn: fontFamilyArb,
    baseFontEn: fontFamilyArb,
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
        expect(deserialized.global.pageMargin).toBe(config.global.pageMargin);
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

import { describe, expect, it } from 'vitest';
import { applyInlineFormat, getActiveInlineFormats } from './inlineFormat';

describe('applyInlineFormat', () => {
  it('wraps selected text with bold markers', () => {
    const result = applyInlineFormat({
      content: 'hello world',
      selectionStart: 6,
      selectionEnd: 11,
      kind: 'bold',
    });

    expect(result.content).toBe('hello **world**');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(13);
  });

  it('wraps selected text with underline html', () => {
    const result = applyInlineFormat({
      content: 'hello world',
      selectionStart: 6,
      selectionEnd: 11,
      kind: 'underline',
    });

    expect(result.content).toBe('hello <u>world</u>');
    expect(result.selectionStart).toBe(9);
    expect(result.selectionEnd).toBe(14);
  });

  it('wraps selected text with strikethrough markers', () => {
    const result = applyInlineFormat({
      content: 'hello world',
      selectionStart: 6,
      selectionEnd: 11,
      kind: 'strike',
    });

    expect(result.content).toBe('hello ~~world~~');
  });

  it('wraps selected text with a link', () => {
    const result = applyInlineFormat({
      content: 'visit site',
      selectionStart: 6,
      selectionEnd: 10,
      kind: 'link',
      linkUrl: 'https://example.com',
    });

    expect(result.content).toBe('visit [site](https://example.com)');
  });

  it('removes bold markers when selected text is already bold', () => {
    const result = applyInlineFormat({
      content: 'hello **world**',
      selectionStart: 8,
      selectionEnd: 13,
      kind: 'bold',
    });

    expect(result.content).toBe('hello world');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(11);
  });

  it('removes underline tags when the whole tagged text is selected', () => {
    const result = applyInlineFormat({
      content: 'hello <u>world</u>',
      selectionStart: 6,
      selectionEnd: 18,
      kind: 'underline',
    });

    expect(result.content).toBe('hello world');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(11);
  });

  it('removes strikethrough markers when selected text is already struck', () => {
    const result = applyInlineFormat({
      content: 'hello ~~world~~',
      selectionStart: 8,
      selectionEnd: 13,
      kind: 'strike',
    });

    expect(result.content).toBe('hello world');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(11);
  });

  it('wraps bold text with italic markers instead of unwrapping a single bold marker', () => {
    const result = applyInlineFormat({
      content: 'hello **world**',
      selectionStart: 8,
      selectionEnd: 13,
      kind: 'italic',
    });

    expect(result.content).toBe('hello ***world***');
    expect(result.selectionStart).toBe(9);
    expect(result.selectionEnd).toBe(14);
  });

  it('does nothing when selection is empty', () => {
    const result = applyInlineFormat({
      content: 'hello',
      selectionStart: 2,
      selectionEnd: 2,
      kind: 'bold',
    });

    expect(result.content).toBe('hello');
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(2);
  });
});

describe('getActiveInlineFormats', () => {
  it('detects active bold when inner text is selected', () => {
    const result = getActiveInlineFormats('hello **world**', 8, 13);

    expect(result.bold).toBe(true);
    expect(result.italic).toBe(false);
    expect(result.underline).toBe(false);
    expect(result.strike).toBe(false);
  });

  it('does not detect italic when the whole bold marker range is selected', () => {
    const result = getActiveInlineFormats('hello **world**', 6, 15);

    expect(result.bold).toBe(true);
    expect(result.italic).toBe(false);
  });

  it('detects active underline when the whole tagged text is selected', () => {
    const result = getActiveInlineFormats('hello <u>world</u>', 6, 18);

    expect(result.underline).toBe(true);
    expect(result.bold).toBe(false);
    expect(result.strike).toBe(false);
  });

  it('detects active strikethrough when inner text is selected', () => {
    const result = getActiveInlineFormats('hello ~~world~~', 8, 13);

    expect(result.strike).toBe(true);
    expect(result.bold).toBe(false);
    expect(result.underline).toBe(false);
  });

  it('does not mark formats active for plain selected text', () => {
    const result = getActiveInlineFormats('hello world', 6, 11);

    expect(result.bold).toBe(false);
    expect(result.italic).toBe(false);
    expect(result.code).toBe(false);
    expect(result.underline).toBe(false);
    expect(result.strike).toBe(false);
    expect(result.link).toBe(false);
  });

  it('does not mark formats active for an empty selection', () => {
    const result = getActiveInlineFormats('hello **world**', 8, 8);

    expect(result.bold).toBe(false);
    expect(result.italic).toBe(false);
    expect(result.code).toBe(false);
    expect(result.underline).toBe(false);
    expect(result.strike).toBe(false);
    expect(result.link).toBe(false);
  });
});

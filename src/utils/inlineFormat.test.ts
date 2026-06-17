import { describe, expect, it } from 'vitest';
import { applyInlineFormat } from './inlineFormat';

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

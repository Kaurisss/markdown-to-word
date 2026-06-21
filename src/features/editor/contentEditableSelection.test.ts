// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { computeEditableSelectionOffsets, setEditableSelection } from './contentEditableSelection';

function createEditableDiv(text: string): HTMLDivElement {
  const div = document.createElement('div');
  div.contentEditable = 'true';
  div.textContent = text;
  document.body.appendChild(div);
  return div;
}

function cleanup(el: HTMLElement) {
  el.remove();
}

describe('computeEditableSelectionOffsets', () => {
  it('returns null when range is outside editable root', () => {
    const div = createEditableDiv('Hello World');
    const otherDiv = document.createElement('div');
    otherDiv.textContent = 'Other';
    document.body.appendChild(otherDiv);

    const range = document.createRange();
    range.setStart(otherDiv.firstChild!, 0);

    expect(computeEditableSelectionOffsets(div, range)).toBeNull();

    cleanup(div);
    cleanup(otherDiv);
  });

  it('computes correct offsets for selection at start', () => {
    const div = createEditableDiv('Hello World');
    const textNode = div.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);

    const result = computeEditableSelectionOffsets(div, range);
    expect(result).toEqual({
      selectionStart: 0,
      selectionEnd: 5,
      selectionText: 'Hello',
    });

    cleanup(div);
  });

  it('computes correct offsets for selection in middle', () => {
    const div = createEditableDiv('Hello World');
    const textNode = div.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 6);
    range.setEnd(textNode, 11);

    const result = computeEditableSelectionOffsets(div, range);
    expect(result).toEqual({
      selectionStart: 6,
      selectionEnd: 11,
      selectionText: 'World',
    });

    cleanup(div);
  });

  it('handles empty selection (cursor)', () => {
    const div = createEditableDiv('Hello');
    const textNode = div.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 3);
    range.setEnd(textNode, 3);

    const result = computeEditableSelectionOffsets(div, range);
    expect(result).toEqual({
      selectionStart: 3,
      selectionEnd: 3,
      selectionText: '',
    });

    cleanup(div);
  });

  it('handles full selection', () => {
    const div = createEditableDiv('Hello');
    const textNode = div.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);

    const result = computeEditableSelectionOffsets(div, range);
    expect(result).toEqual({
      selectionStart: 0,
      selectionEnd: 5,
      selectionText: 'Hello',
    });

    cleanup(div);
  });
});

describe('setEditableSelection', () => {
  it('sets selection at specified offsets', () => {
    const div = createEditableDiv('Hello World');
    const selection = window.getSelection()!;

    setEditableSelection(div, selection, 0, 5);

    expect(selection.rangeCount).toBe(1);
    const range = selection.getRangeAt(0);
    expect(range.toString()).toBe('Hello');

    cleanup(div);
  });

  it('clamps offsets to text length', () => {
    const div = createEditableDiv('Hi');
    const selection = window.getSelection()!;

    setEditableSelection(div, selection, 0, 100);

    expect(selection.rangeCount).toBe(1);
    const range = selection.getRangeAt(0);
    expect(range.toString()).toBe('Hi');

    cleanup(div);
  });

  it('handles empty contenteditable', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);
    const selection = window.getSelection()!;

    setEditableSelection(div, selection, 0, 0);

    expect(selection.rangeCount).toBe(1);

    cleanup(div);
  });

  it('handles cursor (collapsed) selection', () => {
    const div = createEditableDiv('Hello');
    const selection = window.getSelection()!;

    setEditableSelection(div, selection, 3, 3);

    expect(selection.rangeCount).toBe(1);
    const range = selection.getRangeAt(0);
    expect(range.collapsed).toBe(true);
    expect(range.toString()).toBe('');

    cleanup(div);
  });
});

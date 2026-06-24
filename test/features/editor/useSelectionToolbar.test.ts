// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSelectionToolbarAnchor } from '@/features/editor/useSelectionToolbar';

vi.mock('textarea-caret', () => ({
  default: vi.fn((editor: HTMLTextAreaElement, offset: number) => {
    const lines = editor.value.split('\n');
    let remaining = offset;
    let lineIndex = 0;

    while (lineIndex < lines.length && remaining > lines[lineIndex].length) {
      remaining -= lines[lineIndex].length + 1;
      lineIndex += 1;
    }

    return {
      left: remaining * 10,
      top: lineIndex * 20,
    };
  }),
}));

function createEditor(content: string, rect = { left: 100, top: 50 }): HTMLTextAreaElement {
  const editor = document.createElement('textarea');
  editor.value = content;
  editor.scrollLeft = 0;
  editor.scrollTop = 0;
  editor.getBoundingClientRect = () => ({
    x: rect.left,
    y: rect.top,
    left: rect.left,
    top: rect.top,
    right: rect.left + 200,
    bottom: rect.top + 100,
    width: 200,
    height: 100,
    toJSON: () => ({}),
  });
  document.body.appendChild(editor);
  return editor;
}

function cleanup(editor: HTMLTextAreaElement) {
  editor.remove();
}

describe('getSelectionToolbarAnchor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the midpoint of start and end carets for a single line selection', () => {
    const editor = createEditor('Hello world');

    const anchor = getSelectionToolbarAnchor(editor, 'Hello world', 1, 6);

    expect(anchor).toEqual({
      x: 135,
      y: 50,
    });

    cleanup(editor);
  });

  it('centers multiline selections across the full visible range', () => {
    const editor = createEditor('Hello\nworld');

    const anchor = getSelectionToolbarAnchor(editor, 'Hello\nworld', 1, 8);

    expect(anchor).toEqual({
      x: 125,
      y: 50,
    });

    cleanup(editor);
  });

  it('subtracts textarea scroll offsets from the fixed viewport anchor', () => {
    const editor = createEditor('Hello\nworld', { left: 80, top: 30 });
    editor.scrollLeft = 12;
    editor.scrollTop = 18;

    const anchor = getSelectionToolbarAnchor(editor, 'Hello\nworld', 1, 8);

    expect(anchor).toEqual({
      x: 93,
      y: 12,
    });

    cleanup(editor);
  });
});
export type InlineFormatKind = 'bold' | 'italic' | 'code' | 'underline' | 'strike' | 'link';

export interface ApplyInlineFormatInput {
  content: string;
  selectionStart: number;
  selectionEnd: number;
  kind: InlineFormatKind;
  linkUrl?: string;
}

export interface ApplyInlineFormatResult {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

export type ActiveInlineFormats = Record<InlineFormatKind, boolean>;

const FORMAT_WRAPPERS: Record<Exclude<InlineFormatKind, 'link'>, { before: string; after: string }> = {
  bold: { before: '**', after: '**' },
  italic: { before: '*', after: '*' },
  code: { before: '`', after: '`' },
  underline: { before: '<u>', after: '</u>' },
  strike: { before: '~~', after: '~~' },
};

function isEscapedMarkerAt(content: string, index: number, marker: string): boolean {
  return content.slice(index, index + marker.length) === marker;
}

function isSingleAsteriskAt(content: string, index: number): boolean {
  if (!isEscapedMarkerAt(content, index, '*')) return false;

  return content[index - 1] !== '*' && content[index + 1] !== '*';
}

function hasExactWrapper(
  content: string,
  start: number,
  end: number,
  wrapper: { before: string; after: string },
): boolean {
  if (wrapper.before !== '*' || wrapper.after !== '*') {
    return (
      content.slice(start, start + wrapper.before.length) === wrapper.before &&
      content.slice(end - wrapper.after.length, end) === wrapper.after
    );
  }

  return isSingleAsteriskAt(content, start) && isSingleAsteriskAt(content, end - wrapper.after.length);
}

function hasExactWrapperAroundSelection(
  content: string,
  start: number,
  end: number,
  wrapper: { before: string; after: string },
): boolean {
  const beforeStart = start - wrapper.before.length;
  const afterEnd = end + wrapper.after.length;

  if (beforeStart < 0 || afterEnd > content.length) return false;

  if (wrapper.before !== '*' || wrapper.after !== '*') {
    return (
      content.slice(beforeStart, start) === wrapper.before &&
      content.slice(end, afterEnd) === wrapper.after
    );
  }

  return isSingleAsteriskAt(content, beforeStart) && isSingleAsteriskAt(content, end);
}

function unwrapInlineFormat(
  content: string,
  start: number,
  end: number,
  wrapper: { before: string; after: string },
): ApplyInlineFormatResult | null {
  const selected = content.slice(start, end);

  if (hasExactWrapper(content, start, end, wrapper)) {
    const unwrapped = selected.slice(wrapper.before.length, selected.length - wrapper.after.length);
    const nextContent = `${content.slice(0, start)}${unwrapped}${content.slice(end)}`;

    return {
      content: nextContent,
      selectionStart: start,
      selectionEnd: start + unwrapped.length,
    };
  }

  const beforeStart = start - wrapper.before.length;
  if (!hasExactWrapperAroundSelection(content, start, end, wrapper)) return null;

  const nextContent = `${content.slice(0, beforeStart)}${selected}${content.slice(end + wrapper.after.length)}`;

  return {
    content: nextContent,
    selectionStart: beforeStart,
    selectionEnd: beforeStart + selected.length,
  };
}

function isInlineFormatWrapped(
  content: string,
  start: number,
  end: number,
  wrapper: { before: string; after: string },
): boolean {
  const selected = content.slice(start, end);

  if (!selected) return false;

  if (hasExactWrapper(content, start, end, wrapper)) {
    return true;
  }

  return hasExactWrapperAroundSelection(content, start, end, wrapper);
}

export function getActiveInlineFormats(
  content: string,
  selectionStart: number,
  selectionEnd: number,
): ActiveInlineFormats {
  const start = Math.max(0, Math.min(selectionStart, content.length));
  const end = Math.max(start, Math.min(selectionEnd, content.length));
  const activeFormats: ActiveInlineFormats = {
    bold: false,
    italic: false,
    code: false,
    underline: false,
    strike: false,
    link: false,
  };

  if (end <= start) return activeFormats;

  for (const [kind, wrapper] of Object.entries(FORMAT_WRAPPERS)) {
    activeFormats[kind as Exclude<InlineFormatKind, 'link'>] = isInlineFormatWrapped(
      content,
      start,
      end,
      wrapper,
    );
  }

  return activeFormats;
}

export function applyInlineFormat(input: ApplyInlineFormatInput): ApplyInlineFormatResult {
  const start = Math.max(0, Math.min(input.selectionStart, input.content.length));
  const end = Math.max(start, Math.min(input.selectionEnd, input.content.length));
  const selected = input.content.slice(start, end);

  if (!selected) {
    return {
      content: input.content,
      selectionStart: start,
      selectionEnd: end,
    };
  }

  const wrapper = input.kind === 'link'
    ? { before: '[', after: `](${input.linkUrl ?? ''})` }
    : FORMAT_WRAPPERS[input.kind];

  if (input.kind !== 'link') {
    const unwrapped = unwrapInlineFormat(input.content, start, end, wrapper);
    if (unwrapped) return unwrapped;
  }

  const nextSelected = `${wrapper.before}${selected}${wrapper.after}`;
  const nextContent = `${input.content.slice(0, start)}${nextSelected}${input.content.slice(end)}`;

  return {
    content: nextContent,
    selectionStart: start + wrapper.before.length,
    selectionEnd: start + wrapper.before.length + selected.length,
  };
}

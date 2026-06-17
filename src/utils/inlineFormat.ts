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

const FORMAT_WRAPPERS: Record<Exclude<InlineFormatKind, 'link'>, { before: string; after: string }> = {
  bold: { before: '**', after: '**' },
  italic: { before: '*', after: '*' },
  code: { before: '`', after: '`' },
  underline: { before: '<u>', after: '</u>' },
  strike: { before: '~~', after: '~~' },
};

function unwrapInlineFormat(
  content: string,
  start: number,
  end: number,
  wrapper: { before: string; after: string },
): ApplyInlineFormatResult | null {
  const selected = content.slice(start, end);

  if (selected.startsWith(wrapper.before) && selected.endsWith(wrapper.after)) {
    const unwrapped = selected.slice(wrapper.before.length, selected.length - wrapper.after.length);
    const nextContent = `${content.slice(0, start)}${unwrapped}${content.slice(end)}`;

    return {
      content: nextContent,
      selectionStart: start,
      selectionEnd: start + unwrapped.length,
    };
  }

  const beforeStart = start - wrapper.before.length;
  const afterEnd = end + wrapper.after.length;
  const hasWrapperAroundSelection =
    beforeStart >= 0 &&
    afterEnd <= content.length &&
    content.slice(beforeStart, start) === wrapper.before &&
    content.slice(end, afterEnd) === wrapper.after;

  if (!hasWrapperAroundSelection) return null;

  const nextContent = `${content.slice(0, beforeStart)}${selected}${content.slice(end + wrapper.after.length)}`;

  return {
    content: nextContent,
    selectionStart: beforeStart,
    selectionEnd: beforeStart + selected.length,
  };
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

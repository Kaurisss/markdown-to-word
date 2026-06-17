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

  const nextSelected = `${wrapper.before}${selected}${wrapper.after}`;
  const nextContent = `${input.content.slice(0, start)}${nextSelected}${input.content.slice(end)}`;

  return {
    content: nextContent,
    selectionStart: start + wrapper.before.length,
    selectionEnd: start + wrapper.before.length + selected.length,
  };
}

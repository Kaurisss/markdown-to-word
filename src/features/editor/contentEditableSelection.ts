/**
 * Pure DOM utilities for contenteditable selection positioning,
 * restoration, and offset computation.
 *
 * No React dependencies — safe to call from any context.
 */

/**
 * Walk text nodes inside *root* and return the node + local offset
 * that corresponds to the given global character *offset*.
 */
function resolveNode(root: HTMLElement, offset: number): { node: Text; offset: number } | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  let current = 0;
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (current + length >= offset) {
      return { node, offset: offset - current };
    }
    current += length;
    node = walker.nextNode() as Text | null;
  }
  return null;
}

/**
 * Set the browser selection inside a contenteditable element by
 * character offsets (clamped to the element's text length).
 */
export function setEditableSelection(
  editableRoot: HTMLElement,
  selection: Selection,
  start: number,
  end: number,
): void {
  const totalLength = editableRoot.textContent?.length ?? 0;
  const clamp = (value: number) => Math.max(0, Math.min(value, totalLength));
  const startOffset = clamp(start);
  const endOffset = clamp(end);

  const startLoc = resolveNode(editableRoot, startOffset);
  const endLoc = resolveNode(editableRoot, endOffset) ?? startLoc;
  const range = document.createRange();

  if (!startLoc) {
    range.setStart(editableRoot, 0);
    range.collapse(true);
  } else {
    range.setStart(startLoc.node, startLoc.offset);
    if (endLoc) {
      range.setEnd(endLoc.node, endLoc.offset);
    } else {
      range.collapse(true);
    }
  }

  selection.removeAllRanges();
  selection.addRange(range);
  editableRoot.focus();
}

/**
 * Compute text offsets for the current selection within a
 * contenteditable element.  Returns `null` when no valid range is
 * available.
 */
export function computeEditableSelectionOffsets(
  editableRoot: HTMLElement,
  range: Range,
): { selectionStart: number; selectionEnd: number; selectionText: string } | null {
  if (!editableRoot.contains(range.startContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(editableRoot);
  preRange.setEnd(range.startContainer, range.startOffset);

  const selectionStart = preRange.toString().length;
  const selectionText = range.toString();
  const selectionEnd = selectionStart + selectionText.length;

  return { selectionStart, selectionEnd, selectionText };
}

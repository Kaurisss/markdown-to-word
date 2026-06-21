import React from 'react';
import { ContextMenuActionItem } from '../../components/ui/context-menu';
import { Copy2Line, ClipboardLine, ScissorsLine, Back2Line, Forward2Line, CheckboxLine } from '@mingcute/react';

export interface ContextMenuOptions {
  hasSelection: boolean;
  isEditable: boolean;
  canUndo: boolean;
  canRedo: boolean;
  /** The element that should receive focus for "select all". */
  selectAllTarget: HTMLInputElement | HTMLTextAreaElement | HTMLElement | null;
  /** Total text length (used for "select all" in contenteditable). */
  contentLength: number;
  selectionText: string;
  /**
   * Replace the current selection.  The caller decides whether this
   * targets a text input or a contenteditable and wires the closure
   * accordingly — only ONE of the two paths is active at a time.
   */
  replaceSelection: (value: string) => void;
  /** Set contenteditable selection by character offsets. */
  setEditableSelection: (start: number, end: number) => void;
  undo: () => void;
  redo: () => void;
  showToast: (message: string, type?: string) => void;
}

/**
 * Build the standard context-menu item list (undo, redo, copy, cut,
 * paste, select all).
 */
export function buildContextMenuItems(opts: ContextMenuOptions): ContextMenuActionItem[] {
  const {
    hasSelection, isEditable, canUndo, canRedo,
    selectAllTarget, contentLength, selectionText,
    replaceSelection, setEditableSelection,
    undo, redo, showToast,
  } = opts;

  return [
    {
      label: '撤回',
      icon: <Back2Line className="w-4 h-4" />,
      shortcut: 'Ctrl+Z',
      disabled: !canUndo,
      action: undo,
    },
    {
      label: '重做',
      icon: <Forward2Line className="w-4 h-4" />,
      shortcut: 'Ctrl+Y',
      disabled: !canRedo,
      action: redo,
    },
    { separator: true },
    {
      label: '复制',
      icon: <Copy2Line className="w-4 h-4" />,
      shortcut: 'Ctrl+C',
      disabled: !hasSelection,
      action: async () => {
        if (selectionText) {
          await navigator.clipboard.writeText(selectionText);
        }
      },
    },
    {
      label: '剪切',
      icon: <ScissorsLine className="w-4 h-4" />,
      shortcut: 'Ctrl+X',
      disabled: !hasSelection || !isEditable,
      action: async () => {
        if (!selectionText) return;
        await navigator.clipboard.writeText(selectionText);
        replaceSelection('');
      },
    },
    {
      label: '粘贴',
      icon: <ClipboardLine className="w-4 h-4" />,
      shortcut: 'Ctrl+V',
      disabled: !isEditable,
      action: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (!text) return;
          replaceSelection(text);
        } catch (err) {
          console.error('Failed to read clipboard:', err);
          showToast('无法读取剪贴板', 'error');
        }
      },
    },
    { separator: true },
    {
      label: '全选',
      icon: <CheckboxLine className="w-4 h-4" />,
      shortcut: 'Ctrl+A',
      action: () => {
        requestAnimationFrame(() => {
          if (!selectAllTarget) return;
          if (
            selectAllTarget instanceof HTMLInputElement ||
            selectAllTarget instanceof HTMLTextAreaElement
          ) {
            selectAllTarget.focus();
            selectAllTarget.select();
          } else {
            setEditableSelection(0, contentLength);
          }
        });
      },
    },
  ];
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ContextMenuActionItem } from '../../components/ui/context-menu';
import { Copy2Line, ClipboardLine, ScissorsLine, Back2Line, Forward2Line, CheckboxLine } from '@mingcute/react';
import { ToastType } from '../../components/shell/Toast';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuActionItem[];
}

interface UseContextMenuOptions {
  content: string;
  updateContent: (next: string) => void;
  undo: () => void;
  redo: () => void;
  undoStackRef: React.RefObject<string[]>;
  redoStackRef: React.RefObject<string[]>;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
  showToast: (message: string, type?: ToastType) => void;
  isConfigWindow: boolean;
}

export function useContextMenu({
  content,
  updateContent,
  undo,
  redo,
  undoStackRef,
  redoStackRef,
  editorRef,
  showToast,
  isConfigWindow,
}: UseContextMenuOptions) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: []
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const lastSelectionRef = useRef<Range | null>(null);
  const lastSelectionRootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isConfigWindow) {
      return;
    }
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const anchorNode = selection.anchorNode;
      const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
      const editableRoot = anchorElement?.closest('[contenteditable="true"]') as HTMLElement | null;
      if (!editableRoot) return;
      lastSelectionRef.current = selection.getRangeAt(0).cloneRange();
      lastSelectionRootRef.current = editableRoot;
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isConfigWindow]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    const target = e.target as HTMLElement;
    const textField = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target : null;
    const editableRoot = target.closest('[contenteditable="true"]') as HTMLElement | null;
    const isEditable = editableRoot !== null || textField !== null;
    if (!isEditable) return;

    const fieldSelectionStart = textField?.selectionStart ?? 0;
    const fieldSelectionEnd = textField?.selectionEnd ?? 0;
    const fieldSelectionText = textField?.value.slice(fieldSelectionStart, fieldSelectionEnd) ?? '';

    const getEditableRange = () => {
      if (textField || !editableRoot) return null;
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editableRoot.contains(range.startContainer)) {
          return range;
        }
      }
      if (lastSelectionRef.current && lastSelectionRootRef.current === editableRoot) {
        return lastSelectionRef.current;
      }
      return null;
    };

    const rangeToRestore = getEditableRange();
    let effectiveRange = rangeToRestore;
    let selectionStart = fieldSelectionStart;
    let selectionEnd = fieldSelectionEnd;
    let selectionText = fieldSelectionText;

    if (!textField && editableRoot && effectiveRange) {
      const preRange = effectiveRange.cloneRange();
      preRange.selectNodeContents(editableRoot);
      preRange.setEnd(effectiveRange.startContainer, effectiveRange.startOffset);
      selectionStart = preRange.toString().length;
      selectionText = effectiveRange.toString();
      selectionEnd = selectionStart + selectionText.length;
    }

    if (!textField && !selectionText && editableRoot && lastSelectionRef.current && lastSelectionRootRef.current === editableRoot) {
      effectiveRange = lastSelectionRef.current;
      const preRange = effectiveRange.cloneRange();
      preRange.selectNodeContents(editableRoot);
      preRange.setEnd(effectiveRange.startContainer, effectiveRange.startOffset);
      selectionStart = preRange.toString().length;
      selectionText = effectiveRange.toString();
      selectionEnd = selectionStart + selectionText.length;
    }

    const hasSelection = selectionEnd > selectionStart;

    const setEditableSelection = (start: number, end: number) => {
      if (textField) {
        textField.focus();
        textField.setSelectionRange(start, end);
        return;
      }
      if (!editableRoot || !selection) return;

      const totalLength = editableRoot.textContent?.length ?? 0;
      const clamp = (value: number) => Math.max(0, Math.min(value, totalLength));
      const startOffset = clamp(start);
      const endOffset = clamp(end);

      const resolveNode = (offset: number) => {
        const walker = document.createTreeWalker(editableRoot, NodeFilter.SHOW_TEXT);
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
      };

      const startLoc = resolveNode(startOffset);
      const endLoc = resolveNode(endOffset) ?? startLoc;
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
    };

    const replaceTextFieldRange = (value: string) => {
      if (!textField) return;
      textField.focus();
      textField.setRangeText(value, selectionStart, selectionEnd, 'end');
      textField.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const applyContentReplacement = (insertText: string) => {
      const next = `${content.slice(0, selectionStart)}${insertText}${content.slice(selectionEnd)}`;
      updateContent(next);
      const nextOffset = selectionStart + insertText.length;
      requestAnimationFrame(() => {
        setEditableSelection(nextOffset, nextOffset);
      });
    };

    const isEditorField = textField === editorRef.current;
    const canUndoMenu = isEditorField && undoStackRef.current.length > 0;
    const canRedoMenu = isEditorField && redoStackRef.current.length > 0;

    const menuItems: ContextMenuActionItem[] = [
      {
        label: '撤回',
        icon: <Back2Line className="w-4 h-4" />,
        shortcut: 'Ctrl+Z',
        disabled: !canUndoMenu,
        action: () => {
          undo();
        }
      },
      {
        label: '重做',
        icon: <Forward2Line className="w-4 h-4" />,
        shortcut: 'Ctrl+Y',
        disabled: !canRedoMenu,
        action: () => {
          redo();
        }
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
        }
      },
      {
        label: '剪切',
        icon: <ScissorsLine className="w-4 h-4" />,
        shortcut: 'Ctrl+X',
        disabled: !hasSelection || !isEditable,
        action: async () => {
          if (!selectionText) return;
          await navigator.clipboard.writeText(selectionText);
          if (textField) {
            replaceTextFieldRange('');
          } else {
            applyContentReplacement('');
          }
        }
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
            if (textField) {
              replaceTextFieldRange(text);
            } else {
              applyContentReplacement(text);
            }
          } catch (err) {
            console.error('Failed to read clipboard:', err);
            showToast('无法读取剪贴板', 'error');
          }
        }
      },
      { separator: true },
      {
        label: '全选',
        icon: <CheckboxLine className="w-4 h-4" />,
        shortcut: 'Ctrl+A',
        action: () => {
          // Delay to run after Radix menu teardown completes
          requestAnimationFrame(() => {
            if (textField) {
              textField.focus();
              textField.select();
              return;
            }
            if (editableRoot) {
              setEditableSelection(0, content.length);
            }
          });
        }
      }
    ];

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items: menuItems
    });

    if (!textField && editableRoot && selection && effectiveRange) {
      requestAnimationFrame(() => {
        selection.removeAllRanges();
        selection.addRange(effectiveRange);
        editableRoot.focus();
      });
    } else if (textField) {
      requestAnimationFrame(() => {
        textField.focus();
        textField.setSelectionRange(selectionStart, selectionEnd);
      });
    }
  }, [content, showToast, updateContent, undo, redo, editorRef, undoStackRef, redoStackRef]);

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}

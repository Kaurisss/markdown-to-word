import React, { useState, useCallback } from 'react';
import { Copy, Scissors, Clipboard, CheckSquare } from 'lucide-react';
import { ContextMenuItem } from '../components/ui/ContextMenu';

interface InputContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
}

export const useInputContextMenu = () => {
    const [contextMenu, setContextMenu] = useState<InputContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        items: []
    });

    const handleInputContextMenu = useCallback((e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const selectionStart = target.selectionStart ?? 0;
        const selectionEnd = target.selectionEnd ?? 0;
        const selectedText = target.value.slice(selectionStart, selectionEnd);
        const hasSelection = selectionEnd > selectionStart;

        const replaceRange = (value: string) => {
            target.focus();
            target.setRangeText(value, selectionStart, selectionEnd, 'end');
            target.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const menuItems: ContextMenuItem[] = [
            {
                label: '复制',
                icon: <Copy className="w-4 h-4" />,
                shortcut: 'Ctrl+C',
                disabled: !hasSelection,
                action: async () => {
                    if (selectedText) {
                        await navigator.clipboard.writeText(selectedText);
                    }
                }
            },
            {
                label: '剪切',
                icon: <Scissors className="w-4 h-4" />,
                shortcut: 'Ctrl+X',
                disabled: !hasSelection,
                action: async () => {
                    if (!selectedText) return;
                    await navigator.clipboard.writeText(selectedText);
                    replaceRange('');
                }
            },
            {
                label: '粘贴',
                icon: <Clipboard className="w-4 h-4" />,
                shortcut: 'Ctrl+V',
                action: async () => {
                    try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                            replaceRange(text);
                        }
                    } catch (err) {
                        console.error('Failed to read clipboard:', err);
                    }
                }
            },
            { separator: true },
            {
                label: '全选',
                icon: <CheckSquare className="w-4 h-4" />,
                shortcut: 'Ctrl+A',
                action: () => {
                    target.focus();
                    target.select();
                }
            }
        ];

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            items: menuItems
        });

        // Restore selection after menu shows
        requestAnimationFrame(() => {
            target.focus();
            target.setSelectionRange(selectionStart, selectionEnd);
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    return {
        contextMenu,
        handleInputContextMenu,
        closeContextMenu
    };
};

﻿import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface ContextMenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  checked?: boolean;
  icon?: React.ReactNode;
  danger?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  items,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  useEffect(() => {
    if (visible) {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      const timer = requestAnimationFrame(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', onClose, true);
        window.addEventListener('resize', onClose);
      });

      return () => {
        cancelAnimationFrame(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', onClose, true);
        window.removeEventListener('resize', onClose);
      };
    }
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;
    setPosition({ left: x, top: y });
  }, [visible, x, y]);

  useLayoutEffect(() => {
    if (!visible || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const margin = 8;
    let left = x;
    let top = y;

    if (typeof window !== 'undefined') {
      const maxLeft = window.innerWidth - rect.width - margin;
      const maxTop = window.innerHeight - rect.height - margin;
      left = Math.min(Math.max(left, margin), Math.max(margin, maxLeft));
      top = Math.min(Math.max(top, margin), Math.max(margin, maxTop));
    }

    setPosition((prev) => (prev.left === left && prev.top === top ? prev : { left, top }));
  }, [visible, x, y, items.length]);

  const style = useMemo(() => (visible ? { left: position.left, top: position.top } : {}), [visible, position]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[160px] bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-xl py-1.5 animate-menu-in"
      style={style}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div key={index} className="my-1 border-t border-gray-100 dark:border-gray-700" />
          );
        }

        return (
          <button
            key={index}
            className={`
              w-full px-3 py-1.5 text-xs flex items-center justify-between group relative
              ${item.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400'
              }
              transition-colors
            `}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span className={item.checked ? 'font-medium' : ''}>{item.label}</span>
            </div>

            <div className="flex items-center gap-3">
              {item.shortcut && (
                <span className="text-[10px] text-gray-400 font-sans">{item.shortcut}</span>
              )}
              {item.checked && <Check className="w-3.5 h-3.5" />}
              {item.submenu && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

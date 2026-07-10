import React, { useCallback } from 'react';
import { CloseLine } from '@mingcute/react';

interface WindowTitleBarProps {
  onClose?: () => void;
}

export const WindowTitleBar: React.FC<WindowTitleBarProps> = ({ onClose }) => {
  const handleClose = useCallback(async () => {
    if (onClose) {
      onClose();
      return;
    }
    try {
      const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const currentWindow = getCurrentWebviewWindow();
      await currentWindow.close();
    } catch {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        await win.close();
      } catch {
        // Ignore when running outside Tauri.
      }
    }
  }, [onClose]);

  return (
    <div className="absolute top-0 left-0 right-0 h-12 flex items-start pointer-events-none z-40">
      <div className="absolute inset-0 pointer-events-auto" data-tauri-drag-region />
      <div className="flex h-12 items-stretch shrink-0 pointer-events-auto ml-auto relative z-10">
        <button
          type="button"
          onClick={handleClose}
          className="w-[46px] h-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
          aria-label="关闭"
        >
          <CloseLine size={16} />
        </button>
      </div>
    </div>
  );
};

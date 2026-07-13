import React, { useCallback, useEffect, useState } from 'react';
import { CloseLine, SquareLine, RestoreLine, MinimizeLine } from '@mingcute/react';

interface WindowControlsProps {
  enabled?: boolean;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ enabled = true }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let unlisten: (() => void) | undefined;

    const setupWindowListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();

        setIsMaximized(await win.isMaximized());
        unlisten = await win.listen('tauri://resize', async () => {
          setIsMaximized(await win.isMaximized());
        });
      } catch {
        // Ignore when running outside Tauri.
      }
    };

    setupWindowListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [enabled]);

  const runWindowAction = useCallback(async (action: 'minimize' | 'toggleMaximize' | 'close') => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      if (action === 'minimize') await win.minimize();
      if (action === 'toggleMaximize') await win.toggleMaximize();
      if (action === 'close') await win.close();
    } catch (e) {
      console.error('Window action failed:', e);
    }
  }, []);

  return (
    <div className="flex h-full items-stretch bg-inherit shrink-0" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => void runWindowAction('minimize')}
        className="w-12 h-full grid place-items-center bg-transparent text-ui-text-muted hover:bg-ui-control-hover active:bg-ui-control-active transition-colors"
        aria-label="最小化"
      >
        <MinimizeLine size={16} />
      </button>
      <button
        type="button"
        onClick={() => void runWindowAction('toggleMaximize')}
        className="w-12 h-full grid place-items-center bg-transparent text-ui-text-muted hover:bg-ui-control-hover active:bg-ui-control-active transition-colors"
        aria-label={isMaximized ? '还原' : '最大化'}
      >
        {isMaximized ? <RestoreLine size={16} /> : <SquareLine size={16} />}
      </button>
      <button
        type="button"
        onClick={() => void runWindowAction('close')}
        className="w-12 h-full grid place-items-center bg-transparent text-ui-text-muted hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
        aria-label="关闭"
      >
        <CloseLine size={16} />
      </button>
    </div>
  );
};

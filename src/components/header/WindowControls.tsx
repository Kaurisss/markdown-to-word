import React, { useCallback, useEffect, useState } from 'react';

export const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupWindowListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();

        setIsMaximized(await win.isMaximized());
        unlisten = await win.listen('tauri://resize', async () => {
          setIsMaximized(await win.isMaximized());
        });
      } catch (e) {
        console.error('Failed to setup window listener:', e);
      }
    };

    setupWindowListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

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
        className="w-12 h-10 grid place-items-center border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border transition-colors"
        aria-label="最小化"
      >
        <span
          aria-hidden="true"
          className="select-none leading-none text-[10px]"
          style={{ fontFamily: "'Segoe MDL2 Assets'" }}
        >
          &#xE921;
        </span>
      </button>
      <button
        type="button"
        onClick={() => void runWindowAction('toggleMaximize')}
        className="w-12 h-10 grid place-items-center border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border transition-colors"
        aria-label={isMaximized ? '还原' : '最大化'}
      >
        <span
          aria-hidden="true"
          className="select-none leading-none text-[10px]"
          style={{ fontFamily: "'Segoe MDL2 Assets'" }}
        >
          {isMaximized ? '\uE923' : '\uE922'}
        </span>
      </button>
      <button
        type="button"
        onClick={() => void runWindowAction('close')}
        className="w-12 h-10 grid place-items-center border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
        aria-label="关闭"
      >
        <span
          aria-hidden="true"
          className="select-none leading-none text-[10px]"
          style={{ fontFamily: "'Segoe MDL2 Assets'" }}
        >
          &#xE8BB;
        </span>
      </button>
    </div>
  );
};

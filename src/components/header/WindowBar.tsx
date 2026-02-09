import React, { useCallback, useEffect, useState } from 'react';
import logoUrl from '../../logo.png';

export type TabType = 'file' | 'edit' | 'view' | 'home' | 'layout' | 'ai';

interface WindowBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onImport: (content: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const WindowBar: React.FC<WindowBarProps> = ({
  activeTab,
  setActiveTab,
  onImport,
  fileInputRef
}) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') onImport(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-10 bg-inherit border-b border-gray-100 dark:border-dark-border flex items-stretch transition-colors duration-200">
      <div
        className="flex-1 flex items-center text-xs text-gray-600 dark:text-gray-300 select-none min-w-0"
        data-tauri-drag-region
        onDoubleClick={() => void runWindowAction('toggleMaximize')}
      >
        <div className="flex items-center justify-center w-10 h-full" data-tauri-drag-region>
          <img src={logoUrl} alt="Logo" className="w-5 h-5 pointer-events-none rounded-sm" />
        </div>

        <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

          {(['file', 'edit', 'view', 'home', 'layout', 'ai'] as const).map(tab => {
            const isActive = activeTab === tab;
            const label = ({ file: '文件', edit: '编辑', view: '视图', home: '开始', layout: '布局', ai: '智能' } as const)[tab];

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium transition-colors relative ${isActive
                  ? 'text-brand-700 dark:text-brand-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                  }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative inline-block">
                  {label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-4 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400"
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" data-tauri-drag-region />
      </div>

      <div className="flex items-stretch bg-white" onMouseDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => void runWindowAction('minimize')}
          className="w-12 grid place-items-center bg-white text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
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
          className="w-12 grid place-items-center bg-white text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
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
          className="w-12 grid place-items-center bg-white text-gray-600 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
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
    </div>
  );
};

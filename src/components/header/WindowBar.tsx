import React, { useCallback, useRef, useState, useEffect } from 'react';
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
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null);

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
    <div className="h-10 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border flex items-stretch transition-colors duration-200">
      {/* 左侧可拖动区域：Logo + 菜单项 */}
      <div
        className="flex-1 flex items-center text-xs text-gray-600 dark:text-gray-300 select-none min-w-0"
        data-tauri-drag-region
        onDoubleClick={() => void runWindowAction('toggleMaximize')}
      >
        {/* Logo 图标 - 可拖动 */}
        <div className="flex items-center justify-center w-10 h-full" data-tauri-drag-region>
          <img src={logoUrl} alt="Logo" className="w-5 h-5 pointer-events-none rounded-sm" />
        </div>

        {/* 菜单项 - 不可拖动 */}
        <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

          {/* 功能栏切换按钮 */}
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

        {/* 点击外部关闭菜单 - 保留用于颜色选择器等 */}
        {openMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)}></div>
        )}

        {/* 可拖动的空白区域 */}
        <div className="flex-1" data-tauri-drag-region></div>
      </div>

      {/* 右侧窗口控制按钮 */}
      <div className="flex items-stretch" onMouseDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => void runWindowAction('minimize')}
          className="w-12 grid place-items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
          aria-label="最小化"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => void runWindowAction('toggleMaximize')}
          className="w-12 grid place-items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
          aria-label={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 8V4H20V16H16" />
              <rect x="4" y="8" width="12" height="12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="14" height="14" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => void runWindowAction('close')}
          className="w-12 grid place-items-center text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
          aria-label="关闭"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

import React, { useCallback } from 'react';
import logoUrl from '../../logo.png';

export type TabType = 'file' | 'edit' | 'home' | 'layout' | 'ai';

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
  const runWindowAction = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.toggleMaximize();
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
    <div
      className="flex-1 min-w-0 bg-inherit flex items-center text-xs text-gray-600 dark:text-gray-300 select-none transition-colors duration-200"
      data-tauri-drag-region
      onDoubleClick={() => void runWindowAction()}
    >
      <div className="flex items-center justify-center w-11 h-full" data-tauri-drag-region>
        <div className="w-7 h-7 p-0.5 rounded-md">
          <img
            src={logoUrl}
            alt="Logo"
            className="w-full h-full pointer-events-none rounded-[3px]"
          />
        </div>
      </div>

      <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

        {(['file', 'edit', 'home', 'layout', 'ai'] as const).map(tab => {
          const isActive = activeTab === tab;
          const label = ({ file: '文件', edit: '编辑', home: '开始', layout: '布局', ai: '智能' } as const)[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group px-3 py-1.5 text-[13px] leading-none font-medium subpixel-antialiased transition-colors relative rounded ${isActive
                ? 'text-brand-700 dark:text-brand-300'
                : 'text-gray-600 dark:text-gray-400'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative inline-block">
                {label}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 w-5 h-0.5 rounded-full transition-opacity ${
                    isActive
                      ? 'opacity-100 bg-brand-600 dark:bg-brand-400'
                      : 'opacity-0 group-hover:opacity-100 bg-gray-300 dark:bg-gray-500'
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1" data-tauri-drag-region />
    </div>
  );
};

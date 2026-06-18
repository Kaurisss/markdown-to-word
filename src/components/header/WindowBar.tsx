import React, { useCallback } from 'react';
import logoUrl from '../../logo.png';
import { TabsList, TabsTrigger } from '../ui/tabs';

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
      className="flex-1 min-w-0 bg-inherit flex items-center text-xs text-ui-text-muted select-none transition-colors duration-200"
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

        <TabsList variant="line" className="h-9">
          {(['file', 'edit', 'home', 'layout', 'ai'] as const).map(tab => {
            const label = ({ file: '文件', edit: '编辑', home: '开始', layout: '布局', ai: '智能' } as const)[tab];
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-3 py-1.5 text-[13px] font-medium"
              >
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <div className="flex-1" data-tauri-drag-region />
    </div>
  );
};

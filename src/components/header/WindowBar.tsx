import React, { useCallback } from 'react';
import { TabsList, TabsTrigger } from '../ui/tabs';

export type TabType = 'file' | 'edit' | 'home' | 'layout' | 'ai';

const TAB_LABELS: Record<TabType, string> = {
  file: '文件',
  edit: '编辑',
  home: '开始',
  layout: '布局',
  ai: '智能',
};

const ALL_TABS: TabType[] = ['file', 'edit', 'home', 'layout', 'ai'];

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
  fileInputRef,
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

  const handleTabSelect = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  const renderTabsList = () => (
    <TabsList variant="line" className="h-9">
      {ALL_TABS.map(tab => (
        <TabsTrigger
          key={tab}
          value={tab}
          className="px-3 py-1.5 text-[14px] font-medium"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleTabSelect(tab);
          }}
        >
          {TAB_LABELS[tab]}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <div
      className="flex-1 min-w-0 bg-inherit flex items-center text-ui-text-muted select-none transition-colors duration-200"
      data-tauri-drag-region
      onDoubleClick={() => void runWindowAction()}
    >
      <div className="flex items-center pl-1.5" onMouseDown={(e) => e.stopPropagation()}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

        {renderTabsList()}
      </div>

      <div className="flex-1" data-tauri-drag-region />
    </div>
  );
};

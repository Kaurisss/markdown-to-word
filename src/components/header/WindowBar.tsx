import React, { useCallback } from 'react';
import { LayoutLeftbarOpenLine } from '@mingcute/react';
import { useWorkspaceStore } from '@/features/workspace/store';
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
  const setWorkspaceSheetOpen = useWorkspaceStore((state) => state.setSheetOpen);
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
        <button
          type="button"
          onClick={() => setWorkspaceSheetOpen(true)}
          className="mr-1 grid size-8 place-items-center rounded-md text-ui-text-muted transition-colors hover:bg-ui-control-hover hover:text-ui-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
          aria-label="打开工作区"
          title="工作区"
        >
          <LayoutLeftbarOpenLine className="size-[17px]" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

        {renderTabsList()}
      </div>

      <div className="flex-1" data-tauri-drag-region />
    </div>
  );
};

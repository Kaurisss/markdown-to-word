import React, { useCallback, useState, useEffect, useRef } from 'react';
import { TabsList, TabsTrigger } from '../ui/tabs';
import { MenuLine } from '@mingcute/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from '../ui/dropdown-menu';
import { WindowBarDisplayMode } from '../../features/settings/store';

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
  displayMode?: WindowBarDisplayMode;
}

export const WindowBar: React.FC<WindowBarProps> = ({
  activeTab,
  setActiveTab,
  onImport,
  fileInputRef,
  displayMode = 'tabs',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // compact 模式：点击外部收起
  useEffect(() => {
    if (displayMode !== 'compact' || !isExpanded) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [displayMode, isExpanded]);

  const handleTabSelect = useCallback((tab: TabType) => {
    setActiveTab(tab);
    if (displayMode === 'compact') {
      setIsExpanded(false);
    }
  }, [setActiveTab, displayMode]);

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

  const renderMenuButton = () => (
    <button
      type="button"
      className="w-8 h-8 ml-1 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
      title="菜单"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        if (displayMode === 'compact') {
          setIsExpanded(!isExpanded);
        }
      }}
    >
      <MenuLine className="w-4 h-4" />
    </button>
  );

  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0 bg-inherit flex items-center text-ui-text-muted select-none transition-colors duration-200"
      data-tauri-drag-region
      onDoubleClick={() => void runWindowAction()}
    >
      <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

        {displayMode === 'tabs' && renderTabsList()}

        {displayMode === 'dropdown' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {renderMenuButton()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4}>
              {ALL_TABS.map(tab => (
                <DropdownMenuCheckboxItem
                  key={tab}
                  checked={activeTab === tab}
                  onCheckedChange={() => handleTabSelect(tab)}
                >
                  {TAB_LABELS[tab]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {displayMode === 'compact' && (
          <>
            {renderMenuButton()}
            {isExpanded && renderTabsList()}
          </>
        )}
      </div>

      <div className="flex-1" data-tauri-drag-region />
    </div>
  );
};
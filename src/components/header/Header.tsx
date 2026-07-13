import React, { useRef, useState } from 'react';
import { HeaderProps } from '../../types';
import { WindowBar, TabType } from './WindowBar';
import { FileTab } from './tabs/FileTab';
import { EditTab } from './tabs/EditTab';
import { HomeTab } from './tabs/HomeTab';
import { LayoutTab } from './tabs/LayoutTab';
import { AITab } from './tabs/AITab';
import { ViewModeDock } from './ViewModeDock';
import { WindowControls } from './WindowControls';
import { UndoRedoDock } from './UndoRedoDock';
import { useAIConfigStore } from '../../features/ai/store';
import { useSettingsStore } from '../../features/settings/store';
import { Tabs, TabsContent } from '../ui/tabs';
import { ConfigStyleKey } from '../../types/config';

const Header: React.FC<HeaderProps> = ({
  isExporting,
  onExport,
  onImport,
  viewMode,
  onViewModeChange,
  cfg,
  onCfgChange,
  onSearchClick,
  onReplaceClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onCut,
  onCopy,
  onPaste,
  onShowToast,
  onOpenAIConfig,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeStyle, setActiveStyle] = useState<ConfigStyleKey>('body');
  const [aiPrompt, setAiPrompt] = useState('');

  const { providers: aiProviders, selectedModel, updateSelectedModel } = useAIConfigStore();
  const { settings: appSettings } = useSettingsStore();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab as any} className="app-chrome relative z-50 flex-shrink-0 bg-ui-surface border-b border-ui-border transition-colors duration-200 gap-0">
      <div className="h-10 bg-ui-surface border-b border-ui-border-subtle flex items-stretch">
        <WindowBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onImport={onImport}
          fileInputRef={fileInputRef}
          displayMode={appSettings.windowBarDisplayMode}
        />
        <UndoRedoDock
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <div className="flex h-full items-stretch border-l border-ui-border-subtle shrink-0">
          <ViewModeDock
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onOpenSettings={onOpenSettings}
          />
          <WindowControls />
        </div>
      </div>

      {/* Ribbon Content - Ribbon Layout */}
      <div className="h-[76px] bg-ui-surface flex items-start px-ui-chrome-x py-0 gap-ui-ribbon-gap flex-nowrap transition-colors duration-200 overflow-x-auto overflow-y-hidden scrollbar-none">
        <TabsContent value="file" className="w-full h-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <FileTab
            onImport={onImport}
            onExport={onExport}
            isExporting={isExporting}
            fileInputRef={fileInputRef}
          />
        </TabsContent>

        <TabsContent value="edit" className="w-full h-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <EditTab
            onUndo={onUndo}
            onRedo={onRedo}
            onCut={onCut}
            onCopy={onCopy}
            onPaste={onPaste}
            onSearchClick={onSearchClick}
            onReplaceClick={onReplaceClick}
          />
        </TabsContent>

        <TabsContent value="home" className="w-full h-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <HomeTab
            cfg={cfg}
            onCfgChange={onCfgChange}
            activeStyle={activeStyle}
            setActiveStyle={setActiveStyle}
            onSearchClick={onSearchClick}
          />
        </TabsContent>

        <TabsContent value="layout" className="w-full h-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <LayoutTab
            cfg={cfg}
            onCfgChange={onCfgChange}
            activeStyle={activeStyle}
            onSearchClick={onSearchClick}
          />
        </TabsContent>

        <TabsContent value="ai" className="w-full h-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <AITab
            aiProviders={aiProviders}
            selectedModel={selectedModel}
            onModelChange={updateSelectedModel}
            onOpenAIConfig={onOpenAIConfig}
            cfg={cfg}
            onCfgChange={onCfgChange}
            onShowToast={onShowToast}
            prompt={aiPrompt}
            setPrompt={setAiPrompt}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Header;

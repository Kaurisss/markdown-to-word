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

const Header: React.FC<HeaderProps> = ({
  isExporting,
  onExport,
  onImport,
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
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
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeStyle, setActiveStyle] = useState<'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote'>('body');
  const [aiPrompt, setAiPrompt] = useState('');

  const { providers: aiProviders, selectedModel, updateSelectedModel } = useAIConfigStore();
  const { settings: appSettings } = useSettingsStore();

  const openAIConfigWindow = async () => {
    try {
      // Check if window exists
      const label = 'ai-config';
      // Use dynamic import for Tauri API to avoid SSR/build issues if not in Tauri env
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const isDark = theme === 'dark';
      const windowBg = isDark ? '#1e1e1e' : '#f9fafb';

      const url = `/?window=config&theme=${encodeURIComponent(theme)}`;
      const webview = new WebviewWindow(label, {
        url,
        title: 'AI 配置',
        width: 640,
        height: 800,
        decorations: false,
        resizable: false,
        center: true,
        visible: false,
        theme,
        backgroundColor: windowBg
      });

      webview.once('tauri://created', function () {
        // Ensure the window keeps the correct background before app paint.
        void webview.setBackgroundColor(windowBg);
      });

      webview.once('tauri://error', function (e) {
        // an error occurred during webview window creation
        console.error('Failed to create AI config window:', e);
        // If window already exists, focus it
        import('@tauri-apps/api/window').then(({ Window }) => {
          const win = new Window(label);
          win.setFocus();
        });
      });

    } catch (e) {
      console.error('Failed to open AI config window:', e);
    }
  };

  const openSettingsWindow = async () => {
    try {
      const label = 'settings';
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      const isDark = theme === 'dark';
      const windowBg = isDark ? '#1e1e1e' : '#f9fafb';

      const url = `/?window=settings&theme=${encodeURIComponent(theme)}`;
      const webview = new WebviewWindow(label, {
        url,
        title: '设置',
        width: 580,
        height: 720,
        decorations: false,
        resizable: false,
        center: true,
        visible: false,
        theme,
        backgroundColor: windowBg
      });

      webview.once('tauri://created', function () {
        void webview.setBackgroundColor(windowBg);
      });

      webview.once('tauri://error', function () {
        import('@tauri-apps/api/window').then(({ Window }) => {
          const win = new Window(label);
          win.setFocus();
        });
      });
    } catch (e) {
      console.error('Failed to open settings window:', e);
    }
  };

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
            onOpenSettings={openSettingsWindow}
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
            setShowAIConfig={() => openAIConfigWindow()}
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

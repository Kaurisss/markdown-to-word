import React, { useRef, useState } from 'react';
import { HeaderProps } from '../types';
import { WindowBar, TabType } from './header/WindowBar';
import { FileTab } from './header/tabs/FileTab';
import { EditTab } from './header/tabs/EditTab';
import { HomeTab } from './header/tabs/HomeTab';
import { LayoutTab } from './header/tabs/LayoutTab';
import { AITab } from './header/tabs/AITab';
import { ViewModeDock } from './header/ViewModeDock';
import { WindowControls } from './header/WindowControls';
import { UndoRedoDock } from './header/UndoRedoDock';
import { useAIConfigStore } from '../services/aiConfigStore';
import { Tabs, TabsContent } from './ui/tabs';

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

  const { providers: aiProviders, selectedModel } = useAIConfigStore();

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
        width: 600,
        height: 800,
        decorations: false,
        resizable: false,
        center: true,
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
        width: 520,
        height: 680,
        decorations: false,
        resizable: false,
        center: true,
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
    <Tabs value={activeTab} onValueChange={setActiveTab as any} className="app-chrome relative z-50 flex-shrink-0 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border transition-colors duration-200">
      <div className="h-10 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border flex items-stretch">
        <WindowBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onImport={onImport}
          fileInputRef={fileInputRef}
        />
        <UndoRedoDock
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <div className="flex h-full items-stretch border-l border-gray-100 dark:border-dark-border shrink-0">
          <ViewModeDock
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onOpenSettings={openSettingsWindow}
          />
          <WindowControls />
        </div>
      </div>

      {/* Ribbon Content - Compact Layout */}
      <div className="h-14 bg-white dark:bg-dark-bg flex items-center px-2 py-1 gap-2 flex-nowrap transition-colors duration-200">
        <TabsContent value="file" className="w-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <FileTab
            onImport={onImport}
            onExport={onExport}
            isExporting={isExporting}
            fileInputRef={fileInputRef}
          />
        </TabsContent>

        <TabsContent value="edit" className="w-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
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

        <TabsContent value="home" className="w-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <HomeTab
            cfg={cfg}
            onCfgChange={onCfgChange}
            activeStyle={activeStyle}
            setActiveStyle={setActiveStyle}
            onSearchClick={onSearchClick}
          />
        </TabsContent>

        <TabsContent value="layout" className="w-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <LayoutTab
            cfg={cfg}
            onCfgChange={onCfgChange}
            activeStyle={activeStyle}
            onSearchClick={onSearchClick}
          />
        </TabsContent>

        <TabsContent value="ai" className="w-full m-0 p-0 outline-none data-[state=inactive]:hidden block">
          <AITab
            aiProviders={aiProviders}
            selectedModel={selectedModel}
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

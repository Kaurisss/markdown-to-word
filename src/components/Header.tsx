import React, { useRef, useState } from 'react';
import { HeaderProps } from '../types';
import { AIProvider, DEFAULT_PROVIDERS } from '../interfaces/AI';
import { WindowBar, TabType } from './header/WindowBar';
import { FileTab } from './header/tabs/FileTab';
import { EditTab } from './header/tabs/EditTab';
import { ViewTab } from './header/tabs/ViewTab';
import { HomeTab } from './header/tabs/HomeTab';
import { LayoutTab } from './header/tabs/LayoutTab';
import { AITab } from './header/tabs/AITab';
import { useAIConfigStore } from '../services/aiConfigStore';

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

  return (
    <div className="relative z-50 flex-shrink-0 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border transition-colors duration-200">
      <WindowBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onImport={onImport}
        fileInputRef={fileInputRef}
      />

      {/* Ribbon Content - Compact Layout */}
      <div className="h-14 bg-white dark:bg-dark-bg flex items-center px-2 py-1 gap-2 flex-nowrap transition-colors duration-200">

        {activeTab === 'file' && (
          <FileTab
            onImport={onImport}
            onExport={onExport}
            isExporting={isExporting}
            fileInputRef={fileInputRef}
          />
        )}

        {activeTab === 'edit' && (
          <EditTab
            onUndo={onUndo}
            onRedo={onRedo}
            onCut={onCut}
            onCopy={onCopy}
            onPaste={onPaste}
            onSearchClick={onSearchClick}
            onReplaceClick={onReplaceClick}
          />
        )}

        {activeTab === 'view' && (
          <ViewTab
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            theme={theme}
            onThemeChange={onThemeChange}
          />
        )}

        {activeTab === 'home' && (
          <HomeTab
            cfg={cfg}
            onCfgChange={onCfgChange}
            activeStyle={activeStyle}
            setActiveStyle={setActiveStyle}
            onSearchClick={onSearchClick}
          />
        )}

        {activeTab === 'layout' && (
          <LayoutTab
            cfg={cfg}
            onCfgChange={onCfgChange}
            activeStyle={activeStyle}
            onSearchClick={onSearchClick}
          />
        )}

        {activeTab === 'ai' && (
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
        )}
      </div>
    </div>
  );
};

export default Header;

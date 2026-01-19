import React, { useRef, useState } from 'react';
import { HeaderProps } from '../types';
import { AIProvider, DEFAULT_PROVIDERS } from '../interfaces/AI';
import { AIConfigModal } from './AIConfigModal';
import { WindowBar, TabType } from './header/WindowBar';
import { FileTab } from './header/tabs/FileTab';
import { ViewTab } from './header/tabs/ViewTab';
import { HomeTab } from './header/tabs/HomeTab';
import { LayoutTab } from './header/tabs/LayoutTab';
import { AITab } from './header/tabs/AITab';

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
  onShowToast 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeStyle, setActiveStyle] = useState<'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote'>('body');

  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>(DEFAULT_PROVIDERS);
  const [selectedModel, setSelectedModel] = useState<{providerId: string, modelId: string} | null>(null);

  // Initialize selected model if not set or if current selection is disabled
  React.useEffect(() => {
    // If we have a selection, check if it's still valid (provider enabled)
    if (selectedModel) {
      const provider = aiProviders.find(p => p.id === selectedModel.providerId);
      if (!provider || !provider.isEnabled) {
        // Current selection invalid, try to find new one
        const firstEnabled = aiProviders.find(p => p.isEnabled);
        if (firstEnabled && firstEnabled.models.length > 0) {
          setSelectedModel({ providerId: firstEnabled.id, modelId: firstEnabled.models[0].id });
        } else {
          setSelectedModel(null);
        }
      }
    } else {
      // No selection, try to select first enabled
      const firstEnabled = aiProviders.find(p => p.isEnabled);
      if (firstEnabled && firstEnabled.models.length > 0) {
        setSelectedModel({ providerId: firstEnabled.id, modelId: firstEnabled.models[0].id });
      }
    }
  }, [aiProviders, selectedModel]);

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
          />
        )}

        {activeTab === 'ai' && (
          <AITab 
            aiProviders={aiProviders} 
            selectedModel={selectedModel} 
            setShowAIConfig={setShowAIConfig}
            cfg={cfg}
            onCfgChange={onCfgChange}
            onShowToast={onShowToast}
          />
        )}
      </div>
      
      <AIConfigModal 
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        providers={aiProviders}
        onUpdateProviders={setAiProviders}
        currentModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
};

export default Header;

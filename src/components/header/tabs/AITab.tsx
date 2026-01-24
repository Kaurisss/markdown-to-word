import React, { useState } from 'react';
import { AIProvider } from '../../../interfaces/AI';
import { DocumentConfig } from '../../../interfaces/Config';
import { AIModelSelector } from './ai/AIModelSelector';
import { AIPromptInput } from './ai/AIPromptInput';
import { AIGenerateButton } from './ai/AIGenerateButton';
import { useAIStyleGenerator } from './ai/useAIStyleGenerator';

interface AITabProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  setShowAIConfig: (show: boolean) => void;
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const AITab: React.FC<AITabProps> = ({
  aiProviders,
  selectedModel,
  setShowAIConfig,
  cfg,
  onCfgChange,
  onShowToast,
  prompt,
  setPrompt
}) => {

  const { isGenerating, error, generate } = useAIStyleGenerator({
    aiProviders,
    selectedModel,
    cfg,
    onCfgChange,
    onShowToast,
    onShowConfig: () => setShowAIConfig(true)
  });

  const handleGenerate = async () => {
    const success = await generate(prompt);
    if (success) {
      setPrompt('');
    }
  };

  return (
    <div className="flex items-center h-full animate-slide-in-left w-full pr-2 gap-2">
      <div className="flex items-center gap-2 shrink-0">
        <AIModelSelector
          aiProviders={aiProviders}
          selectedModel={selectedModel}
          onConfigClick={() => setShowAIConfig(true)}
        />

        <AIPromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleGenerate}
          disabled={isGenerating}
        />

        <AIGenerateButton
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          isGenerating={isGenerating}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs rounded-lg border border-red-200 dark:border-red-800 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
};

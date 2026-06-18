import React, { useEffect, useRef, useState } from 'react';
import { AIProvider } from '../../../interfaces/AI';
import { DocumentConfig } from '../../../interfaces/Config';
import { AIModelSelector } from './ai/AIModelSelector';
import { AIPromptInput } from './ai/AIPromptInput';

import { useAIStyleGenerator } from './ai/useAIStyleGenerator';
import { More2Line } from '@mingcute/react';

import { STYLES } from '../constants';

interface AITabProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  onModelChange: (model: { providerId: string; modelId: string } | null) => void;
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
  onModelChange,
  setShowAIConfig,
  cfg,
  onCfgChange,
  onShowToast,
  prompt,
  setPrompt
}) => {

  const { isGenerating, generate } = useAIStyleGenerator({
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
    <div className="relative flex h-full w-full items-center animate-slide-in-left">
      <div className={STYLES.groupClass}>
        <div className="flex flex-col gap-0.5">
          <span className={STYLES.labelClass}>模型</span>
          <AIModelSelector
            aiProviders={aiProviders}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            onConfigClick={() => setShowAIConfig(true)}
          />
        </div>
      </div>

      <div className={`${STYLES.groupClass} min-w-[360px] flex-1 max-w-[560px]`}>
        <div className="flex w-full flex-col gap-0.5">
          <span className={STYLES.labelClass}>样式描述</span>
          <AIPromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            disabled={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};

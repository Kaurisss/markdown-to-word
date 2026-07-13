import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AIProvider } from '../../../types/ai';
import { DocumentConfig } from '../../../types/config';
import { AIModelSelector } from './ai/AIModelSelector';
import { AIPromptInput } from './ai/AIPromptInput';

import { useAIStyleGenerator } from './ai/useAIStyleGenerator';
import { More2Line } from '@mingcute/react';

import { STYLES } from '../constants';
import { fadeSlideX, motionTransition } from '../../ui/motion';

interface AITabProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  onModelChange: (model: { providerId: string; modelId: string } | null) => void;
  onOpenAIConfig: () => void;
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
  onOpenAIConfig,
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
    onShowConfig: onOpenAIConfig,
  });

  const handleGenerate = async () => {
    const success = await generate(prompt);
    if (success) {
      setPrompt('');
    }
  };

  return (
    <motion.div className="relative flex h-full w-full items-center" variants={fadeSlideX} initial="initial" animate="enter" exit="exit" transition={motionTransition}>
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>模型</span>
            <AIModelSelector
              aiProviders={aiProviders}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              onConfigClick={onOpenAIConfig}
            />
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>AI设置</span>
      </div>

      <div className={`${STYLES.groupClass} min-w-[360px] flex-1 max-w-[560px]`}>
        <div className={`${STYLES.groupContentClass} w-full`}>
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
        <span className={STYLES.groupLabelClass}>智能生成</span>
      </div>
    </motion.div>
  );
};

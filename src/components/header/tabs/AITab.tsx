import React, { useEffect, useRef, useState } from 'react';
import { AIProvider } from '../../../interfaces/AI';
import { DocumentConfig } from '../../../interfaces/Config';
import { AIModelSelector } from './ai/AIModelSelector';
import { AIPromptInput } from './ai/AIPromptInput';
import { AIGenerateButton } from './ai/AIGenerateButton';
import { useAIStyleGenerator } from './ai/useAIStyleGenerator';
import { CircleHelp } from 'lucide-react';

import { STYLES } from '../constants';

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

  const [showHelp, setShowHelp] = useState(false);
  const [isClosingHelp, setIsClosingHelp] = useState(false);
  const helpRef = useRef<HTMLDivElement | null>(null);

  const closeHelp = () => {
    setIsClosingHelp(true);
  };

  const handleAnimationEnd = () => {
    if (isClosingHelp) {
      setShowHelp(false);
      setIsClosingHelp(false);
    }
  };

  useEffect(() => {
    if (!showHelp) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!helpRef.current) return;
      if (helpRef.current.contains(event.target as Node)) return;
      closeHelp();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHelp]);

  const handleGenerate = async () => {
    const success = await generate(prompt);
    if (success) {
      setPrompt('');
    }
  };

  return (
    <div className="flex items-center h-full w-full animate-slide-in-left">
      {/* 模型选择 */}
      <div className={STYLES.groupClass}>
        <div className="flex flex-col gap-0.5">
          <span className={STYLES.labelClass}>模型</span>
          <AIModelSelector
            aiProviders={aiProviders}
            selectedModel={selectedModel}
            onConfigClick={() => setShowAIConfig(true)}
          />
        </div>
      </div>

      {/* 提示词输入 */}
      <div className={`${STYLES.groupClass} flex-1 min-w-0 max-w-4xl`}>
        <div className="flex flex-col gap-0.5 w-full">
          <span className={STYLES.labelClass}>描述样式</span>
          <div className="flex items-center gap-2 w-full">
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
            
            {/* 帮助按钮 */}
            <div className="relative" ref={helpRef}>
              <button
                type="button"
                onClick={() => {
                  if (showHelp) {
                    closeHelp();
                  } else {
                    setShowHelp(true);
                  }
                }}
                className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                title="使用帮助"
              >
                <CircleHelp className="w-4 h-4" />
              </button>
              {(showHelp || isClosingHelp) && (
                <div 
                  className={`absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl p-3 text-[13px] text-gray-600 dark:text-gray-300 origin-top-right ${isClosingHelp ? 'animate-scale-out' : 'animate-scale-in'}`}
                  onAnimationEnd={handleAnimationEnd}
                >
                  <div className="font-semibold text-gray-800 dark:text-gray-100">智能菜单使用说明</div>
                  <div className="mt-2 space-y-1">
                    <div>1. 点击模型选择，进入 AI 配置并填写 API Key。</div>
                    <div>2. 在输入框描述想要的排版风格与细节。</div>
                    <div>3. 点击生成样式，系统会应用新的样式设置。</div>
                  </div>
                  
                  <div className="mt-3 font-semibold text-gray-800 dark:text-gray-100 border-t border-gray-100 dark:border-dark-border pt-2">使用范例</div>
                  <div className="mt-1 space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-dark-border cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors" onClick={() => setPrompt('正文仿宋三号，标题黑体小二加粗，行距1.5倍')}>
                      <div className="text-gray-500 dark:text-gray-400 mb-0.5 text-[11px]">公文风格</div>
                      <div className="text-brand-600 dark:text-brand-400">&quot;正文仿宋三号，标题黑体小二加粗，行距1.5倍&quot;</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-dark-border cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors" onClick={() => setPrompt('正文宋体小四，标题微软雅黑小三，代码块灰色背景')}>
                      <div className="text-gray-500 dark:text-gray-400 mb-0.5 text-[11px]">技术文档</div>
                      <div className="text-brand-600 dark:text-brand-400">&quot;正文宋体小四，标题微软雅黑小三，代码块灰色背景&quot;</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[12px] text-gray-400 dark:text-gray-500">
                    提示：点击范例可直接填入输入框。生成会覆盖当前样式。
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 mt-1 z-50 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-[13px] rounded border border-red-200 dark:border-red-800 animate-fade-in shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
};

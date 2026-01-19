import React from 'react';
import { Settings2, Sparkles } from 'lucide-react';
import { AIProvider } from '../../../interfaces/AI';

interface AITabProps {
  aiProviders: AIProvider[];
  selectedModel: { providerId: string; modelId: string } | null;
  setShowAIConfig: (show: boolean) => void;
}

export const AITab: React.FC<AITabProps> = ({ 
  aiProviders, 
  selectedModel, 
  setShowAIConfig 
}) => {
  return (
    <div className="flex items-center h-full animate-slide-in-left w-full pr-2 gap-2">
      {/* Model Selector & Config */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowAIConfig(true)}
          className="group flex items-center gap-2 h-8 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform"></div>
          <span className="text-xs font-medium">
            {(() => {
              if (!selectedModel) return '选择模型';
              const provider = aiProviders.find(p => p.id === selectedModel.providerId);
              const model = provider?.models.find(m => m.id === selectedModel.modelId);
              return provider && model ? `${provider.name}: ${model.name}` : '选择模型';
            })()}
          </span>
        </button>
        
        <button 
          onClick={() => setShowAIConfig(true)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Prompt Input */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <input
            type="text"
            className="w-full h-9 pl-4 pr-10 text-xs rounded-full border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:bg-white dark:focus:bg-dark-surface focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
            placeholder="描述你想要的文档样式：行距1.5倍，首行缩进2字符"
          />
        </div>
      </div>

      {/* Generate Action */}
      <button
        className="h-8 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs rounded-full font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95"
      >
        <Sparkles className="w-3.5 h-3.5" />
        生成样式
      </button>
    </div>
  );
};

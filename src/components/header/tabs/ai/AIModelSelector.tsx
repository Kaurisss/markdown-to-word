import React from 'react';
import { Settings2 } from 'lucide-react';
import { AIProvider } from '../../../../interfaces/AI';

interface AIModelSelectorProps {
    aiProviders: AIProvider[];
    selectedModel: { providerId: string; modelId: string } | null;
    onConfigClick: () => void;
}

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
    aiProviders,
    selectedModel,
    onConfigClick
}) => {
    const getModelDisplayName = () => {
        if (!selectedModel) return '选择模型';
        const provider = aiProviders.find(p => p.id === selectedModel.providerId);
        const model = provider?.models.find(m => m.id === selectedModel.modelId);
        return provider && model ? `${provider.name}: ${model.name}` : '选择模型';
    };

    return (
        <div className="flex items-center">
            <button
                onClick={onConfigClick}
                className="group flex items-center gap-1.5 h-7 px-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 transition-colors w-40 justify-between"
            >
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                    <span className="text-[13px] truncate text-left">
                        {getModelDisplayName().split(': ')[1] || '选择模型'}
                    </span>
                </div>
                <Settings2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 shrink-0" />
            </button>
        </div>
    );
};

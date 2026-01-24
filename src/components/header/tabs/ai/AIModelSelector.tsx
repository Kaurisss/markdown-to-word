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
        <div className="flex items-center gap-2">
            <button
                onClick={onConfigClick}
                className="group flex items-center gap-2 h-8 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full transition-colors"
            >
                <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform"></div>
                <span className="text-xs font-medium">
                    {getModelDisplayName()}
                </span>
            </button>

            <button
                onClick={onConfigClick}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface"
            >
                <Settings2 className="w-4 h-4" />
            </button>
        </div>
    );
};

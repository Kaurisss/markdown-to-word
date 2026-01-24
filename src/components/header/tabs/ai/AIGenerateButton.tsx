import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIGenerateButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isGenerating?: boolean;
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({
    onClick,
    disabled = false,
    isGenerating = false
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="h-8 px-4 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs rounded-full font-medium transition-all flex items-center gap-1.5 active:scale-95 disabled:active:scale-100"
        >
            {isGenerating ? (
                <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    生成中...
                </>
            ) : (
                <>
                    <Sparkles className="w-3.5 h-3.5" />
                    生成样式
                </>
            )}
        </button>
    );
};

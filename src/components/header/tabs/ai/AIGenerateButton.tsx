import React from 'react';
import { AppleIntelligenceLine } from '@mingcute/react';
import { cn } from '../../../../lib/utils';

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
            className="relative h-7 w-[92px] bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-[13px] rounded font-medium transition-all active:scale-95 disabled:active:scale-100 whitespace-nowrap overflow-hidden"
        >
            <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-opacity duration-200", isGenerating ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>生成中</span>
            </div>
            <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-opacity duration-200", !isGenerating ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <AppleIntelligenceLine className="w-3.5 h-3.5" />
                <span>生成样式</span>
            </div>
        </button>
    );
};

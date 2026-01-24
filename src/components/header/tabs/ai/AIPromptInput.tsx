import React from 'react';

interface AIPromptInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export const AIPromptInput: React.FC<AIPromptInputProps> = ({
    value,
    onChange,
    onSubmit,
    disabled = false,
    placeholder = "描述你想要的文档样式..."
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !disabled) {
            onSubmit();
        }
    };

    return (
        <div className="flex-1 min-w-0">
            <div className="relative group">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="w-full h-9 pl-4 pr-10 text-xs rounded-full border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:bg-white dark:focus:bg-dark-surface focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

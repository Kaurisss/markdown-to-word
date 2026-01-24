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
            <div className="relative group h-full">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="w-full h-7 px-3 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors placeholder:text-gray-400 disabled:opacity-50"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

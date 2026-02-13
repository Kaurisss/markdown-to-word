import React from 'react';
import { Undo2, Redo2, Scissors, Copy, Clipboard, Search, ArrowLeftRight } from 'lucide-react';
import { STYLES } from '../constants';

interface EditTabProps {
    onUndo?: () => void;
    onRedo?: () => void;
    onCut?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onSearchClick?: () => void;
    onReplaceClick?: () => void;
}

export const EditTab: React.FC<EditTabProps> = ({
    onUndo,
    onRedo,
    onCut,
    onCopy,
    onPaste,
    onSearchClick,
    onReplaceClick
}) => {
    const iconBtnClass = "w-7 h-7 rounded flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-element-hover active:bg-gray-300 dark:active:bg-dark-border";

    return (
        <div className="flex items-center h-full animate-slide-in-left">
            {/* 撤销/重做 */}
            <div className={STYLES.groupClass}>
                <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element p-0.5 rounded border border-gray-100 dark:border-dark-border">
                    <button onClick={onUndo} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="撤销 (Ctrl+Z)">
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button onClick={onRedo} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="重做 (Ctrl+Y)">
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 剪贴板 */}
            <div className={STYLES.groupClass}>
                <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element p-0.5 rounded border border-gray-100 dark:border-dark-border">
                    <button onClick={onCut} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="剪切 (Ctrl+X)">
                        <Scissors className="w-4 h-4" />
                    </button>
                    <button onClick={onCopy} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="复制 (Ctrl+C)">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={onPaste} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="粘贴 (Ctrl+V)">
                        <Clipboard className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 查找替换 */}
            <div className={STYLES.groupClass}>
                <button
                    onClick={onSearchClick}
                    onMouseDown={e => e.preventDefault()}
                    className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
                    title="查找 (Ctrl+F)"
                >
                    <Search className="w-5 h-5" />
                    <span className="text-[11px]">查找</span>
                </button>
                <button
                    onClick={onReplaceClick}
                    onMouseDown={e => e.preventDefault()}
                    className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
                    title="替换 (Ctrl+H)"
                >
                    <ArrowLeftRight className="w-5 h-5" />
                    <span className="text-[11px]">替换</span>
                </button>
            </div>
        </div>
    );
};

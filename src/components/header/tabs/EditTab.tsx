import React from 'react';
import { Back2Line, Forward2Line, ScissorsLine, Copy2Line, ClipboardLine, Search2Line, Transfer3Line, DownSmallLine } from '@mingcute/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
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
    const iconBtnClass = "w-8 h-8 rounded flex items-center justify-center transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-element-hover active:bg-gray-300 dark:active:bg-dark-border";

    return (
        <div className="flex items-center h-full animate-slide-in-left">
            {/* 撤销/重做 */}
            <div className={STYLES.groupClass}>
                <div className={STYLES.groupContentClass}>
                    <div className="flex flex-col gap-0.5">
                        <span className={STYLES.labelClass}>操作</span>
                        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element p-0.5 rounded border border-gray-100 dark:border-dark-border">
                            <button onClick={onUndo} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="撤销 (Ctrl+Z)">
                                <Back2Line className="w-5 h-5" />
                            </button>
                            <button onClick={onRedo} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="重做 (Ctrl+Y)">
                                <Forward2Line className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <span className={STYLES.groupLabelClass}>历史记录</span>
            </div>

            {/* 剪贴板 */}
            <div className={STYLES.groupClass}>
                <div className={STYLES.groupContentClass}>
                    <div className="flex flex-col gap-0.5">
                        <span className={STYLES.labelClass}>剪贴</span>
                        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element p-0.5 rounded border border-gray-100 dark:border-dark-border">
                            <button onClick={onCut} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="剪切 (Ctrl+X)">
                                <ScissorsLine className="w-5 h-5" />
                            </button>
                            <button onClick={onCopy} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="复制 (Ctrl+C)">
                                <Copy2Line className="w-5 h-5" />
                            </button>
                            <button onClick={onPaste} onMouseDown={e => e.preventDefault()} className={iconBtnClass} title="粘贴 (Ctrl+V)">
                                <ClipboardLine className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <span className={STYLES.groupLabelClass}>剪贴板</span>
            </div>

            {/* 查找替换 */}
            <div className={STYLES.groupClass}>
                <div className={STYLES.groupContentClass}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onMouseDown={e => e.preventDefault()}
                                className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}
                            >
                                <Search2Line className="w-6 h-6 mb-1" />
                                <span className="text-[11px] leading-none mb-0.5">编辑</span>
                                <DownSmallLine className="w-4 h-4 opacity-70" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[140px]">
                            <DropdownMenuItem
                                className="py-2 px-3 text-[13px] cursor-pointer flex items-center gap-2"
                                onClick={onSearchClick}
                            >
                                <Search2Line className="w-4 h-4" />
                                查找
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="py-2 px-3 text-[13px] cursor-pointer flex items-center gap-2"
                                onClick={onReplaceClick}
                            >
                                <Transfer3Line className="w-4 h-4" />
                                替换
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <span className={STYLES.groupLabelClass}>编辑</span>
            </div>
        </div>
    );
};

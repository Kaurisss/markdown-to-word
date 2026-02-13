import React from 'react';
import { ViewMode } from '../../../types';
import { STYLES } from '../constants';

interface ViewTabProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export const ViewTab: React.FC<ViewTabProps> = ({ viewMode, onViewModeChange, theme, onThemeChange }) => {
  return (
    <div className="flex items-center h-full animate-slide-in-left">
      {/* 视图模式 */}
      <div className={STYLES.groupClass}>
        <div className="flex bg-gray-100 dark:bg-dark-element p-0.5 rounded-md">
          {(['editor', 'split', 'preview'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-2 py-1 text-[13px] rounded-sm transition-all flex items-center gap-1.5 ${viewMode === mode
                ? 'bg-white dark:bg-dark-element-hover text-brand-600 dark:text-brand-400 shadow-sm font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-dark-element-hover/50'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                {mode === 'editor' && <path d="M2 2h12v12H2zm1 1v10h10V3z" />}
                {mode === 'split' && <path d="M2 2h12v12H2zm1 1v10h4V3zm5 0v10h4V3z" />}
                {mode === 'preview' && <path d="M2 2h12v12H2zm1 1v10h10V3zm2 2h6v1H5zm0 2h6v1H5zm0 2h4v1H5z" />}
              </svg>
              <span>{{ editor: '编辑器', split: '双栏', preview: '预览' }[mode]}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 主题设置 */}
      <div className={STYLES.groupClass}>
        <button
          onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
          className={`${STYLES.btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
          title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
          <span className="text-[11px]">{theme === 'dark' ? '浅色' : '深色'}</span>
        </button>
      </div>
    </div>
  );
};

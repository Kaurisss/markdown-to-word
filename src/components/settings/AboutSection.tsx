import React from 'react';
import { GithubLine } from '@mingcute/react';
import appLogo from '../../logo.png';

interface AboutSectionProps {
  settings: {
    theme: string;
    defaultViewMode: string;
    autoSave: boolean;
    showStatusBar: boolean;
    editorFontSize: number;
    editorLineHeight: number;
  };
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => (
  <div className="space-y-5">
    {/* App Logo & Name */}
    <section className="flex flex-col items-center gap-3 pt-4 pb-2">
      <div className="w-16 h-16 rounded-[16px] border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-dark-element flex items-center justify-center">
        <img src={appLogo} alt="简阅转档" className="w-full h-full object-contain" />
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">简阅转档</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">v{__APP_VERSION__}</div>
      </div>
    </section>

    <section className="rounded-lg border border-gray-200 p-4 dark:border-dark-border">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">关于应用</div>
      <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
        Markdown 写作、样式预览和 Word 导出工具。
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-gray-400 dark:text-gray-500">应用版本</div>
          <div className="mt-1 text-gray-700 dark:text-gray-200">{__APP_VERSION__}</div>
        </div>
        <div>
          <div className="text-gray-400 dark:text-gray-500">设置存储</div>
          <div className="mt-1 text-gray-700 dark:text-gray-200">本机 localStorage</div>
        </div>
        <div>
          <div className="text-gray-400 dark:text-gray-500">默认快捷键</div>
          <div className="mt-1 text-gray-700 dark:text-gray-200">Word 常用键位</div>
        </div>
        <div>
          <div className="text-gray-400 dark:text-gray-500">导出引擎</div>
          <div className="mt-1 text-gray-700 dark:text-gray-200">本地 Python 后端</div>
        </div>
      </div>
    </section>

    <section className="rounded-lg border border-gray-200 p-4 dark:border-dark-border">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-200">当前偏好</div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
        <div>主题：{settings.theme === 'dark' ? '深色' : '浅色'}</div>
        <div>默认视图：{settings.defaultViewMode === 'split' ? '双栏' : settings.defaultViewMode === 'editor' ? '编辑器' : '预览'}</div>
        <div>自动保存：{settings.autoSave ? '已开启' : '已关闭'}</div>
        <div>状态栏：{settings.showStatusBar ? '显示' : '隐藏'}</div>
        <div>编辑器字号：{settings.editorFontSize}px</div>
        <div>编辑器行高：{settings.editorLineHeight}px</div>
      </div>
    </section>

    {/* GitHub Link */}
    <a
      href="https://github.com/Kaurisss/markdown-to-word"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-element"
    >
      <GithubLine className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-700 dark:text-gray-200">GitHub 仓库</div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">Kaurisss/markdown-to-word</div>
      </div>
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </a>
  </div>
);

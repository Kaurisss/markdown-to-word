import React from 'react';
import { GithubLine } from '@mingcute/react';
import appLogo from '../../logo.png';
import { SettingCard, SettingItem } from './SettingsLayout';

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
  <div className="space-y-6">
    {/* App Logo & Name */}
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="w-16 h-16 rounded-2xl border border-gray-200/80 dark:border-dark-border overflow-hidden bg-white dark:bg-dark-surface flex items-center justify-center">
        <img src={appLogo} alt="简阅转档" className="w-full h-full object-contain" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">简阅转档</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">v{__APP_VERSION__}</p>
      </div>
    </div>

    {/* 关于应用 */}
    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">关于应用</div>
      <SettingCard>
        <SettingItem
          title="功能简介"
          description="Markdown 写作、样式预览与 Word 一键导出桌面客户端。"
        >
          <span className="text-[13px] text-gray-500 dark:text-gray-400">应用软件</span>
        </SettingItem>

        <SettingItem
          title="当前版本"
          description="当前安装并运行的应用程序版本号。"
        >
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 font-mono">v{__APP_VERSION__}</span>
        </SettingItem>

        <SettingItem
          title="配置存储"
          description="软件偏好设置在本地的保存媒介。"
        >
          <span className="text-[13px] text-gray-600 dark:text-gray-400">本机 LocalStorage</span>
        </SettingItem>

        <SettingItem
          title="渲染引擎"
          description="用于将 Markdown 转换为规范样式 Word 的核心导出模块。"
        >
          <span className="text-[13px] text-gray-600 dark:text-gray-400">Python 后端 (python-docx)</span>
        </SettingItem>
      </SettingCard>
    </div>

    {/* 当前偏好概要 */}
    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">当前状态概要</div>
      <SettingCard>
        <SettingItem title="外观主题">
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{settings.theme === 'dark' ? '深色模式' : '浅色模式'}</span>
        </SettingItem>
        <SettingItem title="默认视图">
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
            {settings.defaultViewMode === 'split' ? '双栏模式' : settings.defaultViewMode === 'editor' ? '编辑器' : '预览模式'}
          </span>
        </SettingItem>
        <SettingItem title="自动保存行为">
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{settings.autoSave ? '已开启' : '已关闭'}</span>
        </SettingItem>
        <SettingItem title="编辑器状态栏">
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{settings.showStatusBar ? '显示状态栏' : '隐藏状态栏'}</span>
        </SettingItem>
        <SettingItem title="编辑器字体规格">
          <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{settings.editorFontSize}px / 行高 {settings.editorLineHeight}px</span>
        </SettingItem>
      </SettingCard>
    </div>

    {/* GitHub 链接 */}
    <a
      href="https://github.com/Kaurisss/markdown-to-word"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:bg-gray-50/50 dark:hover:bg-dark-element/20 transition-all overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <GithubLine className="w-5 h-5 text-gray-600 dark:text-gray-300 shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">
              GitHub 开源仓库
            </h4>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate leading-normal">
              Kaurisss/markdown-to-word
            </p>
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </a>
  </div>
);

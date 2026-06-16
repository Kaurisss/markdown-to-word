import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CloseLine, MinimizeLine } from '@mingcute/react';
import { useSettingsStore, ViewMode } from '../services/settingsStore';
import { FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT } from './header/constants';
import { Select } from './ui/Select';
import { Switch } from './ui/switch';

export const SettingsWindow: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [showInitialSkeleton, setShowInitialSkeleton] = useState(true);
  const [activeSection, setActiveSection] = useState<'appearance' | 'editor' | 'styles'>('appearance');
  const isFirstThemePaintRef = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialSkeleton(false), 260);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let transitionTimer: number | undefined;

    if (isFirstThemePaintRef.current) {
      isFirstThemePaintRef.current = false;
    } else {
      root.classList.add('theme-switching');
      transitionTimer = window.setTimeout(() => {
        root.classList.remove('theme-switching');
      }, 320);
    }

    root.classList.toggle('dark', settings.theme === 'dark');
    (async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();
        const isDark = settings.theme === 'dark';
        await win.setTheme(isDark ? 'dark' : 'light');
        await win.setBackgroundColor(isDark ? '#1e1e1e' : '#f9fafb');
      } catch {
        // Ignore when running outside Tauri.
      }
    })();

    return () => {
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, [settings.theme]);

  const runWindowAction = useCallback(async (action: 'close' | 'minimize') => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      if (action === 'close') await win.close();
      if (action === 'minimize') await win.minimize();
    } catch (e) {
      console.error('Settings window action failed:', e);
    }
  }, []);

  const handleCloseWindow = useCallback(() => {
    void runWindowAction('close');
  }, [runWindowAction]);

  const handleMinimizeWindow = useCallback(() => {
    void runWindowAction('minimize');
  }, [runWindowAction]);

  const skeletonBaseClass = 'animate-pulse rounded-md bg-gray-200 dark:bg-dark-element';
  const labelClass = 'text-xs font-medium text-gray-500 dark:text-gray-400';
  const settingsSelectTriggerClass = 'h-10 px-3 text-[14px] rounded-lg';
  const settingsSelectOptionClass = 'text-[14px]';

  const fontSizeOptions = [
    ...FONT_SIZES.map(fs => ({ label: `${fs.label} (${fs.value}pt)`, value: fs.value })),
    ...FONT_SIZES_PT.filter(pt => !FONT_SIZES.some(fs => fs.value === pt)).map(pt => ({ label: `${pt}pt`, value: pt })),
  ];

  const sectionOptions: Array<{ id: 'appearance' | 'editor' | 'styles'; label: string; desc: string }> = [
    { id: 'appearance', label: '外观', desc: '主题与视图' },
    { id: 'editor', label: '编辑器', desc: '自动保存' },
    { id: 'styles', label: '默认样式', desc: '字体与字号' }
  ];

  const activeSectionLabel = sectionOptions.find(s => s.id === activeSection)?.label ?? '设置';

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-sans select-none"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        if (!isInputElement) e.preventDefault();
      }}
    >
      <div className="h-10 flex items-stretch">
        <div
          className="w-40 shrink-0 px-5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border"
          data-tauri-drag-region
        >
          设置
        </div>
        <div className="flex-1 min-w-0 flex items-stretch bg-white dark:bg-dark-surface">
          <div
            className="flex-1 flex items-center px-6 text-sm font-semibold text-gray-700 dark:text-gray-200"
            data-tauri-drag-region
          >
            {activeSectionLabel}
          </div>
          <div className="flex h-full items-stretch shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleMinimizeWindow}
              className="w-[46px] h-10 grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border transition-colors"
              aria-label="最小化"
            >
              <MinimizeLine size={16} />
            </button>
            <button
              type="button"
              onClick={handleCloseWindow}
              className="w-[46px] h-10 grid place-items-center text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
              aria-label="关闭"
            >
              <CloseLine size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <aside className="w-40 shrink-0 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border">
          <nav className="p-2 space-y-1">
            {sectionOptions.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                  activeSection === section.id
                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-dark-element'
                }`}
              >
                <div className={`text-sm ${activeSection === section.id ? 'text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                  {section.label}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{section.desc}</div>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 bg-white dark:bg-dark-surface">
          <div className="h-full overflow-y-auto px-6 py-4 space-y-6">
            {showInitialSkeleton ? (
              <div className="space-y-6">
                <div className={`h-5 w-32 ${skeletonBaseClass}`} />
                <div className={`h-9 w-full ${skeletonBaseClass}`} />
                <div className={`h-9 w-full ${skeletonBaseClass}`} />
                <div className={`h-9 w-full ${skeletonBaseClass}`} />
              </div>
            ) : (
              <>
                {activeSection === 'appearance' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className={labelClass}>主题模式</label>
                      <div className="flex gap-2">
                        {([
                          { value: 'light' as const, label: '浅色' },
                          { value: 'dark' as const, label: '深色' },
                        ]).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateSettings({ theme: opt.value })}
                            className={`flex-1 h-9 text-sm rounded-lg border transition-all ${
                              settings.theme === opt.value
                                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400 font-medium'
                                : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>默认视图模式</label>
                      <div className="flex gap-2">
                        {([
                          { value: 'editor' as ViewMode, label: '编辑器' },
                          { value: 'split' as ViewMode, label: '双栏' },
                          { value: 'preview' as ViewMode, label: '预览' },
                        ]).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateSettings({ defaultViewMode: opt.value })}
                            className={`flex-1 h-9 text-sm rounded-lg border transition-all ${
                              settings.defaultViewMode === opt.value
                                ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-400 font-medium'
                                : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'editor' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-700 dark:text-gray-200">自动保存</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">自动保存编辑器内容，下次打开时恢复</div>
                      </div>
                      <Switch
                        checked={settings.autoSave}
                        onCheckedChange={(c) => updateSettings({ autoSave: c })}
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'styles' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className={labelClass}>默认中文字体</label>
                      <Select
                        className="w-full"
                        value={settings.defaultFontCn}
                        onChange={(value) => updateSettings({ defaultFontCn: String(value) })}
                        triggerClassName={settingsSelectTriggerClass}
                        optionClassName={settingsSelectOptionClass}
                        options={FONTS_CN.map(f => ({
                          label: FONT_LABELS[f] || f,
                          value: f,
                          fontFamily: f
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>默认英文字体</label>
                      <Select
                        className="w-full"
                        value={settings.defaultFontEn}
                        onChange={(value) => updateSettings({ defaultFontEn: String(value) })}
                        triggerClassName={settingsSelectTriggerClass}
                        optionClassName={settingsSelectOptionClass}
                        options={[
                          { label: '跟随中文', value: '' },
                          ...FONTS_EN.map(f => ({
                            label: FONT_LABELS[f] || f,
                            value: f,
                            fontFamily: f
                          }))
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>默认字号</label>
                      <Select
                        className="w-full"
                        value={settings.defaultFontSize}
                        onChange={(value) => updateSettings({ defaultFontSize: Number(value) })}
                        triggerClassName={settingsSelectTriggerClass}
                        optionClassName={settingsSelectOptionClass}
                        options={fontSizeOptions}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CloseLine } from '@mingcute/react';
import { useSettingsStore, ViewMode } from '../../features/settings/store';
import { FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT } from '../header/constants';
import { Select } from '../ui/Select';
import { Switch } from '../ui/switch';
import { useShowWindowAfterFirstRender } from '../shell/useShowWindowAfterFirstRender';

export const SettingsWindow: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [activeSection, setActiveSection] = useState<'appearance' | 'editor' | 'styles'>('appearance');
  const isFirstThemePaintRef = useRef(true);
  useShowWindowAfterFirstRender();

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

  const labelClass = 'ui-field-label';
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
      className="flex h-screen w-screen flex-col overflow-hidden text-gray-800 dark:text-gray-100 select-none relative"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        if (!isInputElement) e.preventDefault();
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-12 flex items-start z-40 pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto" data-tauri-drag-region />
        <div className="flex h-12 items-stretch shrink-0 pointer-events-auto ml-auto relative z-10">
          <button
            type="button"
            onClick={handleCloseWindow}
            className="w-[46px] h-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
            aria-label="关闭"
          >
            <CloseLine size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <aside className="w-40 shrink-0 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col relative z-40">
          <div className="h-12 px-5 flex items-center shrink-0 relative">
            <div className="absolute inset-0 z-0" data-tauri-drag-region />
            <div className="ui-sidebar-kicker relative z-10 pointer-events-none">设置</div>
          </div>
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
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

        <main className="flex-1 min-w-0 flex flex-col bg-white dark:bg-dark-surface pt-12">
          <div className="px-6 pb-2 pt-2 ui-page-title shrink-0">
            {activeSectionLabel}
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 space-y-6">
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
                                : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-element-hover'
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
                                : 'bg-white dark:bg-dark-element border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-element-hover'
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
          </div>
        </main>
      </div>
    </div>
  );
};

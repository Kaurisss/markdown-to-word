import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSettingsStore, ViewMode, WindowBarDisplayMode } from '../../features/settings/store';
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  KeyboardShortcutBinding,
  ShortcutActionId,
  SHORTCUT_ACTIONS,
  detectShortcutConflicts,
  formatShortcut,
  getShortcutFromKeyboardEvent,
} from '../../features/settings/keyboardShortcuts';
import { Kbd } from '../ui/kbd';
import { FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT } from '../header/constants';
import { Select } from '../ui/Select';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useShowWindowAfterFirstRender } from '../shell/useShowWindowAfterFirstRender';
import { WindowTitleBar } from '../shell/WindowTitleBar';
import { Palette3Line, Edit4Line, KeyboardLine, Box3Line, InformationLine, GithubLine, Settings3Line, SunLine, MoonLine, LayoutTopLine, DownLine, Columns2Line, EditLine, Eye2Line, Save2Line, LayoutBottomLine, ScrollableListLine } from '@mingcute/react';
import appLogo from '../../logo.png';



export const SettingsWindow: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [activeSection, setActiveSection] = useState<'appearance' | 'editor' | 'styles' | 'shortcuts' | 'about'>('appearance');
  const [recordingActionId, setRecordingActionId] = useState<ShortcutActionId | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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

  const labelClass = 'ui-field-label';
  const settingsSelectTriggerClass = 'h-10 px-3 text-[14px] rounded-lg';
  const settingsSelectOptionClass = 'text-[14px]';

  const fontSizeOptions = [
    ...FONT_SIZES.map(fs => ({ label: `${fs.label} (${fs.value}pt)`, value: fs.value })),
    ...FONT_SIZES_PT.filter(pt => !FONT_SIZES.some(fs => fs.value === pt)).map(pt => ({ label: `${pt}pt`, value: pt })),
  ];

  const editorFontSizeOptions = [13, 14, 15, 16, 18, 20].map(value => ({
    label: `${value}px`,
    value,
  }));

  const editorLineHeightOptions = [
    { label: '紧凑 (26px)', value: 26 },
    { label: '标准 (32px)', value: 32 },
    { label: '宽松 (38px)', value: 38 },
    { label: '超宽 (44px)', value: 44 },
  ];

  const sectionOptions: Array<{ id: 'appearance' | 'editor' | 'styles' | 'shortcuts' | 'about'; label: string; desc: string; icon: React.ElementType }> = [
    { id: 'appearance', label: '外观', desc: '主题与视图', icon: Palette3Line },
    { id: 'editor', label: '编辑器', desc: '写作与显示', icon: Edit4Line },
    { id: 'styles', label: '默认样式', desc: '字体与字号', icon: Box3Line },
    { id: 'shortcuts', label: '快捷键', desc: 'Word 风格', icon: KeyboardLine },
    { id: 'about', label: '关于', desc: '版本与存储', icon: InformationLine },
  ];

  const activeSectionLabel = sectionOptions.find(s => s.id === activeSection)?.label ?? '设置';

  const shortcutConflicts = useMemo(
    () => detectShortcutConflicts(settings.keyboardShortcuts),
    [settings.keyboardShortcuts]
  );

  const conflictingActionIds = useMemo(() => {
    const ids = new Set<ShortcutActionId>();
    shortcutConflicts.forEach(conflict => conflict.actionIds.forEach(id => ids.add(id)));
    return ids;
  }, [shortcutConflicts]);

  const shortcutGroups = useMemo(() => {
    const groups: Array<{ group: string; actions: typeof SHORTCUT_ACTIONS }> = [];
    const map = new Map<string, typeof SHORTCUT_ACTIONS>();
    for (const action of SHORTCUT_ACTIONS) {
      const existing = map.get(action.group) ?? [];
      map.set(action.group, [...existing, action]);
    }
    for (const [group, actions] of map) {
      groups.push({ group, actions });
    }
    return groups;
  }, []);

  const updateShortcut = useCallback((actionId: ShortcutActionId, shortcut: KeyboardShortcutBinding) => {
    updateSettings({
      keyboardShortcuts: {
        ...settings.keyboardShortcuts,
        [actionId]: shortcut,
      },
    });
  }, [settings.keyboardShortcuts, updateSettings]);

  const resetShortcut = useCallback((actionId: ShortcutActionId) => {
    updateShortcut(actionId, DEFAULT_KEYBOARD_SHORTCUTS[actionId]);
  }, [updateShortcut]);

  const resetAllShortcuts = useCallback(() => {
    updateSettings({ keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS });
    setRecordingActionId(null);
  }, [updateSettings]);

  useEffect(() => {
    if (!recordingActionId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setRecordingActionId(null);
        return;
      }

      const shortcut = getShortcutFromKeyboardEvent(event);
      if (!shortcut) return;

      updateShortcut(recordingActionId, shortcut);
      setRecordingActionId(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingActionId, updateShortcut]);

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden text-gray-800 dark:text-gray-100 select-none relative"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        if (!isInputElement) e.preventDefault();
      }}
    >
      <WindowTitleBar />

      <div className="flex-1 min-h-0 flex">
        <aside className="w-40 shrink-0 bg-gray-50 dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border flex flex-col relative z-40">
          <div className="h-12 px-5 flex items-center shrink-0 relative">
            <div className="absolute inset-0 z-0" data-tauri-drag-region />
            <div className="ui-sidebar-kicker relative z-10 pointer-events-none flex items-center gap-1.5">
              <Settings3Line className="w-4 h-4" />
              设置
            </div>
          </div>
          <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
            {sectionOptions.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md border transition-colors flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-dark-element'
                }`}
              >
                <section.icon className={`w-4 h-4 shrink-0 ${activeSection === section.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <div className="min-w-0">
                  <div className={`text-sm ${activeSection === section.id ? 'text-brand-700 dark:text-brand-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}>
                    {section.label}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{section.desc}</div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main key={activeSection} className="animate-section-enter flex-1 min-w-0 flex flex-col bg-white dark:bg-dark-surface pt-12">
          <div className="px-6 pb-2 pt-2 ui-page-title shrink-0">
            {activeSectionLabel}
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 space-y-6">
            {activeSection === 'appearance' && (
                <div className="space-y-5">
                  <section className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">显示与视图</div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={labelClass}>主题模式</label>
                        <Select
                          className="w-full"
                          value={settings.theme}
                          onChange={(value) => updateSettings({ theme: value as 'light' | 'dark' })}
                          triggerClassName={settingsSelectTriggerClass}
                          optionClassName={settingsSelectOptionClass}
                          options={[
                            { value: 'light', label: '浅色', icon: <SunLine /> },
                            { value: 'dark', label: '深色', icon: <MoonLine /> },
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>窗口栏模式</label>
                        <Select
                          className="w-full"
                          value={settings.windowBarDisplayMode || 'tabs'}
                          onChange={(value) => updateSettings({ windowBarDisplayMode: value as WindowBarDisplayMode })}
                          triggerClassName={settingsSelectTriggerClass}
                          optionClassName={settingsSelectOptionClass}
                          options={[
                            { value: 'tabs', label: '标签页', icon: <LayoutTopLine /> },
                            { value: 'dropdown', label: '下拉菜单', icon: <DownLine /> },
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>默认视图模式</label>
                        <Select
                          className="w-full"
                          value={settings.defaultViewMode}
                          onChange={(value) => updateSettings({ defaultViewMode: value as ViewMode })}
                          triggerClassName={settingsSelectTriggerClass}
                          optionClassName={settingsSelectOptionClass}
                          options={[
                            { value: 'editor', label: '编辑器', icon: <EditLine /> },
                            { value: 'split', label: '双栏', icon: <Columns2Line /> },
                            { value: 'preview', label: '预览', icon: <Eye2Line /> },
                          ]}
                        />
                      </div>
                    </div>
                  </section>
                </div>
            )}

            {activeSection === 'editor' && (
                <div className="space-y-5">
                  <section className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">写作行为</div>
                    <div className="rounded-lg border border-gray-200 dark:border-dark-border">
                      <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-3 py-3 dark:border-dark-border">
                        <div className="flex items-center gap-3">
                          <Save2Line className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                          <div>
                            <div className="text-sm text-gray-700 dark:text-gray-200">自动保存</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">自动保存编辑器内容，下次打开时恢复</div>
                          </div>
                        </div>
                        <Switch
                          checked={settings.autoSave}
                          onCheckedChange={(c) => updateSettings({ autoSave: c })}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4 px-3 py-3">
                        <div className="flex items-center gap-3">
                          <LayoutBottomLine className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                          <div>
                            <div className="text-sm text-gray-700 dark:text-gray-200">底部状态栏</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">显示字符、行数、段落和查找入口</div>
                          </div>
                        </div>
                        <Switch
                          checked={settings.showStatusBar}
                          onCheckedChange={(c) => updateSettings({ showStatusBar: c })}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">编辑器显示</div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={labelClass}>编辑器字号</label>
                        <Select
                          className="w-full"
                          value={settings.editorFontSize}
                          onChange={(value) => updateSettings({ editorFontSize: Number(value) })}
                          triggerClassName={settingsSelectTriggerClass}
                          optionClassName={settingsSelectOptionClass}
                          options={editorFontSizeOptions}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>编辑器行高</label>
                        <Select
                          className="w-full"
                          value={settings.editorLineHeight}
                          onChange={(value) => updateSettings({ editorLineHeight: Number(value) })}
                          triggerClassName={settingsSelectTriggerClass}
                          optionClassName={settingsSelectOptionClass}
                          options={editorLineHeightOptions}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-3 py-3 dark:border-dark-border">
                      <div className="flex items-center gap-3">
                        <ScrollableListLine className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                        <div>
                          <div className="text-sm text-gray-700 dark:text-gray-200">自动换行</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">长行按编辑器宽度折行；关闭后可横向滚动</div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.editorWordWrap}
                        onCheckedChange={(c) => updateSettings({ editorWordWrap: c })}
                      />
                    </div>
                  </section>
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

            {activeSection === 'shortcuts' && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-dark-border dark:bg-dark-element">
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-200">自定义快捷键</div>
                    <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      默认采用 Word 常用键位。点击某个快捷键后按下新组合键，按 Esc 取消录制。
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="h-8 shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:hover:bg-dark-element-hover"
                  >
                    恢复默认
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['查找', 'Ctrl+F'],
                    ['替换', 'Ctrl+H'],
                    ['全选', 'Ctrl+A'],
                    ['加粗', 'Ctrl+B'],
                    ['斜体', 'Ctrl+I'],
                    ['下划线', 'Ctrl+U'],
                  ].map(([label, shortcut]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-dark-border"
                    >
                      <span className="text-gray-500 dark:text-gray-400">{label}</span>
                      <Kbd>{shortcut}</Kbd>
                    </div>
                  ))}
                </div>

                {shortcutConflicts.length > 0 && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                    存在重复快捷键：{shortcutConflicts.map(conflict => conflict.signature).join('、')}。重复时靠前的动作会先响应。
                  </div>
                )}

                {shortcutGroups.map(({ group, actions }) => (
                  <section key={group} className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{group}</div>
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border">
                      {actions.map(action => {
                        const shortcut = settings.keyboardShortcuts[action.id];
                        const isRecording = recordingActionId === action.id;
                        const hasConflict = conflictingActionIds.has(action.id);

                        return (
                          <div
                            key={action.id}
                            className="flex items-center justify-between gap-4 border-b border-gray-100 px-3 py-2 last:border-b-0 dark:border-dark-border"
                          >
                            <div className="min-w-0">
                              <div className="text-sm text-gray-700 dark:text-gray-200">{action.label}</div>
                              <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{action.description}</div>
                              {hasConflict && (
                                <div className="mt-1 text-xs text-amber-600 dark:text-amber-300">此快捷键与其他动作重复</div>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setRecordingActionId(action.id)}
                                className={`h-8 rounded-lg border px-2 text-xs transition-colors ${
                                  isRecording
                                    ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                    : hasConflict
                                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200'
                                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:hover:bg-dark-element-hover'
                                }`}
                              >
                                {isRecording ? (
                                  <span>按下新快捷键</span>
                                ) : (
                                  <Kbd>{formatShortcut(shortcut)}</Kbd>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => resetShortcut(action.id)}
                                className="h-8 rounded-lg px-2 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-dark-element-hover dark:hover:text-gray-300"
                              >
                                重置
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {activeSection === 'about' && (
                <div className="space-y-5">
                  {/* App Logo & Name */}
                  <section className="flex flex-col items-center gap-3 pt-4 pb-2">
                    <img src={appLogo} alt="简阅转档" className="w-16 h-16 rounded-2xl border border-gray-200 dark:border-gray-600 object-contain" />
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
            )}
          </div>
        </main>
      </div>

      {/* Reset Shortcuts Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">恢复默认快捷键</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            确定要将所有快捷键恢复为默认设置吗？此操作不可撤销。
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                resetAllShortcuts();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
            >
              确定
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

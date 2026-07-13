import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../features/settings/store';
import { useShowWindowAfterFirstRender } from '../shell/useShowWindowAfterFirstRender';
import { WindowTitleBar } from '../shell/WindowTitleBar';
import { Palette3Line, Edit4Line, Box3Line, KeyboardLine, InformationLine, Settings3Line } from '@mingcute/react';
import { AppearanceSection } from './AppearanceSection';
import { EditorSection } from './EditorSection';
import { DefaultStylesSection } from './DefaultStylesSection';
import { ShortcutsSection } from './ShortcutsSection';
import { AboutSection } from './AboutSection';
import { fadeSlideYUp, motionTransition } from '../ui/motion';

type SectionId = 'appearance' | 'editor' | 'styles' | 'shortcuts' | 'about';

const sectionOptions: Array<{ id: SectionId; label: string; desc: string; icon: React.ElementType }> = [
  { id: 'appearance', label: '外观', desc: '主题与视图', icon: Palette3Line },
  { id: 'editor', label: '编辑器', desc: '写作与显示', icon: Edit4Line },
  { id: 'styles', label: '默认样式', desc: '字体与字号', icon: Box3Line },
  { id: 'shortcuts', label: '快捷键', desc: 'Word 风格', icon: KeyboardLine },
  { id: 'about', label: '关于', desc: '版本与存储', icon: InformationLine },
];

export const SettingsWindow: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [activeSection, setActiveSection] = useState<SectionId>('appearance');
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

        <motion.main key={activeSection} className="flex-1 min-w-0 flex flex-col bg-white dark:bg-dark-surface pt-12" variants={fadeSlideYUp} initial="initial" animate="enter" exit="exit" transition={motionTransition}>
          <div className="px-6 pb-2 pt-2 ui-page-title shrink-0">
            {activeSectionLabel}
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 space-y-6">
            {activeSection === 'appearance' && (
              <AppearanceSection settings={settings} updateSettings={updateSettings} />
            )}
            {activeSection === 'editor' && (
              <EditorSection settings={settings} updateSettings={updateSettings} />
            )}
            {activeSection === 'styles' && (
              <DefaultStylesSection settings={settings} updateSettings={updateSettings} />
            )}
            {activeSection === 'shortcuts' && (
              <ShortcutsSection settings={settings} updateSettings={updateSettings} />
            )}
            {activeSection === 'about' && (
              <AboutSection settings={settings} />
            )}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

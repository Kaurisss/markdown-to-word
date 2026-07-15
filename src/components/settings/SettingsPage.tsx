import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../features/settings/store';
import { Palette3Line, Edit4Line, Box3Line, KeyboardLine, InformationLine, ArrowLeftLine } from '@mingcute/react';
import { AppearanceSection } from './AppearanceSection';
import { EditorSection } from './EditorSection';
import { DefaultStylesSection } from './DefaultStylesSection';
import { ShortcutsSection } from './ShortcutsSection';
import { AboutSection } from './AboutSection';
import { fadeSlideYUp, motionTransition } from '../ui/motion';
import { AppPageHeader } from '../shell/AppPageHeader';

type SectionId = 'appearance' | 'editor' | 'styles' | 'shortcuts' | 'about';

const sectionOptions: Array<{ id: SectionId; label: string; desc: string; icon: React.ElementType }> = [
  { id: 'appearance', label: '偏好设置', desc: '主题、语言、窗口及视图等个性化偏好。', icon: Palette3Line },
  { id: 'editor', label: '编辑器设置', desc: '写作行为、行高、字号及自动换行等编辑器选项。', icon: Edit4Line },
  { id: 'styles', label: '默认样式', desc: '导出 Word 时的中英文字体、字号、行距及对齐默认格式。', icon: Box3Line },
  { id: 'shortcuts', label: '快捷键', desc: '查看和配置编辑器常用操作的键盘快捷键绑定。', icon: KeyboardLine },
  { id: 'about', label: '关于应用', desc: '简阅转档版本信息、存储信息和导出引擎状态。', icon: InformationLine },
];

interface SettingsPageProps {
  isActive: boolean;
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isActive, onBack }) => {
  const { settings, updateSettings } = useSettingsStore();
  const [activeSection, setActiveSection] = useState<SectionId>('appearance');

  const activeOption = sectionOptions.find(s => s.id === activeSection);
  const activeSectionLabel = activeOption?.label ?? '设置';
  const activeSectionDesc = activeOption?.desc ?? '';

  const backButton = (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-md text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-dark-element/30 transition-all cursor-pointer"
    >
      <ArrowLeftLine className="w-3.5 h-3.5" />
      返回应用
    </button>
  );

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden text-gray-800 dark:text-gray-100 select-none relative bg-ui-app"
      onContextMenu={(e) => {
        const target = e.target as HTMLElement;
        const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
        if (!isInputElement) e.preventDefault();
      }}
    >
      {/* 顶层透明的拖拽及窗口控制栏，设为 absolute 不占用文档流空间 */}
      <AppPageHeader title="" onBack={onBack} isActive={isActive} transparent={true} showBack={false} leftContent={backButton} />

      <div className="flex-1 min-h-0 flex relative z-10">
        {/* 侧边栏 */}
        <aside className="w-52 shrink-0 bg-[#fafafa] dark:bg-dark-bg/65 border-r border-gray-200/50 dark:border-dark-border flex flex-col pt-10">
          <div className="px-5 pt-3 pb-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">
            通用
          </div>

          <nav className="px-2 py-1 space-y-0.5 flex-1 overflow-y-auto">
            {sectionOptions.map(section => {
              const isSelected = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-gray-200/60 dark:bg-dark-element text-gray-900 dark:text-gray-100 font-medium'
                      : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element/40'
                  }`}
                >
                  <section.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className="text-[13px]">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区域 */}
        <motion.main
          key={activeSection}
          className="flex-1 min-w-0 flex flex-col bg-white dark:bg-dark-surface pt-10"
          variants={fadeSlideYUp}
          initial="initial"
          animate="enter"
          exit="exit"
          transition={motionTransition}
        >
          {/* 大标题与副标题 */}
          <div className="shrink-0 border-b border-gray-100/50 dark:border-dark-border/40">
            <div className="max-w-4xl mx-auto px-8 pb-3 pt-6">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {activeSectionLabel}
              </h1>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                {activeSectionDesc}
              </p>
            </div>
          </div>

          {/* 设置项包裹容器 */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 pb-8 pt-6 space-y-6">
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
          </div>
        </motion.main>
      </div>
    </div>
  );
};

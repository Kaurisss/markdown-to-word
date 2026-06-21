import React from 'react';
import { ViewMode, WindowBarDisplayMode } from '../../features/settings/store';
import { Select } from '../ui/Select';
import { SunLine, MoonLine, Layout5Line, LayoutTopOpenLine, EditLine, Columns2Line, Eye2Line } from '@mingcute/react';

const labelClass = 'ui-field-label';
const triggerClass = 'h-10 px-3 text-[14px] rounded-lg';
const optionClass = 'text-[14px]';

interface AppearanceSectionProps {
  settings: {
    theme: 'light' | 'dark';
    windowBarDisplayMode?: WindowBarDisplayMode;
    defaultViewMode: ViewMode;
  };
  updateSettings: (patch: Record<string, unknown>) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ settings, updateSettings }) => (
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
            triggerClassName={triggerClass}
            optionClassName={optionClass}
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
            triggerClassName={triggerClass}
            optionClassName={optionClass}
            options={[
              { value: 'tabs', label: '标签页', icon: <Layout5Line /> },
              { value: 'dropdown', label: '下拉菜单', icon: <LayoutTopOpenLine /> },
            ]}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>默认视图模式</label>
          <Select
            className="w-full"
            value={settings.defaultViewMode}
            onChange={(value) => updateSettings({ defaultViewMode: value as ViewMode })}
            triggerClassName={triggerClass}
            optionClassName={optionClass}
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
);

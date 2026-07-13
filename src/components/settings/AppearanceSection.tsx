import React from 'react';
import { ViewMode } from '../../features/settings/store';
import { Select } from '../ui/Select';
import { SunLine, MoonLine, EditLine, Columns2Line, Eye2Line } from '@mingcute/react';
import { SettingCard, SettingItem } from './SettingsLayout';

interface AppearanceSectionProps {
  settings: {
    theme: 'light' | 'dark';
    defaultViewMode: ViewMode;
  };
  updateSettings: (patch: Record<string, unknown>) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ settings, updateSettings }) => (
  <div className="space-y-6">
    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        外观与布局
      </div>
      <SettingCard>
        <SettingItem
          title="主题模式"
          description="切换应用程序的主题，可选择浅色模式或深色模式。"
        >
          <Select
            className="w-36"
            value={settings.theme}
            onChange={(value) => updateSettings({ theme: value as 'light' | 'dark' })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={[
              { value: 'light', label: '浅色模式', icon: <SunLine /> },
              { value: 'dark', label: '深色模式', icon: <MoonLine /> },
            ]}
          />
        </SettingItem>

        <SettingItem
          title="默认视图模式"
          description="新打开应用或文档时的默认工作区布局（单编辑器、双栏对比或纯预览）。"
        >
          <Select
            className="w-36"
            value={settings.defaultViewMode}
            onChange={(value) => updateSettings({ defaultViewMode: value as ViewMode })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={[
              { value: 'editor', label: '编辑器', icon: <EditLine /> },
              { value: 'split', label: '双栏模式', icon: <Columns2Line /> },
              { value: 'preview', label: '导出预览', icon: <Eye2Line /> },
            ]}
          />
        </SettingItem>
      </SettingCard>
    </div>
  </div>
);

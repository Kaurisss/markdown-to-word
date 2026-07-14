import React from 'react';
import { Select } from '../ui/Select';
import { Switch } from '../ui/switch';
import { SettingCard, SettingItem } from './SettingsLayout';

interface EditorSectionProps {
  settings: {
    autoSave: boolean;
    showStatusBar: boolean;
    editorFontSize: number;
    editorLineHeight: number;
    editorWordWrap: boolean;
    scrollSyncEnabled: boolean;
  };
  updateSettings: (patch: Record<string, unknown>) => void;
}

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

export const EditorSection: React.FC<EditorSectionProps> = ({ settings, updateSettings }) => (
  <div className="space-y-6">
    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        写作行为
      </div>
      <SettingCard>
        <SettingItem
          title="自动保存"
          description="在写作过程中自动保存内容，以防意外关闭导致内容丢失。"
        >
          <Switch
            checked={settings.autoSave}
            onCheckedChange={(c) => updateSettings({ autoSave: c })}
            aria-label="自动保存"
          />
        </SettingItem>

        <SettingItem
          title="同步滚动"
          description="在双栏对比视图中，使编辑器与右侧的预览区保持同步滚动。"
        >
          <Switch
            checked={settings.scrollSyncEnabled}
            onCheckedChange={(c) => updateSettings({ scrollSyncEnabled: c })}
            aria-label="同步滚动"
          />
        </SettingItem>

        <SettingItem
          title="底部状态栏"
          description="在编辑器底部显示字数、字符、行数以及查找替换入口。"
        >
          <Switch
            checked={settings.showStatusBar}
            onCheckedChange={(c) => updateSettings({ showStatusBar: c })}
            aria-label="底部状态栏"
          />
        </SettingItem>
      </SettingCard>
    </div>

    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        编辑器显示
      </div>
      <SettingCard>
        <SettingItem
          title="编辑器字号"
          description="调整编辑器中文字的大小，只影响显示，不影响最终导出的 Word 文件。"
        >
          <Select
            className="w-36"
            value={settings.editorFontSize}
            onChange={(value) => updateSettings({ editorFontSize: Number(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={editorFontSizeOptions}
          />
        </SettingItem>

        <SettingItem
          title="编辑器行高"
          description="调整写作时的文本行间距，提供更舒适的阅读体验。"
        >
          <Select
            className="w-36"
            value={settings.editorLineHeight}
            onChange={(value) => updateSettings({ editorLineHeight: Number(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={editorLineHeightOptions}
          />
        </SettingItem>

        <SettingItem
          title="自动换行"
          description="开启后，长行文本会根据编辑器宽度折行显示；关闭则支持横向滚动。"
        >
          <Switch
            checked={settings.editorWordWrap}
            onCheckedChange={(c) => updateSettings({ editorWordWrap: c })}
            aria-label="自动换行"
          />
        </SettingItem>
      </SettingCard>
    </div>
  </div>
);

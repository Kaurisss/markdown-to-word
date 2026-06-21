import React from 'react';
import { Select } from '../ui/Select';
import { Switch } from '../ui/switch';
import { Save2Line, LayoutBottomLine, ScrollableListLine } from '@mingcute/react';

const labelClass = 'ui-field-label';
const triggerClass = 'h-10 px-3 text-[14px] rounded-lg';
const optionClass = 'text-[14px]';

interface EditorSectionProps {
  settings: {
    autoSave: boolean;
    showStatusBar: boolean;
    editorFontSize: number;
    editorLineHeight: number;
    editorWordWrap: boolean;
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
            triggerClassName={triggerClass}
            optionClassName={optionClass}
            options={editorFontSizeOptions}
          />
        </div>
        <div className="space-y-2">
          <label className={labelClass}>编辑器行高</label>
          <Select
            className="w-full"
            value={settings.editorLineHeight}
            onChange={(value) => updateSettings({ editorLineHeight: Number(value) })}
            triggerClassName={triggerClass}
            optionClassName={optionClass}
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
);

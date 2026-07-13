import React from 'react';
import { Select } from '../ui/Select';
import { FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT, LINE_SPACINGS } from '../header/constants';
import { SettingCard, SettingItem } from './SettingsLayout';

const paragraphSpacingOptions = [0, 4, 6, 8, 12, 18, 24].map((value) => ({
  label: `${value}pt`,
  value,
}));
const alignmentOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中对齐', value: 'center' },
  { label: '右对齐', value: 'right' },
  { label: '两端对齐', value: 'justify' },
] as const;
const lineSpacingOptions = LINE_SPACINGS.map((value) => ({
  label: `${value} 倍`,
  value,
}));

interface DefaultStylesSectionProps {
  settings: {
    defaultFontCn: string;
    defaultFontEn: string;
    defaultFontSize: number;
    defaultLineSpacing: number;
    defaultSpaceAfter: number;
    defaultAlignment: 'left' | 'center' | 'right' | 'justify';
  };
  updateSettings: (patch: Record<string, unknown>) => void;
}

const fontSizeOptions = [
  ...FONT_SIZES.map(fs => ({ label: `${fs.label} (${fs.value}pt)`, value: fs.value })),
  ...FONT_SIZES_PT.filter(pt => !FONT_SIZES.some(fs => fs.value === pt)).map(pt => ({ label: `${pt}pt`, value: pt })),
];

export const DefaultStylesSection: React.FC<DefaultStylesSectionProps> = ({ settings, updateSettings }) => (
  <div className="space-y-6">
    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        字体格式
      </div>
      <SettingCard>
        <SettingItem
          title="默认中文字体"
          description="导出 Word 文档时，正文内容所使用的中文字体。"
        >
          <Select
            className="w-48"
            value={settings.defaultFontCn}
            onChange={(value: string | number) => updateSettings({ defaultFontCn: String(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={FONTS_CN.map(f => ({
              label: FONT_LABELS[f] || f,
              value: f,
              fontFamily: f
            }))}
          />
        </SettingItem>

        <SettingItem
          title="默认英文字体"
          description="导出 Word 文档时，正文内容所使用的英文字体。设为“跟随中文”时，中英文将统一字体。"
        >
          <Select
            className="w-48"
            value={settings.defaultFontEn}
            onChange={(value: string | number) => updateSettings({ defaultFontEn: String(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={[
              { label: '跟随中文', value: '' },
              ...FONTS_EN.map(f => ({
                label: FONT_LABELS[f] || f,
                value: f,
                fontFamily: f
              }))
            ]}
          />
        </SettingItem>

        <SettingItem
          title="默认字号"
          description="导出 Word 文档时正文文字的字号大小（支持字号名称与磅值对照）。"
        >
          <Select
            className="w-48"
            value={settings.defaultFontSize}
            onChange={(value: string | number) => updateSettings({ defaultFontSize: Number(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={fontSizeOptions}
          />
        </SettingItem>
      </SettingCard>
    </div>

    <div>
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        段落与排版
      </div>
      <SettingCard>
        <SettingItem
          title="默认行距"
          description="设置 Word 正文段落内行的间距。"
        >
          <Select
            className="w-48"
            value={settings.defaultLineSpacing}
            onChange={(value: string | number) => updateSettings({ defaultLineSpacing: Number(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={lineSpacingOptions}
          />
        </SettingItem>

        <SettingItem
          title="默认段后间距"
          description="设置 Word 正文段落与段落之间的间距。"
        >
          <Select
            className="w-48"
            value={settings.defaultSpaceAfter}
            onChange={(value: string | number) => updateSettings({ defaultSpaceAfter: Number(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={paragraphSpacingOptions}
          />
        </SettingItem>

        <SettingItem
          title="默认对齐方式"
          description="段落文本的水平对齐样式。"
        >
          <Select
            className="w-48"
            value={settings.defaultAlignment}
            onChange={(value: string | number) => updateSettings({ defaultAlignment: String(value) })}
            triggerClassName="h-9 px-2.5 text-[13px] rounded-lg"
            optionClassName="text-[13px]"
            options={alignmentOptions}
          />
        </SettingItem>
      </SettingCard>
    </div>
  </div>
);

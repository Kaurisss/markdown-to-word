import React from 'react';
import { Select } from '../ui/Select';
import { FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT, LINE_SPACINGS } from '../header/constants';

const labelClass = 'ui-field-label';
const triggerClass = 'h-10 px-3 text-[14px] rounded-lg';
const optionClass = 'text-[14px]';
const paragraphSpacingOptions = [0, 4, 6, 8, 12, 18, 24].map((value) => ({
  label: `${value}pt`,
  value,
}));
const alignmentOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
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
  <div className="space-y-4">
    <div className="space-y-2">
      <label className={labelClass}>默认中文字体</label>
      <Select
        className="w-full"
        value={settings.defaultFontCn}
        onChange={(value: string | number) => updateSettings({ defaultFontCn: String(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
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
        onChange={(value: string | number) => updateSettings({ defaultFontEn: String(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
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
        onChange={(value: string | number) => updateSettings({ defaultFontSize: Number(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
        options={fontSizeOptions}
      />
    </div>

    <div className="space-y-2">
      <label className={labelClass}>默认行距</label>
      <Select
        className="w-full"
        value={settings.defaultLineSpacing}
        onChange={(value: string | number) => updateSettings({ defaultLineSpacing: Number(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
        options={lineSpacingOptions}
      />
    </div>

    <div className="space-y-2">
      <label className={labelClass}>默认段后间距</label>
      <Select
        className="w-full"
        value={settings.defaultSpaceAfter}
        onChange={(value: string | number) => updateSettings({ defaultSpaceAfter: Number(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
        options={paragraphSpacingOptions}
      />
    </div>

    <div className="space-y-2">
      <label className={labelClass}>默认对齐方式</label>
      <Select
        className="w-full"
        value={settings.defaultAlignment}
        onChange={(value: string | number) => updateSettings({ defaultAlignment: String(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
        options={alignmentOptions}
      />
    </div>
  </div>
);

import React from 'react';
import { Select } from '../ui/Select';
import { FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT } from '../header/constants';

const labelClass = 'ui-field-label';
const triggerClass = 'h-10 px-3 text-[14px] rounded-lg';
const optionClass = 'text-[14px]';

interface DefaultStylesSectionProps {
  settings: {
    defaultFontCn: string;
    defaultFontEn: string;
    defaultFontSize: number;
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
        onChange={(value) => updateSettings({ defaultFontCn: String(value) })}
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
        onChange={(value) => updateSettings({ defaultFontEn: String(value) })}
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
        onChange={(value) => updateSettings({ defaultFontSize: Number(value) })}
        triggerClassName={triggerClass}
        optionClassName={optionClass}
        options={fontSizeOptions}
      />
    </div>
  </div>
);

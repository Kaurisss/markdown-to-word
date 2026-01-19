import React from 'react';
import { Select } from '../../ui/Select';
import { ElementStyle, DocumentConfig } from '../../../interfaces/Config';
import { STYLES, FONTS_EN, FONT_LABELS } from '../constants';

interface LayoutTabProps {
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  activeStyle: 'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote';
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ cfg, onCfgChange, activeStyle }) => {
  const currentStyle = cfg.styles[activeStyle];
  
  const updateStyle = (patch: Partial<ElementStyle>) => {
    onCfgChange({
      ...cfg,
      styles: {
        ...cfg.styles,
        [activeStyle]: { ...currentStyle, ...patch }
      }
    });
  };

  return (
    <div className="flex items-center h-full animate-slide-in-left">
      {/* Page Setup */}
      <div className={STYLES.groupClass}>
        <div className="flex flex-col gap-0.5">
          <span className={STYLES.labelClass}>页边距</span>
          <div className="flex items-center relative">
            <input
              type="number"
              step="0.1"
              className="h-7 w-16 pl-2 pr-6 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors"
              value={cfg.global.pageMargin}
              onChange={(e) => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: Number(e.target.value) } })}
            />
            <span className="absolute right-2 text-[10px] text-gray-400 pointer-events-none">in</span>
          </div>
        </div>
      </div>

      {/* Font Setup */}
      <div className={STYLES.groupClass}>
        <div className="flex flex-col gap-0.5">
          <span className={STYLES.labelClass}>英文/数字字体</span>
          <Select
            className="w-40"
            value={cfg.global.baseFontEn}
            onChange={(val) => onCfgChange({ ...cfg, global: { ...cfg.global, baseFontEn: val } })}
            options={[
              { label: '跟随中文', value: '' },
              ...FONTS_EN.map(f => ({ label: FONT_LABELS[f] || f, value: f }))
            ]}
          />
        </div>
      </div>

      {/* Horizontal Rule Setup */}
      <div className={STYLES.groupClass}>
        <div className="flex flex-col gap-0.5">
          <span className={STYLES.labelClass}>分割线</span>
          <Select
            className="w-24"
            value={cfg.global.horizontalRule || 'default'}
            onChange={(val) => onCfgChange({ ...cfg, global: { ...cfg.global, horizontalRule: val as any } })}
            options={[
              { label: '默认', value: 'default' },
              { label: '换页', value: 'page_break' },
              { label: '隐藏', value: 'hidden' },
            ]}
          />
        </div>
      </div>

      {/* Paragraph Setup */}
      <div className={STYLES.groupClass}>
        <div className="flex gap-2">
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>行距</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 overflow-visible h-7 w-24">
              <input
                type="number"
                step="0.1"
                className="w-full text-xs border-0 p-1 text-center focus:ring-0 outline-none h-full bg-transparent dark:text-gray-100"
                value={(() => {
                  const val = currentStyle.lineSpacing;
                  if (typeof val === 'string' && val.endsWith('pt')) {
                    return parseFloat(val);
                  }
                  return val;
                })()}
                onChange={(e) => {
                  const num = parseFloat(e.target.value);
                  if (isNaN(num)) return;

                  const isPt = typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt');
                  updateStyle({ lineSpacing: isPt ? `${num}pt` : num });
                }}
                title="行距值"
              />
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-600 mx-0.5"></div>
              <Select
                className="w-12"
                variant="ghost"
                value={typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt') ? 'pt' : 'times'}
                onChange={(val) => {
                  const newUnit = val;
                  let currentVal = currentStyle.lineSpacing;
                  let numVal = 1.5; // default fallback

                  if (typeof currentVal === 'number') {
                    numVal = currentVal;
                  } else if (typeof currentVal === 'string' && currentVal.endsWith('pt')) {
                    numVal = parseFloat(currentVal);
                  }

                  if (newUnit === 'pt') {
                    if (numVal < 5) numVal = 20;
                    updateStyle({ lineSpacing: `${numVal}pt` });
                  } else {
                    if (numVal > 5) numVal = 1.5;
                    updateStyle({ lineSpacing: numVal });
                  }
                }}
                options={[
                  { label: '倍', value: 'times' },
                  { label: 'pt', value: 'pt' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>首行缩进</span>
            <Select
              className="w-20"
              value={currentStyle.firstLineIndent}
              onChange={(val) => updateStyle({ firstLineIndent: Number(val) })}
              options={[
                { label: '无', value: 0 },
                { label: '2 字符', value: 2 },
                { label: '3 字符', value: 3 },
                { label: '4 字符', value: 4 },
              ]}
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>段前</span>
            <Select
              className="w-20"
              value={currentStyle.spaceBefore}
              onChange={(val) => updateStyle({ spaceBefore: Number(val) })}
              options={[
                { label: '0 磅', value: 0 },
                { label: '6 磅', value: 6 },
                { label: '12 磅', value: 12 },
                { label: '18 磅', value: 18 },
                { label: '24 磅', value: 24 },
              ]}
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>段后</span>
            <Select
              className="w-20"
              value={currentStyle.spaceAfter}
              onChange={(val) => updateStyle({ spaceAfter: Number(val) })}
              options={[
                { label: '0 磅', value: 0 },
                { label: '6 磅', value: 6 },
                { label: '8 磅', value: 8 },
                { label: '12 磅', value: 12 },
                { label: '18 磅', value: 18 },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

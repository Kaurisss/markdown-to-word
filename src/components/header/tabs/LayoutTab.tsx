import React from 'react';
import { Select } from '../../ui/Select';
import { Separator } from '@/components/ui/separator';
import { ElementStyle, DocumentConfig } from '../../../types/config';
import { STYLES, FONTS_EN, FONT_LABELS } from '../constants';

interface LayoutTabProps {
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  activeStyle: 'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote';
  onSearchClick?: () => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ cfg, onCfgChange, activeStyle, onSearchClick }) => {
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
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>页边距</span>
            <div className="flex items-center relative">
              <input
                type="number"
                step="0.1"
                className="h-8 w-16 pl-2 pr-6 text-[13px] border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-element text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-dark-element-hover focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:ring-offset-0 outline-none transition-colors"
                value={cfg.global.pageMargin}
                onChange={(e) => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: Number(e.target.value) } })}
              />
              <span className="absolute right-2 text-[11px] text-gray-400 pointer-events-none">in</span>
            </div>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>页面设置</span>
      </div>

      {/* Font Setup */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>英文/数字字体</span>
            <Select
              className="w-40"
              value={cfg.global.baseFontEn}
              onChange={(val) => onCfgChange({ ...cfg, global: { ...cfg.global, baseFontEn: val } })}
              showSearch
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
        </div>
        <span className={STYLES.groupLabelClass}>排版字体</span>
      </div>

      {/* Horizontal Rule Setup */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
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
        <span className={STYLES.groupLabelClass}>全局设置</span>
      </div>

      {/* Table of Contents Toggle */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>目录</span>
            <label className="flex items-center gap-2 cursor-pointer h-8 px-2 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-element hover:bg-gray-50 dark:hover:bg-dark-element-hover transition-colors">
              <input
                type="checkbox"
                checked={cfg.global.includeTableOfContents || false}
                onChange={(e) => onCfgChange({ ...cfg, global: { ...cfg.global, includeTableOfContents: e.target.checked } })}
                className="rounded text-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:ring-offset-0 border-gray-300 dark:border-dark-border"
              />
              <span className="text-[13px] text-gray-700 dark:text-gray-300">生成目录</span>
            </label>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>导航</span>
      </div>

      {/* Paragraph Setup */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex gap-2">
            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>行距</span>
              <div className="flex items-center border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-element overflow-hidden h-8 w-24">
                <input
                  type="number"
                  step="0.1"
                  className="w-full text-[13px] border-0 p-1 text-center focus-visible:ring-0 outline-none h-full bg-transparent dark:text-gray-100"
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
                <Separator orientation="vertical" className="h-4 mx-0.5" />
                <Select
                  className="w-12"
                  triggerClassName="h-full rounded-none"
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
        <span className={STYLES.groupLabelClass}>段落间距</span>
      </div>
    </div>
  );
};

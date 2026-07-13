import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Select } from '../../ui/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { BoardLine, LayoutLine, DownSmallLine, DividingLineLine, ListCheckLine, CheckLine } from '@mingcute/react';
import { ConfigStyleKey, ElementStyle, DocumentConfig, PageMargin } from '../../../types/config';
import { DEFAULT_CONFIG } from '../../../config/defaultConfig';
import { CustomMarginDialog } from './layout/CustomMarginDialog';
import { AdvancedPageSettingsDialog } from './layout/AdvancedPageSettingsDialog';
import { SpinnerInput } from '../../ui/SpinnerInput';

import { STYLES, FONTS_EN, FONT_LABELS } from '../constants';
import { fadeSlideX, motionTransition } from '../../ui/motion';

const LINE_SPACING_MODES = [
  { value: '1', label: '单倍行距' },
  { value: '1.5', label: '1.5 倍行距' },
  { value: '2', label: '2 倍行距' },
  { value: 'exact', label: '固定值' },
  { value: 'multiple', label: '多倍行距' },
];

interface LayoutTabProps {
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  activeStyle: ConfigStyleKey;
  onSearchClick?: () => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ cfg, onCfgChange, activeStyle, onSearchClick }) => {
  const [isMarginDialogOpen, setIsMarginDialogOpen] = useState(false);
  const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
  const currentStyle = cfg.styles[activeStyle] ?? DEFAULT_CONFIG.styles[activeStyle] ?? DEFAULT_CONFIG.styles.body;

  const updateStyle = (patch: Partial<ElementStyle>) => {
    onCfgChange({
      ...cfg,
      styles: {
        ...cfg.styles,
        [activeStyle]: { ...currentStyle, ...patch }
      }
    });
  };

  // Preset margins: `val` stores values in inches. The calculation is approximately `val = cm / 2.54`.
  const marginOptions = [
    { id: 'normal', name: '常规', top: 2.54, bottom: 2.54, left: 3.18, right: 3.18, val: { top: 1.0, bottom: 1.0, left: 1.25, right: 1.25 } },
    { id: 'narrow', name: '窄', top: 1.27, bottom: 1.27, left: 1.27, right: 1.27, val: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 } },
    { id: 'moderate', name: '中等', top: 2.54, bottom: 2.54, left: 1.91, right: 1.91, val: { top: 1.0, bottom: 1.0, left: 0.75, right: 0.75 } },
    { id: 'wide', name: '宽', top: 2.54, bottom: 2.54, left: 5.08, right: 5.08, val: { top: 1.0, bottom: 1.0, left: 2.0, right: 2.0 } },
  ];

  const currentMarginObject = useMemo(() => {
    return typeof cfg.global.pageMargin === 'object' && cfg.global.pageMargin !== null
      ? (cfg.global.pageMargin as PageMargin)
      : {
          top: Number(cfg.global.pageMargin) || 1.0,
          bottom: Number(cfg.global.pageMargin) || 1.0,
          left: Number(cfg.global.pageMargin) || 1.0,
          right: Number(cfg.global.pageMargin) || 1.0,
        };
  }, [cfg.global.pageMargin]);

  return (
    <motion.div className="flex items-center h-full" variants={fadeSlideX} initial="initial" animate="enter" exit="exit" transition={motionTransition}>
      {/* Page Setup */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}>
                <BoardLine className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-none">页边距</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[260px]">
              {marginOptions.map(opt => (
                <DropdownMenuItem 
                  key={opt.id} 
                  className="flex items-start gap-4 py-2.5 px-3 cursor-pointer"
                  onClick={() => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: opt.val } })}
                >
                  <div className="w-10 h-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-dark-element relative flex-shrink-0">
                    <div 
                      className="absolute border border-brand-500/70 dark:border-brand-400/70 border-dashed" 
                      style={{
                        top: `${opt.val.top * 6}px`,
                        bottom: `${opt.val.bottom * 6}px`,
                        left: `${opt.val.left * 6}px`,
                        right: `${opt.val.right * 6}px`,
                      }}
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-[13px] text-ui-text mb-1">{opt.name}</span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-ui-text-muted">
                      <span>上: {opt.top} 厘米</span>
                      <span>下: {opt.bottom} 厘米</span>
                      <span>左: {opt.left} 厘米</span>
                      <span>右: {opt.right} 厘米</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <div className="h-px bg-ui-border-subtle my-1 mx-2" />
              <DropdownMenuItem 
                className="py-2.5 px-3 flex items-center text-[13px] text-ui-text cursor-pointer"
                onSelect={() => setIsMarginDialogOpen(true)}
              >
                自定义页边距(A)...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CustomMarginDialog 
            open={isMarginDialogOpen} 
            onOpenChange={setIsMarginDialogOpen} 
            initialMargins={currentMarginObject}
            onSave={(m) => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: m } })}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}>
                <DividingLineLine className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-none">分割线</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              {([['default', '默认'], ['page_break', '换页'], ['hidden', '隐藏']] as const).map(([val, label]) => {
                const active = (cfg.global.horizontalRule || 'default') === val;
                return (
                  <DropdownMenuItem
                    key={val}
                    className={`py-2 px-3 text-[13px] cursor-pointer flex items-center justify-between ${active ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium' : ''}`}
                    onClick={() => onCfgChange({ ...cfg, global: { ...cfg.global, horizontalRule: val as any } })}
                  >
                    {label}
                    {active && <CheckLine className="w-4 h-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}>
                <ListCheckLine className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-none">目录</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              {([true, false] as const).map((val) => {
                const active = (cfg.global.includeTableOfContents || false) === val;
                return (
                  <DropdownMenuItem
                    key={String(val)}
                    className={`py-2 px-3 text-[13px] cursor-pointer flex items-center justify-between ${active ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium' : ''}`}
                    onClick={() => onCfgChange({ ...cfg, global: { ...cfg.global, includeTableOfContents: val } })}
                  >
                    {val ? '生成目录' : '不生成'}
                    {active && <CheckLine className="w-4 h-4" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}
            onClick={() => setIsAdvancedDialogOpen(true)}
            title="高级页面设置"
          >
            <LayoutLine className="w-6 h-6 mb-1" />
            <span className="text-[11px] leading-none">高级</span>
          </button>

          <AdvancedPageSettingsDialog
            open={isAdvancedDialogOpen}
            onOpenChange={setIsAdvancedDialogOpen}
            cfg={cfg}
            onCfgChange={onCfgChange}
          />
        </div>
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
      </div>

      {/* Paragraph Setup */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex gap-1.5">
            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>行距</span>
              <div className="flex gap-1">
                <Select
                  className="w-[100px]"
                  value={(() => {
                    const ls = currentStyle.lineSpacing;
                    if (typeof ls === 'string' && ls.endsWith('pt')) return 'exact';
                    const s = String(ls);
                    return LINE_SPACING_MODES.some(m => m.value === s) ? s : 'multiple';
                  })()}
                  onChange={(val) => {
                    if (val === '1') updateStyle({ lineSpacing: 1 });
                    else if (val === '1.5') updateStyle({ lineSpacing: 1.5 });
                    else if (val === '2') updateStyle({ lineSpacing: 2 });
                    else if (val === 'exact') {
                      const cur = typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt')
                        ? parseFloat(currentStyle.lineSpacing) : 20;
                      updateStyle({ lineSpacing: `${cur}pt` });
                    } else {
                      const cur = typeof currentStyle.lineSpacing === 'number' ? currentStyle.lineSpacing : 1.5;
                      updateStyle({ lineSpacing: cur });
                    }
                  }}
                  options={LINE_SPACING_MODES.map(m => ({ label: m.label, value: m.value }))}
                />
                {(
                  typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt')
                ) || (
                  typeof currentStyle.lineSpacing === 'number' && ![1, 1.5, 2].includes(currentStyle.lineSpacing)
                ) ? (
                  <SpinnerInput
                    value={typeof currentStyle.lineSpacing === 'string' ? parseFloat(currentStyle.lineSpacing) : currentStyle.lineSpacing}
                    step={typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt') ? 1 : 0.1}
                    min={typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt') ? 1 : 0.1}
                    onChange={(v) => {
                      if (typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt')) {
                        updateStyle({ lineSpacing: `${v}pt` });
                      } else {
                        updateStyle({ lineSpacing: v });
                      }
                    }}
                    className="w-16"
                  />
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>首行缩进</span>
              <SpinnerInput
                value={currentStyle.firstLineIndent}
                step={1}
                min={0}
                max={10}
                onChange={(v) => updateStyle({ firstLineIndent: v })}
                className="w-[68px]"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>段前</span>
              <SpinnerInput
                value={currentStyle.spaceBefore}
                step={1}
                min={0}
                onChange={(v) => updateStyle({ spaceBefore: v })}
                className="w-[68px]"
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>段后</span>
              <SpinnerInput
                value={currentStyle.spaceAfter}
                step={1}
                min={0}
                onChange={(v) => updateStyle({ spaceAfter: v })}
                className="w-[68px]"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

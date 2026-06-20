import React, { useState, useEffect, useMemo } from 'react';
import { Select } from '../../ui/Select';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { BoardLine, LayoutLine, DownSmallLine } from '@mingcute/react';
import { ElementStyle, DocumentConfig, PageMargin } from '../../../types/config';

import { STYLES, FONTS_EN, FONT_LABELS } from '../constants';

interface LayoutTabProps {
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  activeStyle: 'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote';
  onSearchClick?: () => void;
}

export const LayoutTab: React.FC<LayoutTabProps> = ({ cfg, onCfgChange, activeStyle, onSearchClick }) => {
  const [isMarginDialogOpen, setIsMarginDialogOpen] = useState(false);
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
    <div className="flex items-center h-full animate-slide-in-left">
      {/* Page Setup */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`${STYLES.btnClass} flex-col h-14 w-14 !px-1 justify-center`}>
                <BoardLine className="w-6 h-6 mb-1" />
                <span className="text-[11px] leading-none mb-0.5">页边距</span>
                <DownSmallLine className="w-4 h-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[260px]">
              {marginOptions.map(opt => (
                <DropdownMenuItem 
                  key={opt.id} 
                  className="flex items-start gap-4 py-2.5 px-3 cursor-pointer"
                  onClick={() => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: opt.val } })}
                >
                  <div className="w-10 h-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-element rounded-sm relative flex-shrink-0 shadow-sm">
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

const CustomMarginDialog = ({
  open,
  onOpenChange,
  initialMargins,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMargins: PageMargin;
  onSave: (margins: PageMargin) => void;
}) => {
  const [m, setM] = useState(initialMargins);

  useEffect(() => {
    if (open) setM(initialMargins);
  }, [open, initialMargins]);

  const handleSave = () => {
    onSave(m);
    onOpenChange(false);
  };

  const inputClass = "h-8 w-full px-2 text-[13px] border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-element text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-dark-element-hover focus-visible:border-brand-500 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:ring-offset-0 outline-none transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white dark:bg-dark-element border-ui-border-subtle shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">自定义页边距</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">上 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.top} onChange={e => setM({ ...m, top: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">下 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.bottom} onChange={e => setM({ ...m, bottom: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">左 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.left} onChange={e => setM({ ...m, left: Number(e.target.value) })} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ui-text-muted">右 (英寸)</label>
            <input type="number" min={0} step="0.1" value={m.right} onChange={e => setM({ ...m, right: Number(e.target.value) })} className={inputClass} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-ui-border-subtle hover:bg-gray-50 dark:hover:bg-dark-element-hover">取消</Button>
          <Button size="sm" onClick={handleSave} className="bg-brand-500 hover:bg-brand-600 text-white">确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ColorFilterLine, AlignLeftLine, AlignCenterLine, AlignRightLine, AlignJustifyLine, BoldFill, ItalicLine, FontLine } from '@mingcute/react';
import { Select } from '../../ui/Select';
import { Toggle } from '../../ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { ConfigStyleKey, ElementStyle, DocumentConfig } from '../../../types/config';
import { DEFAULT_CONFIG } from '../../../config/defaultConfig';
import { STYLES, FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT } from '../constants';
import { ColorPickerPopover } from './home/ColorPickerPopover';
import { fadeSlideX, motionTransition } from '../../ui/motion';

interface HomeTabProps {
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  activeStyle: ConfigStyleKey;
  setActiveStyle: (style: ConfigStyleKey) => void;
  onSearchClick?: () => void;
}

const STYLE_OPTIONS: Array<{ key: ConfigStyleKey; label: string }> = [
  { key: 'body', label: '正文' },
  { key: 'documentTitle', label: '题名' },
  { key: 'h1', label: 'H1' },
  { key: 'h2', label: 'H2' },
  { key: 'h3', label: 'H3' },
  { key: 'table', label: '表格' },
  { key: 'caption', label: '题注' },
  { key: 'code', label: '代码' },
  { key: 'quote', label: '引用' },
];

export const HomeTab: React.FC<HomeTabProps> = ({
  cfg,
  onCfgChange,
  activeStyle,
  setActiveStyle,
  onSearchClick
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Slider animation state
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Calculate slider position
  const updateSliderPosition = useCallback(() => {
    const container = tabContainerRef.current;
    const activeButton = tabRefs.current.get(activeStyle);
    if (container && activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setSliderStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width
      });
    }
  }, [activeStyle]);

  useLayoutEffect(() => {
    updateSliderPosition();
  }, [activeStyle, updateSliderPosition]);

  // Update on resize
  useEffect(() => {
    window.addEventListener('resize', updateSliderPosition);
    return () => window.removeEventListener('resize', updateSliderPosition);
  }, [updateSliderPosition]);

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

  return (
    <motion.div className="flex items-center h-full" variants={fadeSlideX} initial="initial" animate="enter" exit="exit" transition={motionTransition}>
      {/* 样式选择 - 带滑块动画 */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>样式</span>
            <div
              ref={tabContainerRef}
              className="relative flex bg-ui-surface-subtle p-0.5 rounded-ui-panel"
            >
              {/* 滑动指示器 */}
              <div
                className="absolute top-0.5 bottom-0.5 bg-ui-surface-raised rounded-[6px] shadow-sm transition-all duration-300 ease-out"
                style={{
                  left: sliderStyle.left,
                  width: sliderStyle.width,
                  opacity: sliderStyle.width > 0 ? 1 : 0
                }}
              />
              {STYLE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  ref={(el) => { if (el) tabRefs.current.set(key, el); }}
                  onClick={() => setActiveStyle(key)}
                  className={`relative z-10 px-2 py-1 text-[13px] rounded-[6px] transition-colors duration-200 ${activeStyle === key
                      ? 'text-brand-600 dark:text-brand-400 font-medium'
                      : 'text-ui-text-muted hover:text-ui-text'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>样式</span>
      </div>

      {/* 字体设置 */}
      <div className={STYLES.groupClass}>
        <div className={`${STYLES.groupContentClass} flex-col justify-center`}>
          <div className="flex gap-1">
            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>字体</span>
              <Select
                className="w-32"
                value={currentStyle.fontFamily || ''}
                onChange={(val) => updateStyle({ fontFamily: val })}
                placeholder="字体"
                showSearch
                options={[
                  { label: '默认字体', value: '' },
                  ...FONTS_CN.concat(FONTS_EN).map(f => ({
                    label: FONT_LABELS[f] || f,
                    value: f,
                    fontFamily: f
                  }))
                ]}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={STYLES.labelClass}>字号</span>
              <Select
                className="w-16"
                value={currentStyle.fontSize}
                onChange={(val) => updateStyle({ fontSize: Number(val) })}
                options={[
                  ...FONT_SIZES.map(fs => ({ label: fs.label, value: fs.value })),
                  ...FONT_SIZES_PT.map(pt => ({ label: `${pt}`, value: pt }))
                ]}
              />
            </div>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>字体</span>
      </div>

      {/* 格式设置 */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>效果</span>
            <div className="flex items-center gap-0.5 bg-ui-surface-subtle p-0.5 h-8 rounded-ui-panel border border-ui-border-subtle">
            <Toggle
              size="sm"
              pressed={currentStyle.bold || false}
              onPressedChange={(pressed) => updateStyle({ bold: pressed })}
              className="h-full w-8 p-0 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 data-[state=on]:bg-ui-surface-raised data-[state=on]:shadow-sm data-[state=on]:text-brand-600 dark:data-[state=on]:text-brand-400 transition-all"
              title="加粗"
            >
              <BoldFill className="w-4 h-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={currentStyle.italic || false}
              onPressedChange={(pressed) => updateStyle({ italic: pressed })}
              className="h-full w-8 p-0 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 data-[state=on]:bg-ui-surface-raised data-[state=on]:shadow-sm data-[state=on]:text-brand-600 dark:data-[state=on]:text-brand-400 transition-all"
              title="斜体"
            >
              <ItalicLine className="w-4 h-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-4 mx-0.5" />

            {/* Color Picker */}
            <ColorPickerPopover
              open={showColorPicker}
              onOpenChange={setShowColorPicker}
              title="主题颜色"
              currentValue={currentStyle.color || '#000000'}
              onColorSelect={(color) => updateStyle({ color })}
            >
              <button
                className="w-8 h-full rounded-[6px] flex flex-col items-center justify-center gap-[2px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="字体颜色"
              >
                <FontLine className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                <div className="w-4 h-[3px] rounded-sm border border-gray-200 dark:border-dark-border" style={{ backgroundColor: currentStyle.color || '#000000' }}></div>
              </button>
            </ColorPickerPopover>

            {/* Background Color Picker */}
            <ColorPickerPopover
              open={showBgColorPicker}
              onOpenChange={setShowBgColorPicker}
              title="背景颜色"
              currentValue={currentStyle.backgroundColor || '#ffffff'}
              onColorSelect={(color) => {
                if (color === '') {
                  updateStyle({ backgroundColor: undefined });
                } else {
                  updateStyle({ backgroundColor: color });
                }
              }}
              showReset
              resetLabel="无颜色"
            >
              <button
                className="w-8 h-full rounded-[6px] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="背景颜色"
              >
                <div className="flex flex-col items-center justify-center gap-[2px]">
                  <ColorFilterLine className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                  <div className="w-4 h-[3px] rounded-sm border border-gray-200 dark:border-dark-border" style={{ backgroundColor: currentStyle.backgroundColor || 'transparent' }}></div>
                </div>
              </button>
            </ColorPickerPopover>
          </div>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>格式</span>
      </div>

      {/* 对齐方式 */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex flex-col gap-0.5">
            <span className={STYLES.labelClass}>对齐</span>
            <ToggleGroup
              type="single"
              value={currentStyle.alignment || 'left'}
              onValueChange={(val) => {
                if (val) updateStyle({ alignment: val as any });
              }}
              className="flex items-center gap-0.5 bg-ui-surface-subtle p-0.5 h-8 rounded-ui-panel border border-ui-border-subtle"
            >
              {(['left', 'center', 'right', 'justify'] as const).map(align => (
                <ToggleGroupItem
                  key={align}
                  value={align}
                  size="sm"
                  className="h-full w-8 p-0 rounded-[6px] hover:bg-black/5 dark:hover:bg-white/10 data-[state=on]:bg-ui-surface-raised data-[state=on]:shadow-sm data-[state=on]:text-brand-600 dark:data-[state=on]:text-brand-400 transition-all"
                  title={{ left: '左对齐', center: '居中', right: '右对齐', justify: '两端对齐' }[align]}
                >
                  {align === 'left' && <AlignLeftLine className="w-4 h-4" />}
                  {align === 'center' && <AlignCenterLine className="w-4 h-4" />}
                  {align === 'right' && <AlignRightLine className="w-4 h-4" />}
                  {align === 'justify' && <AlignJustifyLine className="w-4 h-4" />}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>段落</span>
      </div>

    </motion.div>
  );
};

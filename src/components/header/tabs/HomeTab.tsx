import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { ColorFilterLine, AlignLeftLine, AlignCenterLine, AlignRightLine, AlignJustifyLine, BoldFill, ItalicLine, FontLine } from '@mingcute/react';
import { Select } from '../../ui/Select';
import { Toggle } from '../../ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { ElementStyle, DocumentConfig } from '../../../types/config';
import { STYLES, FONTS_CN, FONTS_EN, FONT_LABELS, FONT_SIZES, FONT_SIZES_PT, THEME_COLORS, STANDARD_COLORS } from '../constants';

interface HomeTabProps {
  cfg: DocumentConfig;
  onCfgChange: (cfg: DocumentConfig) => void;
  activeStyle: 'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote';
  setActiveStyle: (style: 'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote') => void;
  onSearchClick?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  cfg,
  onCfgChange,
  activeStyle,
  setActiveStyle,
  onSearchClick
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isColorRendered, setIsColorRendered] = useState(false);
  const [isBgColorRendered, setIsBgColorRendered] = useState(false);

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (showColorPicker) setIsColorRendered(true);
  }, [showColorPicker]);

  useEffect(() => {
    if (showBgColorPicker) setIsBgColorRendered(true);
  }, [showBgColorPicker]);

  const handleColorAnimationEnd = () => {
    if (!showColorPicker) setIsColorRendered(false);
  };

  const handleBgColorAnimationEnd = () => {
    if (!showBgColorPicker) setIsBgColorRendered(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target as Node)) {
        setShowBgColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      {/* 样式选择 - 带滑块动画 */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div
            ref={tabContainerRef}
            className="relative flex bg-ui-surface-subtle p-0.5 rounded-ui-panel"
          >
            {/* 滑动指示器 */}
            <div
              className="absolute top-0.5 bottom-0.5 bg-ui-surface-raised rounded-ui-control shadow-sm transition-all duration-300 ease-out"
              style={{
                left: sliderStyle.left,
                width: sliderStyle.width,
                opacity: sliderStyle.width > 0 ? 1 : 0
              }}
            />
            {(['body', 'h1', 'h2', 'h3', 'code', 'quote'] as const).map(s => (
              <button
                key={s}
                ref={(el) => { if (el) tabRefs.current.set(s, el); }}
                onClick={() => setActiveStyle(s)}
                className={`relative z-10 px-2 py-1 text-[13px] rounded-sm transition-colors duration-200 ${activeStyle === s
                    ? 'text-brand-600 dark:text-brand-400 font-medium'
                    : 'text-ui-text-muted hover:text-ui-text'
                  }`}
              >
                {{ body: '正文', h1: 'H1', h2: 'H2', h3: 'H3', code: '代码', quote: '引用' }[s]}
              </button>
            ))}
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>样式</span>
      </div>

      {/* 字体设置 */}
      <div className={STYLES.groupClass}>
        <div className={`${STYLES.groupContentClass} flex-col justify-center`}>
          <div className="flex gap-1">
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
        <span className={STYLES.groupLabelClass}>字体</span>
      </div>

      {/* 格式设置 */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <div className="flex items-center gap-0.5 bg-ui-surface-subtle p-0.5 rounded-ui-panel border border-ui-border-subtle">
            <Toggle
              size="sm"
              pressed={currentStyle.bold || false}
              onPressedChange={(pressed) => updateStyle({ bold: pressed })}
              className="w-7 h-7 p-0 rounded hover:bg-gray-200 dark:hover:bg-ui-control-hover data-[state=on]:bg-brand-100 dark:data-[state=on]:bg-brand-900/30 data-[state=on]:text-brand-600 dark:data-[state=on]:text-brand-400"
              title="加粗"
            >
              <BoldFill className="w-4 h-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={currentStyle.italic || false}
              onPressedChange={(pressed) => updateStyle({ italic: pressed })}
              className="w-7 h-7 p-0 rounded hover:bg-gray-200 dark:hover:bg-ui-control-hover data-[state=on]:bg-brand-100 dark:data-[state=on]:bg-brand-900/30 data-[state=on]:text-brand-600 dark:data-[state=on]:text-brand-400"
              title="斜体"
            >
              <ItalicLine className="w-4 h-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-4 mx-0.5" />

            {/* Color Picker */}
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-7 h-7 rounded flex flex-col items-center justify-center gap-0.5 hover:bg-gray-200 dark:hover:bg-ui-control-hover transition-colors"
                title="字体颜色"
              >
                <FontLine className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                <div className="w-4 h-1 rounded-sm border border-gray-200 dark:border-dark-border" style={{ backgroundColor: currentStyle.color || '#000000' }}></div>
              </button>
              {isColorRendered && (
                <div
                  className={`absolute top-full left-0 mt-1 bg-ui-surface-raised rounded-ui-popover shadow-ui-popover border border-ui-border p-2 z-50 w-56 ${showColorPicker ? 'animate-menu-in' : 'animate-menu-out'}`}
                  onAnimationEnd={handleColorAnimationEnd}
                >
                  <div className="text-[12px] font-medium text-ui-text-subtle mb-1">主题颜色</div>
                  <div className="space-y-0.5">
                    {THEME_COLORS.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-0.5">
                        {row.map((color) => (
                          <button
                            key={color}
                            onClick={() => { updateStyle({ color }); setShowColorPicker(false); }}
                            className="w-5 h-5 rounded-sm border border-ui-border-subtle hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="text-[12px] font-medium text-ui-text-subtle mt-2 mb-1">标准色</div>
                  <div className="flex gap-0.5">
                    {STANDARD_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => { updateStyle({ color }); setShowColorPicker(false); }}
                        className="w-5 h-5 rounded-sm border border-ui-border-subtle hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-dark-border mt-2 pt-2">
                    <label className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                      <input
                        type="color"
                        value={currentStyle.color}
                        onChange={(e) => { updateStyle({ color: e.target.value }); }}
                        className="w-5 h-5 rounded border-0 p-0 cursor-pointer"
                      />
                      <span>其他颜色...</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Background Color Picker */}
            <div className="relative" ref={bgColorPickerRef}>
              <button
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-ui-control-hover transition-colors"
                title="背景颜色"
              >
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <ColorFilterLine className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                  <div className="w-4 h-1 rounded-sm border border-gray-200 dark:border-dark-border" style={{ backgroundColor: currentStyle.backgroundColor || 'transparent' }}></div>
                </div>
              </button>
              {isBgColorRendered && (
                <div
                  className={`absolute top-full left-0 mt-1 bg-ui-surface-raised rounded-ui-popover shadow-ui-popover border border-ui-border p-2 z-50 w-56 ${showBgColorPicker ? 'animate-menu-in' : 'animate-menu-out'}`}
                  onAnimationEnd={handleBgColorAnimationEnd}
                >
                  <div className="text-[12px] font-medium text-ui-text-subtle mb-1">背景颜色</div>
                  {/* Theme Colors - same as text but for background */}
                  <div className="space-y-0.5">
                    {THEME_COLORS.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-0.5">
                        {row.map((color) => (
                          <button
                            key={color}
                            onClick={() => { updateStyle({ backgroundColor: color }); setShowBgColorPicker(false); }}
                            className="w-5 h-5 rounded-sm border border-ui-border-subtle hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-dark-border mt-2 pt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                      <input
                        type="color"
                        value={currentStyle.backgroundColor || '#ffffff'}
                        onChange={(e) => { updateStyle({ backgroundColor: e.target.value }); }}
                        className="w-5 h-5 rounded border-0 p-0 cursor-pointer"
                      />
                      <span>其它颜色...</span>
                    </label>
                    <button
                      onClick={() => { updateStyle({ backgroundColor: undefined }); setShowBgColorPicker(false); }}
                      className="text-[14px] text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50"
                    >
                      无颜色
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <span className={STYLES.groupLabelClass}>格式</span>
      </div>

      {/* 对齐方式 */}
      <div className={STYLES.groupClass}>
        <div className={STYLES.groupContentClass}>
          <ToggleGroup
            type="single"
            value={currentStyle.alignment || 'left'}
            onValueChange={(val) => {
              if (val) updateStyle({ alignment: val as any });
            }}
            className="flex items-center gap-0.5 bg-ui-surface-subtle p-0.5 rounded-ui-panel border border-ui-border-subtle"
          >
            {(['left', 'center', 'right', 'justify'] as const).map(align => (
              <ToggleGroupItem
                key={align}
                value={align}
                size="sm"
                className="w-7 h-7 p-0 rounded hover:bg-gray-200 dark:hover:bg-ui-control-hover data-[state=on]:bg-brand-100 dark:data-[state=on]:bg-brand-900/30 data-[state=on]:text-brand-600 dark:data-[state=on]:text-brand-400"
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
        <span className={STYLES.groupLabelClass}>段落</span>
      </div>

    </div>
  );
};

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { Select } from '../../ui/Select';
import { ElementStyle, DocumentConfig } from '../../../interfaces/Config';
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
        <div
          ref={tabContainerRef}
          className="relative flex bg-gray-100 dark:bg-dark-element p-0.5 rounded-md"
        >
          {/* 滑动指示器 */}
          <div
            className="absolute top-0.5 bottom-0.5 bg-white dark:bg-dark-element-hover rounded-sm shadow-sm transition-all duration-300 ease-out"
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
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {{ body: '正文', h1: 'H1', h2: 'H2', h3: 'H3', code: '代码', quote: '引用' }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* 字体设置 */}
      <div className={STYLES.groupClass}>
        <div className="flex flex-col gap-0.5">
          <Select
            className="w-32"
            value={currentStyle.fontFamily || ''}
            onChange={(val) => updateStyle({ fontFamily: val })}
            placeholder="字体"
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

      {/* 格式设置 */}
      <div className={STYLES.groupClass}>
        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element p-0.5 rounded border border-gray-100 dark:border-dark-border">
          <button
            onClick={() => updateStyle({ bold: !currentStyle.bold })}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${currentStyle.bold ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-element-hover'}`}
            title="加粗"
          >
            <span className="font-bold text-sm">B</span>
          </button>
          <button
            onClick={() => updateStyle({ italic: !currentStyle.italic })}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${currentStyle.italic ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-element-hover'}`}
            title="斜体"
          >
            <span className="italic text-sm font-serif">I</span>
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

          {/* Color Picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-7 h-7 rounded flex flex-col items-center justify-center gap-0.5 hover:bg-gray-200 dark:hover:bg-dark-element-hover transition-colors"
              title="字体颜色"
            >
              <span className="text-sm font-serif font-bold leading-none text-gray-700 dark:text-gray-300">A</span>
              <div className="w-4 h-1 rounded-sm border border-gray-200 dark:border-dark-border" style={{ backgroundColor: currentStyle.color || '#000000' }}></div>
            </button>
            {isColorRendered && (
              <div
                className={`absolute top-full left-0 mt-1 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-2 z-50 w-56 ${showColorPicker ? 'animate-menu-in' : 'animate-menu-out'}`}
                onAnimationEnd={handleColorAnimationEnd}
              >
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1">主题颜色</div>
                <div className="space-y-0.5">
                  {THEME_COLORS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-0.5">
                      {row.map((color) => (
                        <button
                          key={color}
                          onClick={() => { updateStyle({ color }); setShowColorPicker(false); }}
                          className="w-5 h-5 rounded-sm border border-gray-200 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-400 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-2 mb-1">标准色</div>
                <div className="flex gap-0.5">
                  {STANDARD_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => { updateStyle({ color }); setShowColorPicker(false); }}
                      className="w-5 h-5 rounded-sm border border-gray-200 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-400 hover:scale-110 transition-transform"
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
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-element-hover transition-colors"
              title="背景颜色"
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <Palette className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                <div className="w-4 h-1 rounded-sm border border-gray-200 dark:border-dark-border" style={{ backgroundColor: currentStyle.backgroundColor || 'transparent' }}></div>
              </div>
            </button>
            {isBgColorRendered && (
              <div
                className={`absolute top-full left-0 mt-1 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-2 z-50 w-56 ${showBgColorPicker ? 'animate-menu-in' : 'animate-menu-out'}`}
                onAnimationEnd={handleBgColorAnimationEnd}
              >
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1">背景颜色</div>
                {/* Theme Colors - same as text but for background */}
                <div className="space-y-0.5">
                  {THEME_COLORS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-0.5">
                      {row.map((color) => (
                        <button
                          key={color}
                          onClick={() => { updateStyle({ backgroundColor: color }); setShowBgColorPicker(false); }}
                          className="w-5 h-5 rounded-sm border border-gray-200 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-400 hover:scale-110 transition-transform"
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

      {/* 对齐方式 */}
      <div className={STYLES.groupClass}>
        <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-dark-element p-0.5 rounded border border-gray-100 dark:border-dark-border">
          {(['left', 'center', 'right', 'justify'] as const).map(align => (
            <button
              key={align}
              onClick={() => updateStyle({ alignment: align })}
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${currentStyle.alignment === align ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-element-hover'}`}
              title={{ left: '左对齐', center: '居中', right: '右对齐', justify: '两端对齐' }[align]}
            >
              {align === 'left' && <AlignLeft className="w-4 h-4" strokeWidth={2} />}
              {align === 'center' && <AlignCenter className="w-4 h-4" strokeWidth={2} />}
              {align === 'right' && <AlignRight className="w-4 h-4" strokeWidth={2} />}
              {align === 'justify' && <AlignJustify className="w-4 h-4" strokeWidth={2} />}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

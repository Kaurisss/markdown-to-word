import React, { useCallback, useRef, useState } from 'react';
import { HeaderProps } from '../types';
import { ElementStyle } from '../interfaces/Config';
import { Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

// Word 风格字号
const FONT_SIZES: { label: string; value: number }[] = [
  { label: '初号', value: 42 },
  { label: '小初', value: 36 },
  { label: '一号', value: 26 },
  { label: '小一', value: 24 },
  { label: '二号', value: 22 },
  { label: '小二', value: 18 },
  { label: '三号', value: 16 },
  { label: '小三', value: 15 },
  { label: '四号', value: 14 },
  { label: '小四', value: 12 },
  { label: '五号', value: 10.5 },
  { label: '小五', value: 9 },
  { label: '六号', value: 7.5 },
  { label: '小六', value: 6.5 },
  { label: '七号', value: 5.5 },
  { label: '八号', value: 5 },
];
const FONT_SIZES_PT = [5, 5.5, 6.5, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
const FONTS_CN = ['SimSun', 'Microsoft YaHei', 'SimHei', 'KaiTi'];
const FONTS_EN = ['Times New Roman', 'Arial', 'Georgia', 'Courier New'];
const FONT_LABELS: Record<string, string> = {
  'SimSun': '宋体',
  'Microsoft YaHei': '微软雅黑',
  'SimHei': '黑体',
  'KaiTi': '楷体',
  'Times New Roman': '新罗马体 (Times New Roman)',
  'Arial': 'Arial',
  'Georgia': 'Georgia',
  'Courier New': 'Courier New',
};
const LINE_SPACINGS = [1, 1.15, 1.5, 2, 2.5, 3];

// Word 风格颜色面板
const THEME_COLORS = [
  // 第一行 - 主题色
  ['#000000', '#1F497D', '#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646', '#FFFF00', '#00B050'],
  // 第二行 - 浅色 80%
  ['#808080', '#C6D9F1', '#DBE5F1', '#F2DCDB', '#EBF1DE', '#E6E0EC', '#DBEEF4', '#FDE9D9', '#FFFFCC', '#C6EFCE'],
  // 第三行 - 浅色 60%
  ['#A6A6A6', '#8DB4E3', '#B9CDE5', '#E6B9B8', '#D7E4BD', '#CCC1DA', '#B7DEE8', '#FCD5B5', '#FFFF99', '#92D050'],
  // 第四行 - 浅色 40%  
  ['#C0C0C0', '#558ED5', '#95B3D7', '#D99694', '#C3D69B', '#B3A2C7', '#93CDDD', '#FAC090', '#FFFF66', '#54C545'],
  // 第五行 - 深色 25%
  ['#D9D9D9', '#17375E', '#376092', '#953735', '#77933C', '#604A7B', '#31859C', '#E46C0A', '#CCCC00', '#008040'],
  // 第六行 - 深色 50%
  ['#F2F2F2', '#10253E', '#254061', '#632523', '#4F6228', '#403152', '#215968', '#984807', '#999900', '#006030'],
];

const STANDARD_COLORS = [
  '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', '#00B0F0', '#0070C0', '#002060', '#7030A0'
];

const Header: React.FC<HeaderProps> = ({ isExporting, onExport, onImport, viewMode, onViewModeChange, theme, onThemeChange, cfg, onCfgChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'view' | 'home' | 'layout'>('home');
  const [activeStyle, setActiveStyle] = useState<'body' | 'h1' | 'h2' | 'h3' | 'code' | 'quote'>('body');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') onImport(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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

  const selectClass = "h-7 px-2 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors";
  const btnClass = "h-7 px-2 flex items-center justify-center border border-transparent rounded hover:bg-gray-100 dark:hover:bg-dark-surface active:bg-gray-200 dark:active:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200";
  const btnActiveClass = "bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700";

  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const menuItemClass = "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center space-x-2";

  const runWindowAction = useCallback(async (action: 'minimize' | 'toggleMaximize' | 'close') => {
    console.log('Window action triggered:', action);
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      console.log('Window object:', win);
      if (action === 'minimize') {
        console.log('Minimizing...');
        await win.minimize();
      }
      if (action === 'toggleMaximize') {
        console.log('Toggle maximize...');
        await win.toggleMaximize();
      }
      if (action === 'close') {
        console.log('Closing...');
        await win.close();
      }
      console.log('Action completed:', action);
    } catch (e) {
      console.error('Window action failed:', e);
    }
  }, []);

  return (
    <div className="relative z-50 flex-shrink-0 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border transition-colors duration-200">
      {/* VS Code 风格单行标题栏 */}
      <div className="h-10 bg-white dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border flex items-stretch transition-colors duration-200">
        {/* 左侧可拖动区域：Logo + 菜单项 */}
        <div
          className="flex-1 flex items-center text-xs text-gray-600 dark:text-gray-300 select-none min-w-0"
          data-tauri-drag-region
          onDoubleClick={() => void runWindowAction('toggleMaximize')}
        >
          {/* Logo 图标 - 可拖动 */}
          <div className="flex items-center justify-center w-10 h-full" data-tauri-drag-region>
            <img src="/logo.png" alt="Logo" className="w-5 h-5 pointer-events-none" />
          </div>

          {/* 菜单项 - 不可拖动 */}
          <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

            {/* 功能栏切换按钮 */}
            {(['file', 'view', 'home', 'layout'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === tab
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                {{ file: '文件', view: '视图', home: '开始', layout: '布局' }[tab]}
              </button>
            ))}
          </div>

          {/* 点击外部关闭菜单 - 保留用于颜色选择器等 */}
          {openMenu && (
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)}></div>
          )}

          {/* 可拖动的空白区域 */}
          <div className="flex-1" data-tauri-drag-region></div>
        </div>

        {/* 右侧窗口控制按钮 */}
        <div className="flex items-stretch" onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => void runWindowAction('minimize')}
            className="w-12 grid place-items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
            aria-label="最小化"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => void runWindowAction('toggleMaximize')}
            className="w-12 grid place-items-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
            aria-label="最大化/还原"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v16H4zm2 4v10h12V8z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => void runWindowAction('close')}
            className="w-12 grid place-items-center text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white active:bg-red-600 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.46 12L19 17.54V19h-1.46L12 13.46L6.46 19H5v-1.46L10.54 12L5 6.46V5h1.46L12 10.54L17.54 5H19v1.46z" />
            </svg>
          </button>
        </div>
      </div>



      {/* Ribbon Content - Compact Layout */}
      <div className="h-14 bg-white dark:bg-dark-bg flex items-center px-2 py-1 gap-2 flex-nowrap transition-colors duration-200">

        {/* 文件操作 */}
        {activeTab === 'file' && (
          <div className="flex items-center gap-2 h-full animate-slide-in-left">
            <button
              onClick={() => onImport('')}
              className={`${btnClass} gap-1.5`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="text-xs">新建</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${btnClass} gap-1.5`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-xs">导入</span>
            </button>
            <button
              onClick={onExport}
              disabled={isExporting}
              className={`${btnClass} gap-1.5 ${isExporting ? 'opacity-50' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span className="text-xs">{isExporting ? '导出中...' : '导出 Word'}</span>
            </button>
          </div>
        )}

        {/* 视图切换 */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-2 h-full animate-slide-in-left">
            {(['editor', 'split', 'preview'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`${btnClass} gap-1.5 ${viewMode === mode ? btnActiveClass : ''}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  {mode === 'editor' && <path d="M2 2h12v12H2zm1 1v10h10V3z" />}
                  {mode === 'split' && <path d="M2 2h12v12H2zm1 1v10h4V3zm5 0v10h4V3z" />}
                  {mode === 'preview' && <path d="M2 2h12v12H2zm1 1v10h10V3zm2 2h6v1H5zm0 2h6v1H5zm0 2h4v1H5z" />}
                </svg>
                <span className="text-xs">{{ editor: '编辑器', split: '双栏', preview: '预览' }[mode]}</span>
              </button>
            ))}
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            
            <button
              onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className={`${btnClass} gap-1.5`}
              title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              <span className="text-xs">{theme === 'dark' ? '浅色' : '深色'}</span>
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="flex items-center gap-2 h-full animate-slide-in-left">
            {/* Style Selector */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-dark-border">
              {(['body', 'h1', 'h2', 'h3', 'code', 'quote'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStyle(s)}
                  className={`px-1.5 py-0.5 text-[11px] rounded transition-colors ${activeStyle === s
                    ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface'
                    }`}
                >
                  {{ body: '正文', h1: 'H1', h2: 'H2', h3: 'H3', code: '代码', quote: '引用' }[s]}
                </button>
              ))}
            </div>

            <div key={activeStyle} className="flex items-center gap-2 h-full animate-slide-in-left">
            {/* Font Family */}
            <select
              className={`${selectClass} w-48`}
              value={currentStyle.fontFamily || ''}
              onChange={(e) => updateStyle({ fontFamily: e.target.value })}
            >
              <option value="">默认</option>
              {FONTS_CN.concat(FONTS_EN).map(f => <option key={f} value={f}>{FONT_LABELS[f] || f}</option>)}
            </select>

            {/* Font Size */}
            <select
              className={`${selectClass} w-16`}
              value={currentStyle.fontSize}
              onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
            >
              {FONT_SIZES.map(fs => <option key={fs.label} value={fs.value}>{fs.label}</option>)}
              {FONT_SIZES_PT.map(pt => <option key={pt} value={pt}>{pt}</option>)}
            </select>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-7 h-7 rounded border border-gray-300 dark:border-dark-border cursor-pointer p-0.5 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500"
                title="字体颜色"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="font-sans text-base font-medium leading-none" style={{ color: 'currentColor' }}>A</span>
                  <div className="h-[3px] w-3.5 rounded-sm mt-[1px]" style={{ backgroundColor: currentStyle.color || '#000000' }}></div>
                </div>
              </button>
              {showColorPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-2 z-50 w-56 animate-menu-in">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">主题颜色</div>
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
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 mb-1">标准色</div>
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
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
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
                </>
              )}
            </div>

            {/* Background Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="w-7 h-7 rounded border border-gray-300 dark:border-dark-border cursor-pointer p-0.5 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500"
                title="背景颜色"
              >
                <div 
                  className="w-full h-full flex items-center justify-center rounded-sm"
                  style={{ backgroundColor: currentStyle.backgroundColor || undefined }}
                >
                  {currentStyle.backgroundColor ? (
                     <Palette className="w-4 h-4 text-black/20 dark:text-white/20" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-surface rounded-sm">
                      <Palette className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </button>
              {showBgColorPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBgColorPicker(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-2 z-50 w-56 animate-menu-in">
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">背景颜色</div>
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
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                        <input
                          type="color"
                          value={currentStyle.backgroundColor || '#ffffff'}
                          onChange={(e) => { updateStyle({ backgroundColor: e.target.value }); }}
                          className="w-5 h-5 rounded border-0 p-0 cursor-pointer"
                        />
                        <span>选择...</span>
                      </label>
                      <button
                        onClick={() => { updateStyle({ backgroundColor: undefined }); setShowBgColorPicker(false); }}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50"
                      >
                        无颜色
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-200"></div>

            {/* Bold & Italic */}
            <button
              onClick={() => updateStyle({ bold: !currentStyle.bold })}
              className={`${btnClass} w-7 h-7 text-sm font-bold ${currentStyle.bold ? btnActiveClass : ''}`}
              title="加粗"
            >B</button>
            <button
              onClick={() => updateStyle({ italic: !currentStyle.italic })}
              className={`${btnClass} w-7 h-7 text-sm italic ${currentStyle.italic ? btnActiveClass : ''}`}
              title="斜体"
            >I</button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-200"></div>

            {/* Alignment */}
            {(['left', 'center', 'right', 'justify'] as const).map(align => (
              <button
                key={align}
                onClick={() => updateStyle({ alignment: align })}
                className={`${btnClass} w-7 h-7 ${currentStyle.alignment === align ? btnActiveClass : ''}`}
                title={{ left: '左对齐', center: '居中', right: '右对齐', justify: '两端对齐' }[align]}
              >
                {align === 'left' && <AlignLeft className="w-5 h-5" strokeWidth={2} />}
                {align === 'center' && <AlignCenter className="w-5 h-5" strokeWidth={2} />}
                {align === 'right' && <AlignRight className="w-5 h-5" strokeWidth={2} />}
                {align === 'justify' && <AlignJustify className="w-5 h-5" strokeWidth={2} />}
              </button>
            ))}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="flex items-center gap-2 h-full animate-slide-in-left">
            {/* Page Margin */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">页边距</span>
              <input
                type="number"
                step="0.1"
                className={`${selectClass} w-14`}
                value={cfg.global.pageMargin}
                onChange={(e) => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: Number(e.target.value) } })}
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">英寸</span>
            </div>

            {/* English/Number Font Setting */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-700">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">英文/数字字体</span>
              <select
                className={`${selectClass} w-48`}
                value={cfg.global.baseFontEn}
                onChange={(e) => onCfgChange({ ...cfg, global: { ...cfg.global, baseFontEn: e.target.value } })}
              >
                <option value="">跟随中文</option>
                {FONTS_EN.map(f => <option key={f} value={f}>{FONT_LABELS[f] || f}</option>)}
              </select>
            </div>

            {/* Line Spacing - for current style */}
            <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">行距</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 overflow-hidden h-7">
                <input
                  type="number"
                  step="0.1"
                  className="w-12 text-xs border-0 p-1 text-center focus:ring-0 outline-none h-full bg-transparent dark:text-gray-100"
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
                <select
                  className="text-[10px] border-l border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 h-full px-1 focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 dark:text-gray-200"
                  value={typeof currentStyle.lineSpacing === 'string' && currentStyle.lineSpacing.endsWith('pt') ? 'pt' : 'times'}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    let currentVal = currentStyle.lineSpacing;
                    let numVal = 1.5; // default fallback

                    if (typeof currentVal === 'number') {
                      numVal = currentVal;
                    } else if (typeof currentVal === 'string' && currentVal.endsWith('pt')) {
                      numVal = parseFloat(currentVal);
                    }

                    if (newUnit === 'pt') {
                      // Converting to pt (approximate logical default if switching)
                      // If it was a small multiplier (e.g. 1.5), mapping to pt directly (1.5pt) is invisible. 
                      // Better to default to a sensible pt value (e.g. 20pt) if the number is small, OR just keep the number.
                      // Let's just keep the number for simplicity, user can adjust.
                      // Actually, if switching from 1.5 (times) -> pt, 1.5pt is bad. 
                      // Let's heuristically adjust if value < 5.
                      if (numVal < 5) numVal = 20;
                      updateStyle({ lineSpacing: `${numVal}pt` });
                    } else {
                      // Switching to times
                      // If switching from 20pt -> times, 20 times is huge.
                      // Heuristically adjust if value > 5.
                      if (numVal > 5) numVal = 1.5;
                      updateStyle({ lineSpacing: numVal });
                    }
                  }}
                >
                  <option value="times">倍</option>
                  <option value="pt">pt</option>
                </select>
              </div>
            </div>

            {/* Indent */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">首行缩进</span>
              <select
                className={`${selectClass} w-24`}
                value={currentStyle.firstLineIndent}
                onChange={(e) => updateStyle({ firstLineIndent: Number(e.target.value) })}
              >
                <option value={0}>无</option>
                <option value={2}>2 字符</option>
                <option value={3}>3 字符</option>
                <option value={4}>4 字符</option>
              </select>
            </div>

            {/* Spacing Before/After */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">段前</span>
              <select
                className={`${selectClass} w-20`}
                value={currentStyle.spaceBefore}
                onChange={(e) => updateStyle({ spaceBefore: Number(e.target.value) })}
              >
                <option value={0}>0 磅</option>
                <option value={6}>6 磅</option>
                <option value={12}>12 磅</option>
                <option value={18}>18 磅</option>
                <option value={24}>24 磅</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">段后</span>
              <select
                className={`${selectClass} w-20`}
                value={currentStyle.spaceAfter}
                onChange={(e) => updateStyle({ spaceAfter: Number(e.target.value) })}
              >
                <option value={0}>0 磅</option>
                <option value={6}>6 磅</option>
                <option value={8}>8 磅</option>
                <option value={12}>12 磅</option>
                <option value={18}>18 磅</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

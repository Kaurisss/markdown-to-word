import React, { useCallback, useRef, useState } from 'react';
import { HeaderProps } from '../types';
import { ElementStyle } from '../interfaces/Config';
import { AIProvider, DEFAULT_PROVIDERS } from '../interfaces/AI';
import { Palette, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bot, Sparkles, Settings2, Key, ChevronDown } from 'lucide-react';
import { Select, SelectOption } from './ui/Select';
import { AIConfigModal } from './AIConfigModal';

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

const Header: React.FC<HeaderProps> = ({ isExporting, onExport, onImport, viewMode, onViewModeChange, theme, onThemeChange, cfg, onCfgChange, onSearchClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'view' | 'home' | 'layout' | 'ai'>('home');
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
  const dividerClass = "w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1";
  const groupClass = "flex items-center gap-1 h-full px-1 first:pl-0 last:pr-0 border-r border-gray-200 dark:border-gray-700 last:border-r-0";
  const labelClass = "text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 block";
  const inputClass = "h-7 px-2 text-xs border border-gray-300 dark:border-dark-border rounded bg-white dark:bg-dark-surface text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors";

  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>(DEFAULT_PROVIDERS);
  const [selectedModel, setSelectedModel] = useState<{providerId: string, modelId: string} | null>(null);

  // Initialize selected model if not set or if current selection is disabled
  React.useEffect(() => {
    // If we have a selection, check if it's still valid (provider enabled)
    if (selectedModel) {
      const provider = aiProviders.find(p => p.id === selectedModel.providerId);
      if (!provider || !provider.isEnabled) {
        // Current selection invalid, try to find new one
        const firstEnabled = aiProviders.find(p => p.isEnabled);
        if (firstEnabled && firstEnabled.models.length > 0) {
          setSelectedModel({ providerId: firstEnabled.id, modelId: firstEnabled.models[0].id });
        } else {
          setSelectedModel(null);
        }
      }
    } else {
      // No selection, try to select first enabled
      const firstEnabled = aiProviders.find(p => p.isEnabled);
      if (firstEnabled && firstEnabled.models.length > 0) {
        setSelectedModel({ providerId: firstEnabled.id, modelId: firstEnabled.models[0].id });
      }
    }
  }, [aiProviders, selectedModel]);

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);

  const menuItemClass = "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center space-x-2";

  React.useEffect(() => {
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

  React.useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupWindowListener = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const win = getCurrentWindow();

        setIsMaximized(await win.isMaximized());

        unlisten = await win.listen('tauri://resize', async () => {
          setIsMaximized(await win.isMaximized());
        });
      } catch (e) {
        console.error('Failed to setup window listener:', e);
      }
    };

    setupWindowListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

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
            <img src="/logo.png" alt="Logo" className="w-5 h-5 pointer-events-none border border-gray-200 dark:border-gray-600 rounded-sm" />
          </div>

          {/* 菜单项 - 不可拖动 */}
          <div className="flex items-center" onMouseDown={(e) => e.stopPropagation()}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

            {/* 功能栏切换按钮 */}
            {(['file', 'view', 'home', 'layout', 'ai'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === tab
                  ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {{ file: '文件', view: '视图', home: '开始', layout: '布局', ai: '智能' }[tab]}
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
            aria-label={isMaximized ? "还原" : "最大化"}
          >
            {isMaximized ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 8V4H20V16H16" />
                <rect x="4" y="8" width="12" height="12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="5" width="14" height="14" />
              </svg>
            )}
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
          <div className="flex items-center h-full animate-slide-in-left">
            <div className={groupClass}>
              <button
                onClick={() => onImport('')}
                className={`${btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="text-[10px] scale-90">新建</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span className="text-[10px] scale-90">导入</span>
              </button>
              <button
                onClick={onExport}
                disabled={isExporting}
                className={`${btnClass} flex-col gap-0.5 h-12 w-12 !px-1 ${isExporting ? 'opacity-50' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                <span className="text-[10px] scale-90">{isExporting ? '导出中' : '导出'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 视图切换 */}
        {activeTab === 'view' && (
          <div className="flex items-center h-full animate-slide-in-left">
            {/* 视图模式 */}
            <div className={groupClass}>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
                {(['editor', 'split', 'preview'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => onViewModeChange(mode)}
                    className={`px-2 py-1 text-xs rounded-sm transition-all flex items-center gap-1.5 ${viewMode === mode
                      ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-sm font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      {mode === 'editor' && <path d="M2 2h12v12H2zm1 1v10h10V3z" />}
                      {mode === 'split' && <path d="M2 2h12v12H2zm1 1v10h4V3zm5 0v10h4V3z" />}
                      {mode === 'preview' && <path d="M2 2h12v12H2zm1 1v10h10V3zm2 2h6v1H5zm0 2h6v1H5zm0 2h4v1H5z" />}
                    </svg>
                    <span>{{ editor: '编辑器', split: '双栏', preview: '预览' }[mode]}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 搜索 */}
            <div className={groupClass}>
              <button
                onClick={onSearchClick}
                className={`${btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
                title="搜索 (Ctrl+F)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[10px] scale-90">搜索</span>
              </button>
            </div>
            
            {/* 主题设置 */}
            <div className={groupClass}>
              <button
                onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                className={`${btnClass} flex-col gap-0.5 h-12 w-12 !px-1`}
                title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
                <span className="text-[10px] scale-90">{theme === 'dark' ? '浅色' : '深色'}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="flex items-center h-full animate-slide-in-left">
            {/* 样式选择 */}
            <div className={groupClass}>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-md">
                {(['body', 'h1', 'h2', 'h3', 'code', 'quote'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setActiveStyle(s)}
                    className={`px-2 py-1 text-xs rounded-sm transition-all ${activeStyle === s
                      ? 'bg-white dark:bg-dark-surface text-brand-600 dark:text-brand-400 shadow-sm font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    {{ body: '正文', h1: 'H1', h2: 'H2', h3: 'H3', code: '代码', quote: '引用' }[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* 字体设置 */}
            <div className={groupClass}>
              <div className="flex flex-col gap-0.5">
                <Select
                  className="w-32"
                  value={currentStyle.fontFamily || ''}
                  onChange={(val) => updateStyle({ fontFamily: val })}
                  placeholder="字体"
                  options={[
                    { label: '默认字体', value: '' },
                    ...FONTS_CN.concat(FONTS_EN).map(f => ({ label: FONT_LABELS[f] || f, value: f }))
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
            <div className={groupClass}>
              <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800/50 p-0.5 rounded border border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => updateStyle({ bold: !currentStyle.bold })}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${currentStyle.bold ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="加粗"
                >
                  <span className="font-bold text-sm">B</span>
                </button>
                <button
                  onClick={() => updateStyle({ italic: !currentStyle.italic })}
                  className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${currentStyle.italic ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  title="斜体"
                >
                  <span className="italic text-sm font-serif">I</span>
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>
                
                {/* Color Picker */}
                <div className="relative" ref={colorPickerRef}>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-7 h-7 rounded flex flex-col items-center justify-center gap-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="字体颜色"
                  >
                    <span className="text-sm font-serif font-bold leading-none text-gray-700 dark:text-gray-300">A</span>
                    <div className="w-4 h-1 rounded-sm border border-gray-200 dark:border-gray-600" style={{ backgroundColor: currentStyle.color || '#000000' }}></div>
                  </button>
                  {showColorPicker && (
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
                  )}
                </div>

                {/* Background Color Picker */}
                <div className="relative" ref={bgColorPickerRef}>
                  <button
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="背景颜色"
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <Palette className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                      <div className="w-4 h-1 rounded-sm border border-gray-200 dark:border-gray-600" style={{ backgroundColor: currentStyle.backgroundColor || 'transparent' }}></div>
                    </div>
                  </button>
                  {showBgColorPicker && (
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
                          <span>其它颜色...</span>
                        </label>
                        <button
                          onClick={() => { updateStyle({ backgroundColor: undefined }); setShowBgColorPicker(false); }}
                          className="text-xs text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50"
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
            <div className={groupClass}>
              <div className="flex items-center gap-0.5 bg-gray-50 dark:bg-gray-800/50 p-0.5 rounded border border-gray-100 dark:border-gray-700">
                {(['left', 'center', 'right', 'justify'] as const).map(align => (
                  <button
                    key={align}
                    onClick={() => updateStyle({ alignment: align })}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${currentStyle.alignment === align ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
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
        )}

        {activeTab === 'layout' && (
          <div className="flex items-center h-full animate-slide-in-left">
            {/* Page Setup */}
            <div className={groupClass}>
              <div className="flex flex-col gap-0.5">
                <span className={labelClass}>页边距</span>
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
            <div className={groupClass}>
              <div className="flex flex-col gap-0.5">
                <span className={labelClass}>英文/数字字体</span>
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
            <div className={groupClass}>
              <div className="flex flex-col gap-0.5">
                <span className={labelClass}>分割线</span>
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
            <div className={groupClass}>
              <div className="flex gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className={labelClass}>行距</span>
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
                  <span className={labelClass}>首行缩进</span>
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
                  <span className={labelClass}>段前</span>
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
                  <span className={labelClass}>段后</span>
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
        )}

        {activeTab === 'ai' && (
          <div className="flex items-center h-full animate-slide-in-left w-full pr-2 gap-2">
            {/* Model Selector & Config */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAIConfig(true)}
                className="group flex items-center gap-2 h-8 px-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform"></div>
                <span className="text-xs font-medium">
                  {(() => {
                    if (!selectedModel) return '选择模型';
                    const provider = aiProviders.find(p => p.id === selectedModel.providerId);
                    const model = provider?.models.find(m => m.id === selectedModel.modelId);
                    return provider && model ? `${provider.name}: ${model.name}` : '选择模型';
                  })()}
                </span>
              </button>
              
              <button 
                onClick={() => setShowAIConfig(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Input */}
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <input
                  type="text"
                  className="w-full h-9 pl-4 pr-10 text-xs rounded-full border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:bg-white dark:focus:bg-dark-surface focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
                  placeholder="描述你想要的文档样式：行距1.5倍，首行缩进2字符"
                />
              </div>
            </div>

            {/* Generate Action */}
            <button
              className="h-8 px-4 bg-brand-500 hover:bg-brand-600 text-white text-xs rounded-full font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              生成样式
            </button>
          </div>
        )}
      </div>
      
      <AIConfigModal 
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
        providers={aiProviders}
        onUpdateProviders={setAiProviders}
        currentModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
    </div>
  );
};

export default Header;

import React, { useRef, useState } from 'react';
import { HeaderProps } from '../types';
import { ElementStyle } from '../interfaces/Config';

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

const Header: React.FC<HeaderProps> = ({ isExporting, onExport, onImport, viewMode, onViewModeChange, cfg, onCfgChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'layout'>('home');
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

  const selectClass = "h-7 px-2 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";
  const btnClass = "h-7 px-2 flex items-center justify-center border border-transparent rounded hover:bg-gray-100 active:bg-gray-200 transition-colors";
  const btnActiveClass = "bg-brand-100 text-brand-700 border-brand-300";

  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const menuItemClass = "w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center space-x-2";

  return (
    <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200">
      {/* Menu Bar */}
      <div className="h-7 bg-white border-b border-gray-100 flex items-center px-1 text-xs relative">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md,.txt,.markdown" className="hidden" />

        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
            className={`px-3 py-1 rounded hover:bg-gray-100 ${openMenu === 'file' ? 'bg-gray-100' : ''}`}
          >
            文件
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-0.5 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <button onClick={() => { fileInputRef.current?.click(); setOpenMenu(null); }} className={menuItemClass}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>导入 Markdown</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => { onExport(); setOpenMenu(null); }}
                disabled={isExporting}
                className={`${menuItemClass} ${isExporting ? 'text-gray-400' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                <span>{isExporting ? '导出中...' : '导出为 Word'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
            className={`px-3 py-1 rounded hover:bg-gray-100 ${openMenu === 'edit' ? 'bg-gray-100' : ''}`}
          >
            视图
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-full left-0 mt-0.5 w-36 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              {(['editor', 'split', 'preview'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { onViewModeChange(mode); setOpenMenu(null); }}
                  className={`${menuItemClass} ${viewMode === mode ? 'bg-brand-50 text-brand-700' : ''}`}
                >
                  {viewMode === mode && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  )}
                  {viewMode !== mode && <span className="w-4"></span>}
                  <span>{{ editor: '仅编辑器', split: '双栏视图', preview: '仅预览' }[mode]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Click outside to close menu */}
        {openMenu && (
          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)}></div>
        )}

        {/* Separator */}
        <div className="h-4 w-px bg-gray-200 mx-1"></div>

        {/* Ribbon Tabs - inline */}
        {(['home', 'layout'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeTab === tab
              ? 'bg-brand-50 text-brand-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            {{ home: '开始', layout: '布局' }[tab]}
          </button>
        ))}
      </div>

      {/* Ribbon Content - Compact Layout */}
      <div className="h-14 bg-gray-50 flex items-center px-2 py-1 gap-2 flex-nowrap">

        {activeTab === 'home' && (
          <>
            {/* Style Selector */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              {(['body', 'h1', 'h2', 'h3', 'code', 'quote'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStyle(s)}
                  className={`px-1.5 py-0.5 text-[11px] rounded transition-colors ${activeStyle === s
                    ? 'bg-brand-100 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {{ body: '正文', h1: 'H1', h2: 'H2', h3: 'H3', code: '代码', quote: '引用' }[s]}
                </button>
              ))}
            </div>

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
                className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5 flex items-center justify-center hover:border-gray-400"
                title="字体颜色"
              >
                <div className="w-full h-full rounded-sm" style={{ backgroundColor: currentStyle.color }}></div>
              </button>
              {showColorPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-56">
                    <div className="text-[10px] text-gray-500 mb-1">主题颜色</div>
                    <div className="space-y-0.5">
                      {THEME_COLORS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-0.5">
                          {row.map((color) => (
                            <button
                              key={color}
                              onClick={() => { updateStyle({ color }); setShowColorPicker(false); }}
                              className="w-5 h-5 rounded-sm border border-gray-200 hover:border-gray-400 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 mb-1">标准色</div>
                    <div className="flex gap-0.5">
                      {STANDARD_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => { updateStyle({ color }); setShowColorPicker(false); }}
                          className="w-5 h-5 rounded-sm border border-gray-200 hover:border-gray-400 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900">
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
                className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5 flex items-center justify-center hover:border-gray-400"
                title="背景颜色"
              >
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  {currentStyle.backgroundColor ? (
                    <div className="w-4 h-4 rounded-sm shadow-sm" style={{ backgroundColor: currentStyle.backgroundColor }}></div>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  )}
                </div>
              </button>
              {showBgColorPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBgColorPicker(false)}></div>
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 w-56">
                    <div className="text-[10px] text-gray-500 mb-1">背景颜色</div>
                    {/* Theme Colors - same as text but for background */}
                    <div className="space-y-0.5">
                      {THEME_COLORS.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-0.5">
                          {row.map((color) => (
                            <button
                              key={color}
                              onClick={() => { updateStyle({ backgroundColor: color }); setShowBgColorPicker(false); }}
                              className="w-5 h-5 rounded-sm border border-gray-200 hover:border-gray-400 hover:scale-110 transition-transform"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 mt-2 pt-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900">
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
                        无填充
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  {align === 'left' && <path d="M2 3h12v1H2zm0 3h8v1H2zm0 3h10v1H2zm0 3h6v1H2z" />}
                  {align === 'center' && <path d="M2 3h12v1H2zm2 3h8v1H4zm1 3h6v1H5zm2 3h2v1H7z" />}
                  {align === 'right' && <path d="M2 3h12v1H2zm4 3h8v1H6zm2 3h6v1H8zm4 3h2v1h-2z" />}
                  {align === 'justify' && <path d="M2 3h12v1H2zm0 3h12v1H2zm0 3h12v1H2zm0 3h12v1H2z" />}
                </svg>
              </button>
            ))}
          </>
        )}

        {activeTab === 'layout' && (
          <>
            {/* Page Margin */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <span className="text-[10px] text-gray-500">页边距</span>
              <input
                type="number"
                step="0.1"
                className={`${selectClass} w-14`}
                value={cfg.global.pageMargin}
                onChange={(e) => onCfgChange({ ...cfg, global: { ...cfg.global, pageMargin: Number(e.target.value) } })}
              />
              <span className="text-[10px] text-gray-500">英寸</span>
            </div>

            {/* English/Number Font Setting */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <span className="text-[10px] text-gray-500">英文/数字字体</span>
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
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
              <span className="text-[10px] text-gray-500">行距</span>
              <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden h-7">
                <input
                  type="number"
                  step="0.1"
                  className="w-12 text-xs border-0 p-1 text-center focus:ring-0 outline-none h-full"
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
                  className="text-[10px] border-l border-gray-200 bg-gray-50 h-full px-1 focus:outline-none cursor-pointer hover:bg-gray-100"
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
              <span className="text-[10px] text-gray-500">首行缩进</span>
              <select
                className={`${selectClass} w-16`}
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
              <span className="text-[10px] text-gray-500">段前</span>
              <select
                className={`${selectClass} w-14`}
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
              <span className="text-[10px] text-gray-500">段后</span>
              <select
                className={`${selectClass} w-14`}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Header;

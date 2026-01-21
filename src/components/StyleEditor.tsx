import React from 'react';
import { ElementStyle } from '../interfaces/Config';

interface Props {
  label: string;
  value: ElementStyle;
  onChange: (next: ElementStyle) => void;
}

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
const ALIGN = ['left', 'center', 'right', 'justify'] as const;

// Word 风格字号：中文字号名称 -> pt 值
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

// 数字磅值
const FONT_SIZES_PT = [5, 5.5, 6.5, 7.5, 8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

export default function StyleEditor({ label, value, onChange }: Props) {
  const set = (patch: Partial<ElementStyle>) => onChange({ ...value, ...patch });

  const inputClassName = "w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow bg-gray-50 focus:bg-white";
  const labelClassName = "text-xs font-medium text-gray-500 mb-1.5";

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-gray-800 text-sm">{label}</div>
        <div className="h-px bg-gray-100 flex-1 ml-4"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

        {/* Color Picker - Text */}
        <div className="flex flex-col">
          <span className={labelClassName}>字体颜色</span>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value.color}
              onChange={(e) => set({ color: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer border-0 p-0 overflow-hidden"
            />
            <span className="text-xs text-gray-400 font-mono">{value.color}</span>
          </div>
        </div>

        {/* Color Picker - Background */}
        <div className="flex flex-col">
          <span className={labelClassName}>背景颜色</span>
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center">
              <input
                type="color"
                value={value.backgroundColor || '#ffffff'}
                onChange={(e) => set({ backgroundColor: e.target.value })}
                className="h-8 w-8 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
              {/* Clear Button */}
              {value.backgroundColor && (
                <button
                  onClick={() => set({ backgroundColor: undefined })}
                  className="absolute -right-2 -top-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-600 hover:bg-red-100 hover:text-red-500"
                  title="清除背景色"
                >×</button>
              )}
            </div>
            <span className="text-xs text-gray-400 font-mono">{value.backgroundColor || '无'}</span>
          </div>
        </div>

        {/* Font Size - Word Style Dropdown */}
        <div className="flex flex-col">
          <span className={labelClassName}>字号</span>
          <select
            className={inputClassName}
            value={value.fontSize}
            onChange={(e) => set({ fontSize: Number(e.target.value) })}
          >
            <optgroup label="中文字号">
              {FONT_SIZES.map(fs => (
                <option key={fs.label} value={fs.value}>
                  {fs.label} ({fs.value}pt)
                </option>
              ))}
            </optgroup>
            <optgroup label="磅值">
              {FONT_SIZES_PT.map(pt => (
                <option key={pt} value={pt}>
                  {pt} pt
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Font Style Checkboxes */}
        <div className="flex flex-col justify-end pb-2">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={value.bold}
                onChange={(e) => set({ bold: e.target.checked })}
                className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 group-hover:border-brand-400"
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">加粗</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={value.italic}
                onChange={(e) => set({ italic: e.target.checked })}
                className="rounded text-brand-500 focus:ring-brand-500 border-gray-300 group-hover:border-brand-400"
              />
              <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors">斜体</span>
            </label>
          </div>
        </div>

        {/* Line Spacing */}
        <div className="flex flex-col">
          <span className={labelClassName}>行距</span>
          <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden h-8 sm:h-[34px]">
            <input
              type="number"
              step="0.1"
              className="w-full text-xs sm:text-sm border-0 p-1.5 focus:ring-0 outline-none h-full"
              value={(() => {
                const val = value.lineSpacing;
                if (typeof val === 'string' && val.endsWith('pt')) {
                  return parseFloat(val);
                }
                return val;
              })()}
              onChange={(e) => {
                const num = parseFloat(e.target.value);
                if (isNaN(num)) return;

                const isPt = typeof value.lineSpacing === 'string' && value.lineSpacing.endsWith('pt');
                set({ lineSpacing: isPt ? `${num}pt` : num });
              }}
            />
            <select
              className="text-xs border-l border-gray-200 bg-gray-50 h-full px-1 focus:outline-none cursor-pointer hover:bg-gray-100 text-gray-600"
              value={typeof value.lineSpacing === 'string' && value.lineSpacing.endsWith('pt') ? 'pt' : 'times'}
              onChange={(e) => {
                const newUnit = e.target.value;
                let currentVal = value.lineSpacing;
                let numVal = 1.5;

                if (typeof currentVal === 'number') {
                  numVal = currentVal;
                } else if (typeof currentVal === 'string' && currentVal.endsWith('pt')) {
                  numVal = parseFloat(currentVal);
                }

                if (newUnit === 'pt') {
                  if (numVal < 5) numVal = 20;
                  set({ lineSpacing: `${numVal}pt` });
                } else {
                  if (numVal > 5) numVal = 1.5;
                  set({ lineSpacing: numVal });
                }
              }}
            >
              <option value="times">倍</option>
              <option value="pt">pt</option>
            </select>
          </div>
        </div>

        {/* Spacing Before */}
        <div className="flex flex-col">
          <span className={labelClassName}>段前 (pt)</span>
          <input type="number" className={inputClassName} value={value.spaceBefore} onChange={(e) => set({ spaceBefore: Number(e.target.value) })} />
        </div>

        {/* Spacing After */}
        <div className="flex flex-col">
          <span className={labelClassName}>段后 (pt)</span>
          <input type="number" className={inputClassName} value={value.spaceAfter} onChange={(e) => set({ spaceAfter: Number(e.target.value) })} />
        </div>

        {/* Alignment */}
        <div className="flex flex-col">
          <span className={labelClassName}>对齐方式</span>
          <select className={inputClassName} value={value.alignment} onChange={(e) => set({ alignment: e.target.value as ElementStyle['alignment'] })}>
            {ALIGN.map(a => <option key={a} value={a}>{{ left: '左对齐', center: '居中', right: '右对齐', justify: '两端对齐' }[a]}</option>)}
          </select>
        </div>

        {/* Indent */}
        <div className="flex flex-col">
          <span className={labelClassName}>首行缩进 (字符)</span>
          <input type="number" className={inputClassName} value={value.firstLineIndent} onChange={(e) => set({ firstLineIndent: Number(e.target.value) })} />
        </div>

        {/* Font Family */}
        <div className="flex flex-col col-span-2 sm:col-span-1">
          <span className={labelClassName}>特定字体</span>
          <select className={inputClassName} value={value.fontFamily || ''} onChange={(e) => set({ fontFamily: e.target.value })}>
            <option value="">(默认)</option>
            <optgroup label="中文字体">
              {FONTS_CN.map(f => <option key={f} value={f}>{FONT_LABELS[f] || f}</option>)}
            </optgroup>
            <optgroup label="英文字体">
              {FONTS_EN.map(f => <option key={f} value={f}>{FONT_LABELS[f] || f}</option>)}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  );
}

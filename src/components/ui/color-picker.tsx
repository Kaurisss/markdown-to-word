import React, { useState, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ColorPickerLine, TransferLine } from '@mingcute/react';

interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Color conversion utilities for format display
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#000000');
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}

function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ color, onChange }) => {
  const [rgb, setRgb] = useState(() => hexToRgb(color));
  const [format, setFormat] = useState<'RGB' | 'HEX' | 'HSL'>('RGB');

  // Sync RGB from external color prop (e.g., swatch selection, eyedropper)
  useEffect(() => {
    setRgb(hexToRgb(color));
  }, [color]);

  // react-colorful emits lowercase hex; normalize to uppercase for output consistency
  const handlePickerChange = useCallback((newColor: string) => {
    onChange(newColor.toUpperCase());
  }, [onChange]);

  const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', value: string) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(255, num));

    const newRgb = { ...rgb, [channel]: num };
    setRgb(newRgb);
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [rgb, onChange]);

  const handleEyeDropper = useCallback(async () => {
    if (!('EyeDropper' in window)) return;
    try {
      // @ts-expect-error - EyeDropper API is not yet in all TS types
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      onChange(result.sRGBHex.toUpperCase());
    } catch {
      // User canceled the eyedropper
    }
  }, [onChange]);

  const handleHexChange = useCallback((value: string) => {
    let hex = value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;

    if (/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
      setRgb(hexToRgb(hex));
      onChange(hex.toUpperCase());
    }
  }, [onChange]);

  const cycleFormat = useCallback(() => {
    setFormat(f => (f === 'RGB' ? 'HEX' : f === 'HEX' ? 'HSL' : 'RGB'));
  }, []);

  const supportsEyeDropper = 'EyeDropper' in window;
  const hsl = format === 'HSL' ? hexToHsl(color) : null;

  return (
    <div className="w-full flex flex-col gap-3 p-1 mt-2">
      {/* Color picker: saturation plane + hue slider */}
      <HexColorPicker
        color={color}
        onChange={handlePickerChange}
        style={{ width: '100%', height: '200px' }}
      />

      {/* Tools row: eyedropper + color preview */}
      <div className="flex items-center gap-3">
        {supportsEyeDropper && (
          <button
            type="button"
            onClick={handleEyeDropper}
            className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-element transition-colors"
            title="吸取颜色"
          >
            <ColorPickerLine className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}

        <div
          className="w-6 h-6 rounded-full flex-shrink-0 border border-black/10 shadow-sm"
          style={{ backgroundColor: color || '#FFFFFF' }}
        />
      </div>

      {/* Format inputs */}
      <div className="flex items-center gap-2">
        {format === 'RGB' && (
          <>
            <div className="flex flex-col items-center flex-1">
              <input
                type="number"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 hide-spin-button"
                min="0" max="255"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">R</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <input
                type="number"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 hide-spin-button"
                min="0" max="255"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">G</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <input
                type="number"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 hide-spin-button"
                min="0" max="255"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">B</span>
            </div>
          </>
        )}

        {format === 'HEX' && (
          <div className="flex flex-col items-center flex-1">
            <input
              type="text"
              value={color.toUpperCase()}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 uppercase"
              maxLength={7}
            />
            <span className="text-[10px] text-gray-500 mt-0.5 font-medium">HEX</span>
          </div>
        )}

        {format === 'HSL' && hsl && (
          <>
            <div className="flex flex-col items-center flex-1">
              <input
                type="number"
                value={hsl.h}
                readOnly
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 cursor-default opacity-80 hide-spin-button"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">H</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <input
                type="number"
                value={hsl.s}
                readOnly
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 cursor-default opacity-80 hide-spin-button"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">S</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <input
                type="number"
                value={hsl.l}
                readOnly
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 cursor-default opacity-80 hide-spin-button"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">L</span>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={cycleFormat}
          className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-dark-element transition-colors mb-4"
          title="切换颜色格式"
        >
          <TransferLine className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

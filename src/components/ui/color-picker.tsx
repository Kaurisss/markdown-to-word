import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ColorPickerLine, SortAscendingLine, TransferLine } from '@mingcute/react';

interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Color conversion utilities
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

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number) {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ color, onChange }) => {
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [format, setFormat] = useState<'RGB' | 'HEX' | 'HSL'>('RGB');
  
  const svRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  
  const isDraggingSV = useRef(false);
  const isDraggingH = useRef(false);

  // Sync from props
  useEffect(() => {
    if (isDraggingSV.current || isDraggingH.current) return;
    const newRgb = hexToRgb(color);
    setRgb(newRgb);
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
  }, [color]);

  const handleSVMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    const s = (x / rect.width) * 100;
    const v = (1 - y / rect.height) * 100;
    
    setHsv(prev => {
      const newHsv = { ...prev, s, v };
      const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      return newHsv;
    });
  }, [onChange]);

  const handleHMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!hRef.current) return;
    const rect = hRef.current.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const h = (x / rect.width) * 360;
    
    setHsv(prev => {
      const newHsv = { ...prev, h };
      const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      return newHsv;
    });
  }, [onChange]);

  // Mouse event listeners for dragging
  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingSV.current = false;
      isDraggingH.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSV.current) handleSVMove(e);
      if (isDraggingH.current) handleHMove(e);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleSVMove, handleHMove]);

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(255, num));
    
    const newRgb = { ...rgb, [channel]: num };
    setRgb(newRgb);
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) return;
    try {
      // @ts-ignore - EyeDropper API is not yet in all TS types
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const hex = result.sRGBHex;
      const newRgb = hexToRgb(hex);
      setRgb(newRgb);
      setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
      onChange(hex);
    } catch (e) {
      // User canceled the eyedropper
    }
  };

  const handleHexChange = (value: string) => {
    let hex = value.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    
    // Only update if it's a valid hex length (4 or 7 with hash)
    if (/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
      const newRgb = hexToRgb(hex);
      setRgb(newRgb);
      setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
      onChange(hex.toUpperCase());
    }
  };

  const cycleFormat = () => {
    if (format === 'RGB') setFormat('HEX');
    else if (format === 'HEX') setFormat('HSL');
    else setFormat('RGB');
  };

  const supportsEyeDropper = 'EyeDropper' in window;

  return (
    <div className="w-full flex flex-col gap-3 p-1 mt-2">
      {/* SV Map */}
      <div 
        ref={svRef}
        className="w-full h-32 cursor-crosshair relative overflow-hidden ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
        onMouseDown={(e) => {
          isDraggingSV.current = true;
          handleSVMove(e);
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0) 100%)' }} />
        {/* Dragger */}
        <div 
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm -ml-1.5 -mt-1.5 pointer-events-none"
          style={{ 
            left: `${hsv.s}%`, 
            top: `${100 - hsv.v}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
          }}
        />
      </div>

      {/* Tools Row */}
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
        
        {/* Hue Slider */}
        <div 
          ref={hRef}
          className="flex-1 h-3 rounded-full relative cursor-pointer ring-1 ring-inset ring-black/10"
          style={{
            background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
          }}
          onMouseDown={(e) => {
            isDraggingH.current = true;
            handleHMove(e);
          }}
        >
          {/* Hue Dragger */}
          <div 
            className="absolute w-4 h-4 bg-white border border-gray-300 rounded-full shadow-sm -mt-0.5 -ml-2 pointer-events-none"
            style={{ left: `${(hsv.h / 360) * 100}%` }}
          />
        </div>
      </div>

      {/* Format Inputs */}
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
        
        {format === 'HSL' && (
          <>
            <div className="flex flex-col items-center flex-1">
              <input 
                type="number" 
                value={Math.round(hsv.h)} 
                readOnly
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 cursor-default opacity-80 hide-spin-button"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">H</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <input 
                type="number" 
                value={Math.round(hsv.s)} 
                readOnly
                className="w-full text-center border border-gray-200 dark:border-dark-border rounded py-0.5 text-xs bg-transparent dark:text-gray-200 focus:outline-none focus:border-brand-500 cursor-default opacity-80 hide-spin-button"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">S</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <input 
                type="number" 
                value={Math.round(hsv.v)} 
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

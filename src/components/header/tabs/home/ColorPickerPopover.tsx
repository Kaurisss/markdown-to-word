import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { THEME_COLORS, STANDARD_COLORS } from '../../constants';

interface ColorPickerPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentValue: string;
  onColorSelect: (color: string) => void;
  showReset?: boolean;
  resetLabel?: string;
  children: React.ReactNode;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  open,
  onOpenChange,
  title,
  currentValue,
  onColorSelect,
  showReset = false,
  resetLabel = '无颜色',
  children,
}) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverTrigger asChild>
      {children}
    </PopoverTrigger>
    <PopoverContent align="start" sideOffset={6} className="w-56 p-2 z-[10000]">
      <div className="text-[12px] font-medium text-ui-text-subtle mb-1">{title}</div>
      <div className="space-y-0.5">
        {THEME_COLORS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5">
            {row.map((color) => (
              <button
                key={color}
                onClick={() => { onColorSelect(color); onOpenChange(false); }}
                className="w-5 h-5 rounded-sm border border-ui-border-subtle hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        ))}
      </div>
      {!showReset && (
        <>
          <div className="text-[12px] font-medium text-ui-text-subtle mt-2 mb-1">标准色</div>
          <div className="flex gap-0.5">
            {STANDARD_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => { onColorSelect(color); onOpenChange(false); }}
                className="w-5 h-5 rounded-sm border border-ui-border-subtle hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </>
      )}
      <div className="border-t border-gray-200 dark:border-dark-border mt-2 pt-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
          <input
            type="color"
            value={currentValue}
            onChange={(e) => { onColorSelect(e.target.value); }}
            className="w-5 h-5 rounded border-0 p-0 cursor-pointer"
          />
          <span>{showReset ? '其它颜色...' : '其他颜色...'}</span>
        </label>
        {showReset && (
          <button
            onClick={() => { onColorSelect(''); onOpenChange(false); }}
            className="text-[14px] text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </PopoverContent>
  </Popover>
);

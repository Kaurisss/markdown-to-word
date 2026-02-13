import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  fontFamily?: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  className?: string;
  triggerClassName?: string;
  optionClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className = "",
  triggerClassName = "",
  optionClassName = "",
  placeholder = "请选择",
  disabled = false,
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const selectedFontStyle = selectedOption?.fontFamily ? { fontFamily: `"${selectedOption.fontFamily}"` } : undefined;

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsRendered(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getVariantClasses = () => {
    if (variant === 'ghost') {
      return `
        bg-transparent
        hover:bg-gray-100 dark:hover:bg-dark-element-hover
        ${isOpen ? 'bg-gray-100 dark:bg-dark-element-hover' : ''}
      `;
    }
    return `
      bg-white dark:bg-dark-element 
      border border-gray-300 dark:border-dark-border rounded 
      hover:border-gray-400 dark:hover:border-gray-500
      ${isOpen ? 'border-brand-500 ring-1 ring-brand-500' : ''}
    `;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full h-7 px-2 text-[13px] 
          transition-colors duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
            : 'cursor-pointer'
          }
          ${getVariantClasses()}
          ${triggerClassName}
        `}
        disabled={disabled}
      >
        <span
          className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
          style={selectedFontStyle}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isRendered && (
        <div 
          className={`absolute left-0 top-full mt-1 w-full min-w-[120px] max-h-60 overflow-auto bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded shadow-lg z-50 custom-scrollbar ${isOpen ? 'animate-menu-in' : 'animate-menu-out'}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between
                  transition-colors
                  ${option.value === value
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${optionClassName}
                `}
              >
                <span
                  className="truncate"
                  style={option.fontFamily ? { fontFamily: `"${option.fontFamily}"` } : undefined}
                >
                  {option.label}
                </span>
                {option.value === value && (
                  <Check className="w-3.5 h-3.5 ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

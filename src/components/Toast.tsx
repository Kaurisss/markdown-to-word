import React, { useEffect } from 'react';
import { CheckCircleLine, CloseCircleLine, InformationLine, CloseLine } from '@mingcute/react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircleLine className="w-5 h-5 text-green-500" />,
    error: <CloseCircleLine className="w-5 h-5 text-red-500" />,
    info: <InformationLine className="w-5 h-5 text-blue-500" />
  };

  const colors = {
    success: 'border-green-100 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-300',
    error: 'border-red-100 bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-300',
    info: 'border-blue-100 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300'
  };

  return (
    <div className="fixed top-20 right-4 z-[9999] animate-in fade-in slide-in-from-right-4 duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${colors[type]}`}>
        {icons[type]}
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <CloseLine className="w-4 h-4 opacity-50 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

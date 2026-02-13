import React from 'react';
import { Settings, SquarePen, Columns2, Eye } from 'lucide-react';
import { ViewMode } from '../../types';

interface ViewModeDockProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenSettings: () => void;
}

export const ViewModeDock: React.FC<ViewModeDockProps> = ({
  viewMode,
  onViewModeChange,
  onOpenSettings
}) => {
  const btnClass = 'w-8 h-8 grid place-items-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border transition-colors';
  const activeClass = 'bg-gray-100 dark:bg-dark-element';

  return (
    <div className="flex items-center gap-0.5 px-1" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onViewModeChange('editor')}
        className={`${btnClass} ${viewMode === 'editor' ? activeClass : ''}`}
        aria-label="编辑器视图"
        title="编辑器视图"
      >
        <SquarePen className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('split')}
        className={`${btnClass} ${viewMode === 'split' ? activeClass : ''}`}
        aria-label="双栏视图"
        title="双栏视图"
      >
        <Columns2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('preview')}
        className={`${btnClass} ${viewMode === 'preview' ? activeClass : ''}`}
        aria-label="预览视图"
        title="预览视图"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onOpenSettings}
        className={btnClass}
        aria-label="设置"
        title="设置"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};

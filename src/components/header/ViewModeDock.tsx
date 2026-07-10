import React from 'react';
import { EditLine, Columns2Line, Eye2Line, Settings3Line } from '@mingcute/react';
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
  const btnClass = 'w-8 h-8 flex items-center justify-center rounded-md text-ui-text-muted hover:bg-ui-control-hover transition-colors';
  const activeClass = 'bg-ui-control-active text-ui-text';

  return (
    <div
      className="flex h-full items-center gap-0.5 px-1"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onViewModeChange('editor')}
        className={`${btnClass} ${viewMode === 'editor' ? activeClass : ''}`}
        aria-label="编辑器视图"
        title="编辑器视图"
      >
        <EditLine className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('split')}
        className={`${btnClass} ${viewMode === 'split' ? activeClass : ''}`}
        aria-label="双栏视图"
        title="双栏视图"
      >
        <Columns2Line className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('preview')}
        className={`${btnClass} ${viewMode === 'preview' ? activeClass : ''}`}
        aria-label="预览视图"
        title="预览视图"
      >
        <Eye2Line className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onOpenSettings}
        className={btnClass}
        aria-label="设置"
        title="设置"
      >
        <Settings3Line className="w-4 h-4" />
      </button>
    </div>
  );
};

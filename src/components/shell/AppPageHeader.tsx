import React, { useCallback } from 'react';
import { Back2Line } from '@mingcute/react';
import { WindowControls } from '../header/WindowControls';

interface AppPageHeaderProps {
  title: string;
  onBack: () => void;
  isActive: boolean;
  actions?: React.ReactNode;
}

export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  title,
  onBack,
  isActive,
  actions,
}) => {
  const toggleMaximize = useCallback(async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
    } catch {
      // Ignore when running outside Tauri.
    }
  }, []);

  return (
    <header
      className="app-chrome h-10 shrink-0 flex items-stretch bg-ui-surface border-b border-ui-border text-ui-text select-none"
      data-tauri-drag-region
      onDoubleClick={() => void toggleMaximize()}
    >
      <button
        type="button"
        onClick={onBack}
        onMouseDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        className="w-10 h-10 grid place-items-center text-ui-text-muted hover:bg-ui-control-hover active:bg-ui-control-active transition-colors"
        aria-label="返回编辑器"
        title="返回编辑器"
      >
        <Back2Line className="w-4 h-4" />
      </button>

      <div className="flex items-center px-2 text-sm font-medium pointer-events-none">
        {title}
      </div>
      <div className="flex-1" data-tauri-drag-region />

      {actions && (
        <div
          className="flex h-full items-center px-1"
          onMouseDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      )}

      <div onDoubleClick={(event) => event.stopPropagation()}>
        <WindowControls enabled={isActive} />
      </div>
    </header>
  );
};

import React, { useCallback } from 'react';
import { Back2Line } from '@mingcute/react';
import { WindowControls } from '../header/WindowControls';
import { cn } from '@/lib/utils';

interface AppPageHeaderProps {
  title?: string;
  onBack?: () => void;
  isActive: boolean;
  actions?: React.ReactNode;
  showBack?: boolean;
  transparent?: boolean;
  leftContent?: React.ReactNode;
}

export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  title,
  onBack,
  isActive,
  actions,
  showBack = true,
  transparent = false,
  leftContent,
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
      className={cn(
        "app-chrome h-10 shrink-0 flex items-stretch text-ui-text select-none z-50",
        transparent ? "bg-transparent absolute top-0 left-0 right-0" : "bg-ui-surface border-b border-ui-border"
      )}
      data-tauri-drag-region
      onDoubleClick={() => void toggleMaximize()}
    >
      {leftContent ? (
        <div 
          className="flex h-full items-center px-3 pointer-events-auto"
          onMouseDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          {leftContent}
        </div>
      ) : showBack ? (
        <button
          type="button"
          onClick={onBack}
          onMouseDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          className="w-10 h-10 grid place-items-center text-ui-text-muted hover:bg-ui-control-hover active:bg-ui-control-active transition-colors pointer-events-auto"
          aria-label="返回"
          title="返回"
        >
          <Back2Line className="w-4 h-4" />
        </button>
      ) : null}

      {title && (
        <div className="flex items-center px-4 text-sm font-medium pointer-events-none">
          {title}
        </div>
      )}
      <div className="flex-1" data-tauri-drag-region />

      {actions && (
        <div
          className="flex h-full items-center px-1 pointer-events-auto"
          onMouseDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      )}

      <div className="pointer-events-auto" onDoubleClick={(event) => event.stopPropagation()}>
        <WindowControls enabled={isActive} />
      </div>
    </header>
  );
};

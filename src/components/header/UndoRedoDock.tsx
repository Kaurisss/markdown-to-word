import React from 'react';
import { Redo2, Undo2 } from 'lucide-react';

interface UndoRedoDockProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const UndoRedoDock: React.FC<UndoRedoDockProps> = ({ onUndo, onRedo, canUndo = false, canRedo = false }) => {
  const btnBaseClass = 'w-8 h-8 grid place-items-center rounded-md transition-colors';

  return (
    <div className="flex items-center gap-0.5 px-1.5 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={onUndo}
        className={`${btnBaseClass} ${
          canUndo
            ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="撤销"
        title="撤销"
        disabled={!onUndo || !canUndo}
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onRedo}
        className={`${btnBaseClass} ${
          canRedo
            ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-element active:bg-gray-200 dark:active:bg-dark-border'
            : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
        }`}
        aria-label="重做"
        title="重做"
        disabled={!onRedo || !canRedo}
      >
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
};

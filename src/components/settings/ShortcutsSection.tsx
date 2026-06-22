import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  KeyboardShortcutBinding,
  ShortcutActionId,
  SHORTCUT_ACTIONS,
  detectShortcutConflicts,
  formatShortcut,
  getShortcutFromKeyboardEvent,
} from '../../features/settings/keyboardShortcuts';
import { Kbd } from '../ui/kbd';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { motion } from 'framer-motion';
import { fadeScale, motionTransition } from '@/components/ui/motion';

interface ShortcutsSectionProps {
  settings: {
    keyboardShortcuts: Record<ShortcutActionId, KeyboardShortcutBinding>;
  };
  updateSettings: (patch: Record<string, unknown>) => void;
}

export const ShortcutsSection: React.FC<ShortcutsSectionProps> = ({ settings, updateSettings }) => {
  const [recordingActionId, setRecordingActionId] = useState<ShortcutActionId | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const shortcutConflicts = useMemo(
    () => detectShortcutConflicts(settings.keyboardShortcuts),
    [settings.keyboardShortcuts]
  );

  const conflictingActionIds = useMemo(() => {
    const ids = new Set<ShortcutActionId>();
    shortcutConflicts.forEach(conflict => conflict.actionIds.forEach(id => ids.add(id)));
    return ids;
  }, [shortcutConflicts]);

  const shortcutGroups = useMemo(() => {
    const groups: Array<{ group: string; actions: typeof SHORTCUT_ACTIONS }> = [];
    const map = new Map<string, typeof SHORTCUT_ACTIONS>();
    for (const action of SHORTCUT_ACTIONS) {
      const existing = map.get(action.group) ?? [];
      map.set(action.group, [...existing, action]);
    }
    for (const [group, actions] of map) {
      groups.push({ group, actions });
    }
    return groups;
  }, []);

  const updateShortcut = useCallback((actionId: ShortcutActionId, shortcut: KeyboardShortcutBinding) => {
    updateSettings({
      keyboardShortcuts: {
        ...settings.keyboardShortcuts,
        [actionId]: shortcut,
      },
    });
  }, [settings.keyboardShortcuts, updateSettings]);

  const resetShortcut = useCallback((actionId: ShortcutActionId) => {
    updateShortcut(actionId, DEFAULT_KEYBOARD_SHORTCUTS[actionId]);
  }, [updateShortcut]);

  const resetAllShortcuts = useCallback(() => {
    updateSettings({ keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS });
    setRecordingActionId(null);
  }, [updateSettings]);

  useEffect(() => {
    if (!recordingActionId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.key === 'Escape') {
        setRecordingActionId(null);
        return;
      }

      const shortcut = getShortcutFromKeyboardEvent(event);
      if (!shortcut) return;

      updateShortcut(recordingActionId, shortcut);
      setRecordingActionId(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingActionId, updateShortcut]);

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-dark-border dark:bg-dark-element">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">自定义快捷键</div>
            <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              默认采用 Word 常用键位。点击某个快捷键后按下新组合键，按 Esc 取消录制。
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="h-8 shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:hover:bg-dark-element-hover"
          >
            恢复默认
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['查找', 'Ctrl+F'],
            ['替换', 'Ctrl+H'],
            ['全选', 'Ctrl+A'],
            ['加粗', 'Ctrl+B'],
            ['斜体', 'Ctrl+I'],
            ['下划线', 'Ctrl+U'],
          ].map(([label, shortcut]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-dark-border"
            >
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <Kbd>{shortcut}</Kbd>
            </div>
          ))}
        </div>

        {shortcutConflicts.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
            存在重复快捷键：{shortcutConflicts.map(conflict => conflict.signature).join('、')}。重复时靠前的动作会先响应。
          </div>
        )}

        {shortcutGroups.map(({ group, actions }) => (
          <section key={group} className="space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{group}</div>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border">
              {actions.map(action => {
                const shortcut = settings.keyboardShortcuts[action.id];
                const isRecording = recordingActionId === action.id;
                const hasConflict = conflictingActionIds.has(action.id);

                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 px-3 py-2 last:border-b-0 dark:border-dark-border"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-gray-700 dark:text-gray-200">{action.label}</div>
                      <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{action.description}</div>
                      {hasConflict && (
                        <div className="mt-1 text-xs text-amber-600 dark:text-amber-300">此快捷键与其他动作重复</div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRecordingActionId(action.id)}
                        className={`h-8 rounded-lg border px-2 text-xs transition-colors ${
                          isRecording
                            ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                            : hasConflict
                              ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:hover:bg-dark-element-hover'
                        }`}
                      >
                        {isRecording ? (
                          <span>按下新快捷键</span>
                        ) : (
                          <Kbd>{formatShortcut(shortcut)}</Kbd>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetShortcut(action.id)}
                        className="h-8 rounded-lg px-2 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-dark-element-hover dark:hover:text-gray-300"
                      >
                        重置
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Reset Shortcuts Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="w-80 p-4 gap-0 bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border" showCloseButton={false}>
          <motion.div variants={fadeScale} initial="initial" animate="enter" exit="exit" transition={motionTransition}>
          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">恢复默认快捷键</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            确定要将所有快捷键恢复为默认设置吗？此操作不可撤销。
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-element-hover rounded transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                resetAllShortcuts();
                setShowResetConfirm(false);
              }}
              className="px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors"
            >
              确定
            </button>
          </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

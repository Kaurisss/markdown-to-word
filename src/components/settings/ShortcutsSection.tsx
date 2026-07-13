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
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Delete2Line } from '@mingcute/react';
import { SettingCard, SettingItem } from './SettingsLayout';


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
      <div className="space-y-6">
        {/* 说明提示框 */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50/50 p-4 dark:bg-dark-element/10">
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-100">自定义快捷键</div>
            <div className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              默认采用 Word 常用快捷键。点击对应动作的快捷键可进入录制模式，按下新组合键保存，按 <code className="px-1 py-0.5 bg-gray-100 dark:bg-dark-element rounded font-mono text-[10px]">Esc</code> 取消录制。
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            className="shrink-0 text-xs font-medium cursor-pointer"
          >
            恢复默认
          </Button>
        </div>

        {/* 默认内置快捷键 */}
        <div>
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">默认内置快捷键</div>
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-dark-border overflow-hidden text-xs">
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
                className="flex items-center justify-between p-3 px-4 hover:bg-gray-50/30 dark:hover:bg-dark-element/5 transition-colors"
              >
                <span className="text-gray-500 dark:text-gray-400 font-medium">{label}</span>
                <Kbd className="bg-gray-50 dark:bg-dark-element text-[10px]">{shortcut}</Kbd>
              </div>
            ))}
          </div>
        </div>

        {/* 冲突提示 */}
        {shortcutConflicts.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            存在冲突快捷键：<span className="font-semibold">{shortcutConflicts.map(conflict => conflict.signature).join('、')}</span>。冲突时列表靠前的操作将优先响应。
          </div>
        )}

        {/* 各分类快捷键 */}
        {shortcutGroups.map(({ group, actions }) => (
          <div key={group} className="space-y-3">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {group}
            </div>
            <SettingCard>
              {actions.map(action => {
                const shortcut = settings.keyboardShortcuts[action.id];
                const isRecording = recordingActionId === action.id;
                const hasConflict = conflictingActionIds.has(action.id);

                return (
                  <SettingItem
                    key={action.id}
                    title={action.label}
                    description={
                      <div>
                        <div className="text-gray-400 dark:text-gray-500 text-[11px] mt-0.5 leading-normal">{action.description}</div>
                        {hasConflict && (
                          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">此快捷键与其他动作发生冲突</div>
                        )}
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRecordingActionId(action.id)}
                        className={`h-8 rounded-lg border px-2.5 text-xs transition-colors cursor-pointer font-medium ${
                          isRecording
                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/20 dark:text-brand-300 ring-2 ring-brand-500/20'
                            : hasConflict
                              ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-gray-300 dark:hover:bg-dark-element-hover'
                        }`}
                      >
                        {isRecording ? (
                          <span className="animate-pulse">按下新快捷键</span>
                        ) : (
                          <Kbd>{formatShortcut(shortcut)}</Kbd>
                        )}
                      </button>
                      <button
                        type="button"
                        title="重置"
                        onClick={() => resetShortcut(action.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-dark-element-hover dark:hover:text-gray-300 transition-colors cursor-pointer"
                      >
                        <Delete2Line className="h-4 w-4" />
                      </button>
                    </div>
                  </SettingItem>
                );
              })}
            </SettingCard>
          </div>
        ))}
      </div>

      {/* Reset Shortcuts Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="w-80 p-4 gap-0" showCloseButton={false}>

          <DialogHeader className="mb-4">
            <DialogTitle className="text-sm font-semibold">恢复默认快捷键</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            确定要将所有快捷键恢复为默认设置吗？此操作不可撤销。
          </div>
          <DialogFooter className="mt-4 flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>
              取消
            </Button>
            <Button size="sm" onClick={() => {
              resetAllShortcuts();
              setShowResetConfirm(false);
            }}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

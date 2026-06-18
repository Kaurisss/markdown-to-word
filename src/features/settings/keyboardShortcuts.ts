export type ShortcutActionId =
  | 'selectAll'
  | 'find'
  | 'replace'
  | 'closeSearch'
  | 'searchCaseSensitive'
  | 'searchWholeWord'
  | 'searchRegex'
  | 'undo'
  | 'redo'
  | 'bold'
  | 'italic'
  | 'underline';

export interface KeyboardShortcutBinding {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

export type KeyboardShortcutMap = Record<ShortcutActionId, KeyboardShortcutBinding>;

export interface ShortcutActionMeta {
  id: ShortcutActionId;
  label: string;
  description: string;
  group: '编辑' | '查找' | '格式';
}

export interface ShortcutConflict {
  signature: string;
  actionIds: ShortcutActionId[];
}

export const SHORTCUT_ACTIONS: ShortcutActionMeta[] = [
  { id: 'selectAll', label: '全选编辑器内容', description: '焦点不在输入框时选中编辑器全文', group: '编辑' },
  { id: 'undo', label: '撤销', description: '撤销上一次内容修改', group: '编辑' },
  { id: 'redo', label: '重做', description: '恢复上一次撤销的内容', group: '编辑' },
  { id: 'find', label: '查找', description: '打开查找栏', group: '查找' },
  { id: 'replace', label: '替换', description: '打开查找栏并展开替换', group: '查找' },
  { id: 'closeSearch', label: '关闭查找', description: '关闭查找/替换栏', group: '查找' },
  { id: 'searchCaseSensitive', label: '区分大小写', description: '在查找栏打开时切换大小写匹配', group: '查找' },
  { id: 'searchWholeWord', label: '全词匹配', description: '在查找栏打开时切换全词匹配', group: '查找' },
  { id: 'searchRegex', label: '正则表达式', description: '在查找栏打开时切换正则模式', group: '查找' },
  { id: 'bold', label: '加粗', description: '对编辑器当前选中文本应用 Markdown 加粗', group: '格式' },
  { id: 'italic', label: '斜体', description: '对编辑器当前选中文本应用 Markdown 斜体', group: '格式' },
  { id: 'underline', label: '下划线', description: '对编辑器当前选中文本应用 HTML 下划线', group: '格式' },
];

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcutMap = {
  selectAll: { ctrl: true, alt: false, shift: false, meta: false, key: 'A' },
  undo: { ctrl: true, alt: false, shift: false, meta: false, key: 'Z' },
  redo: { ctrl: true, alt: false, shift: false, meta: false, key: 'Y' },
  find: { ctrl: true, alt: false, shift: false, meta: false, key: 'F' },
  replace: { ctrl: true, alt: false, shift: false, meta: false, key: 'H' },
  closeSearch: { ctrl: false, alt: false, shift: false, meta: false, key: 'Escape' },
  searchCaseSensitive: { ctrl: false, alt: true, shift: false, meta: false, key: 'C' },
  searchWholeWord: { ctrl: false, alt: true, shift: false, meta: false, key: 'W' },
  searchRegex: { ctrl: false, alt: true, shift: false, meta: false, key: 'R' },
  bold: { ctrl: true, alt: false, shift: false, meta: false, key: 'B' },
  italic: { ctrl: true, alt: false, shift: false, meta: false, key: 'I' },
  underline: { ctrl: true, alt: false, shift: false, meta: false, key: 'U' },
};

const KEY_LABELS: Record<string, string> = {
  Escape: 'Esc',
  ' ': 'Space',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
};

const IGNORED_RECORDING_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta']);

function normalizeKey(key: string) {
  if (key.length === 1) return key.toUpperCase();
  return key;
}

export function shortcutSignature(shortcut: KeyboardShortcutBinding) {
  return [
    shortcut.ctrl ? 'Ctrl' : '',
    shortcut.alt ? 'Alt' : '',
    shortcut.shift ? 'Shift' : '',
    shortcut.meta ? 'Meta' : '',
    normalizeKey(shortcut.key),
  ].filter(Boolean).join('+');
}

export function formatShortcut(shortcut: KeyboardShortcutBinding) {
  const key = KEY_LABELS[shortcut.key] ?? shortcut.key;
  return [
    shortcut.ctrl ? 'Ctrl' : '',
    shortcut.alt ? 'Alt' : '',
    shortcut.shift ? 'Shift' : '',
    shortcut.meta ? 'Meta' : '',
    key,
  ].filter(Boolean).join('+');
}

function isPrintableKey(key: string) {
  return key.length === 1 && !IGNORED_RECORDING_KEYS.has(key);
}

export function getShortcutFromKeyboardEvent(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>): KeyboardShortcutBinding | null {
  if (!event.key || IGNORED_RECORDING_KEYS.has(event.key)) return null;

  // Reject bare printable keys (no modifier) to prevent blocking normal text input
  if (isPrintableKey(event.key) && !event.ctrlKey && !event.altKey && !event.metaKey) {
    return null;
  }

  return {
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
    key: normalizeKey(event.key),
  };
}

export function isShortcutMatch(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>, shortcut: KeyboardShortcutBinding) {
  return (
    event.ctrlKey === shortcut.ctrl &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift &&
    event.metaKey === shortcut.meta &&
    normalizeKey(event.key) === normalizeKey(shortcut.key)
  );
}

export function isEditableShortcutTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable;
}

export function detectShortcutConflicts(shortcuts: KeyboardShortcutMap): ShortcutConflict[] {
  const grouped = new Map<string, ShortcutActionId[]>();

  for (const [actionId, shortcut] of Object.entries(shortcuts) as Array<[ShortcutActionId, KeyboardShortcutBinding]>) {
    const signature = shortcutSignature(shortcut);
    grouped.set(signature, [...(grouped.get(signature) ?? []), actionId]);
  }

  return Array.from(grouped.entries())
    .filter(([, actionIds]) => actionIds.length > 1)
    .map(([signature, actionIds]) => ({ signature, actionIds }));
}
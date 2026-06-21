// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  detectShortcutConflicts,
  formatShortcut,
  getShortcutFromKeyboardEvent,
  isShortcutMatch,
} from '@/features/settings/keyboardShortcuts';

function keyEvent(init: KeyboardEventInit) {
  return new KeyboardEvent('keydown', init);
}

describe('keyboardShortcuts', () => {
  it('formats Word-style default shortcuts', () => {
    expect(formatShortcut(DEFAULT_KEYBOARD_SHORTCUTS.find)).toBe('Ctrl+F');
    expect(formatShortcut(DEFAULT_KEYBOARD_SHORTCUTS.replace)).toBe('Ctrl+H');
    expect(formatShortcut(DEFAULT_KEYBOARD_SHORTCUTS.bold)).toBe('Ctrl+B');
    expect(formatShortcut(DEFAULT_KEYBOARD_SHORTCUTS.closeSearch)).toBe('Esc');
  });

  it('normalizes recorded key events', () => {
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: 'b', ctrlKey: true }))).toEqual({
      ctrl: true,
      alt: false,
      shift: false,
      meta: false,
      key: 'B',
    });
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: 'Escape' }))).toEqual({
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
      key: 'Escape',
    });
  });

  it('matches configured shortcuts against keyboard events', () => {
    expect(isShortcutMatch(keyEvent({ key: 'f', ctrlKey: true }), DEFAULT_KEYBOARD_SHORTCUTS.find)).toBe(true);
    expect(isShortcutMatch(keyEvent({ key: 'f' }), DEFAULT_KEYBOARD_SHORTCUTS.find)).toBe(false);
    expect(isShortcutMatch(keyEvent({ key: 'Escape' }), DEFAULT_KEYBOARD_SHORTCUTS.closeSearch)).toBe(true);
  });

  it('rejects bare printable keys without modifiers', () => {
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: 'm' }))).toBeNull();
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: 'a' }))).toBeNull();
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: ' ' }))).toBeNull();
    // But non-printable keys without modifiers are still accepted
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: 'Escape' }))).not.toBeNull();
    expect(getShortcutFromKeyboardEvent(keyEvent({ key: 'ArrowUp' }))).not.toBeNull();
  });

  it('detects duplicate bindings', () => {
    const conflicts = detectShortcutConflicts({
      ...DEFAULT_KEYBOARD_SHORTCUTS,
      replace: DEFAULT_KEYBOARD_SHORTCUTS.find,
    });

    expect(conflicts.find(item => item.actionIds.includes('find') && item.actionIds.includes('replace'))).toBeDefined();
  });
});

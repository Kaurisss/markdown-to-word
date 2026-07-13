import { z } from 'zod';
import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  ShortcutActionId,
} from './keyboardShortcuts';

export const keyboardShortcutBindingSchema = z.object({
  ctrl: z.boolean(),
  alt: z.boolean(),
  shift: z.boolean(),
  meta: z.boolean(),
  key: z.string(),
});

export const keyboardShortcutMapSchema = z.record(
  z.string(),
  keyboardShortcutBindingSchema,
);

export const appSettingsSchema = z.object({
  theme: z.enum(['light', 'dark']),
  defaultViewMode: z.enum(['editor', 'preview', 'split']),
  autoSave: z.boolean(),
  defaultFontCn: z.string(),
  defaultFontEn: z.string(),
  defaultFontSize: z.number(),
  defaultLineSpacing: z.number(),
  defaultSpaceAfter: z.number(),
  defaultAlignment: z.enum(['left', 'center', 'right', 'justify']),
  editorFontSize: z.number(),
  editorLineHeight: z.number(),
  editorWordWrap: z.boolean(),
  scrollSyncEnabled: z.boolean(),
  showStatusBar: z.boolean(),
  keyboardShortcuts: keyboardShortcutMapSchema,
});

/**
 * Parse and normalize raw settings from storage.
 * Fills missing fields with defaults and migrates legacy values.
 */
export function parseSettings(raw: unknown) {
  const parsed = appSettingsSchema.safeParse({
    ...DEFAULT_SETTINGS_FOR_SCHEMA,
    ...raw as object,
    keyboardShortcuts: {
      ...DEFAULT_KEYBOARD_SHORTCUTS,
      ...((raw as { keyboardShortcuts?: Record<string, unknown> })?.keyboardShortcuts ?? {}),
    },
  });

  if (parsed.success) {
    return parsed.data;
  }

  // If schema fails, fall back to defaults
  return { ...DEFAULT_SETTINGS_FOR_SCHEMA };
}

const DEFAULT_SETTINGS_FOR_SCHEMA = {
  theme: 'light' as const,
  defaultViewMode: 'split' as const,
  autoSave: false,
  defaultFontCn: 'SimSun',
  defaultFontEn: '',
  defaultFontSize: 12,
  defaultLineSpacing: 1.5,
  defaultSpaceAfter: 8,
  defaultAlignment: 'left' as const,
  editorFontSize: 15,
  editorLineHeight: 32,
  editorWordWrap: true,
  scrollSyncEnabled: true,
  showStatusBar: true,
  keyboardShortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

export type ParsedAppSettings = z.output<typeof appSettingsSchema>;

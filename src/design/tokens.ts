import tokens from './tokens.json';

type ThemeName = 'light' | 'dark';

const semanticColorKeys = [
  'app',
  'surface',
  'surfaceSubtle',
  'surfaceRaised',
  'control',
  'controlHover',
  'controlActive',
  'border',
  'borderSubtle',
  'text',
  'textMuted',
  'textSubtle',
  'editor',
  'editorText',
  'previewCanvas',
  'previewPage',
  'selection',
  'search',
  'searchCurrent',
] as const;

const brandColorKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

const tokenGroups = ['color', 'space', 'radius', 'shadow', 'font', 'motion'] as const;

export type DesignTokens = typeof tokens;

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

function assertStringRecord(groupName: string, group: Record<string, unknown>): string[] {
  return Object.entries(group).flatMap(([key, value]) => (
    typeof value === 'string' && value.length > 0 ? [] : [`${groupName}.${key} must be a non-empty string`]
  ));
}

export function validateDesignTokens(candidate: DesignTokens = tokens): string[] {
  const errors: string[] = [];

  for (const group of tokenGroups) {
    if (!(group in candidate)) {
      errors.push(`${group} token group is missing`);
    }
  }

  for (const key of brandColorKeys) {
    if (!isHexColor(candidate.color.brand[key])) {
      errors.push(`color.brand.${key} must be a 6-digit hex color`);
    }
  }

  for (const theme of ['light', 'dark'] satisfies ThemeName[]) {
    for (const key of semanticColorKeys) {
      if (!isHexColor(candidate.color[theme][key])) {
        errors.push(`color.${theme}.${key} must be a 6-digit hex color`);
      }
    }
  }

  errors.push(...assertStringRecord('space', candidate.space));
  errors.push(...assertStringRecord('radius', candidate.radius));
  errors.push(...assertStringRecord('shadow', candidate.shadow));
  errors.push(...assertStringRecord('font', candidate.font));
  errors.push(...assertStringRecord('motion', candidate.motion));

  return errors;
}

export { tokens };

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

export function validateDesignTokens(candidate: any = tokens): string[] {
  const errors: string[] = [];

  if (!candidate || typeof candidate !== 'object') {
    return ['Tokens must be an object'];
  }

  for (const group of tokenGroups) {
    if (!(group in candidate) || !candidate[group]) {
      errors.push(`${group} token group is missing`);
    }
  }

  if (errors.length > 0) return errors;

  if (candidate.color?.brand) {
    for (const key of brandColorKeys) {
      if (!isHexColor(candidate.color.brand[key])) {
        errors.push(`color.brand.${key} must be a 6-digit hex color`);
      }
    }
  } else {
    errors.push('color.brand is missing');
  }

  for (const theme of ['light', 'dark'] satisfies ThemeName[]) {
    if (candidate.color?.[theme]) {
      for (const key of semanticColorKeys) {
        if (!isHexColor(candidate.color[theme][key])) {
          errors.push(`color.${theme}.${key} must be a 6-digit hex color`);
        }
      }
    } else {
      errors.push(`color.${theme} is missing`);
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

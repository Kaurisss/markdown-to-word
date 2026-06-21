import { CSSProperties } from 'react';
import { PreviewProps } from '../../types';

export function ptToPx(pt: number): string {
  return `${(pt * 96) / 72}px`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const s = hex.trim().replace(/^#/, '');
  const normalized = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildFontFamily(cfg: PreviewProps['cfg'], elementFontFamily?: string): string {
  const baseCn = cfg.global.baseFontCn?.trim() || 'SimSun';
  // Match backend behavior: fallback to baseFontCn when baseFontEn is empty
  const baseEn = cfg.global.baseFontEn?.trim() || baseCn;
  const parts: string[] = [];

  if (elementFontFamily?.trim()) parts.push(`"${elementFontFamily.trim()}"`);
  parts.push(`"${baseEn}"`, `"${baseCn}"`, '"Microsoft YaHei"', '"Heiti SC"', 'sans-serif');
  return parts.join(', ');
}

export function normalizeLineSpacing(value: number | string): number | string {
  if (typeof value === 'number') return value;
  const ptMatch = value.match(/^([\d.]+)pt$/);
  if (ptMatch) return ptToPx(parseFloat(ptMatch[1]));
  return value;
}

export function elementStyleToCss(cfg: PreviewProps['cfg'], style: PreviewProps['cfg']['styles']['body']): CSSProperties {
  return {
    fontFamily: buildFontFamily(cfg, style.fontFamily),
    fontSize: ptToPx(style.fontSize),
    color: style.color,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    lineHeight: normalizeLineSpacing(style.lineSpacing),
    marginTop: ptToPx(style.spaceBefore),
    marginBottom: ptToPx(style.spaceAfter),
    textAlign: style.alignment,
    textIndent: style.firstLineIndent ? `${style.firstLineIndent}em` : undefined,
    backgroundColor: style.backgroundColor
  };
}

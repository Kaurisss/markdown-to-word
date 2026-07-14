import { describe, expect, it } from 'vitest';
import {
  assertPathWithinWorkspace,
  getRelativePath,
  getWorkspaceRelativePath,
  isPathWithinWorkspace,
  joinWorkspacePath,
  naturalCompare,
  normalizeAbsolutePath,
  normalizeRelativePath,
} from '@/features/workspace/pathUtils';

describe('workspace path utilities', () => {
  it('normalizes Windows paths while keeping an absolute drive root', () => {
    expect(normalizeAbsolutePath('c:\\Users\\Logic\\Docs\\.\\chapter.md')).toBe(
      'c:/Users/Logic/Docs/chapter.md',
    );
  });

  it('normalizes safe relative paths and rejects paths escaping the root', () => {
    expect(normalizeRelativePath('./images\\cover.png')).toBe('images/cover.png');
    expect(() => normalizeRelativePath('../secret.png')).toThrow('路径越出工作区');
    expect(() => normalizeRelativePath('C:\\outside\\secret.png')).toThrow('需要相对路径');
  });

  it('checks workspace membership by path segment rather than string prefix', () => {
    expect(isPathWithinWorkspace('C:\\work\\docs', 'c:\\work\\docs\\a.md')).toBe(true);
    expect(isPathWithinWorkspace('C:\\work\\docs', 'C:\\work\\docs-old\\a.md')).toBe(false);
    expect(() => assertPathWithinWorkspace('C:\\work\\docs', 'C:\\work\\other\\a.md')).toThrow(
      '拒绝访问工作区外路径',
    );
  });

  it('joins workspace paths and emits slash-separated metadata paths', () => {
    const target = joinWorkspacePath('C:\\work\\docs', 'chapters\\one.md');
    expect(target).toBe('C:/work/docs/chapters/one.md');
    expect(getWorkspaceRelativePath('C:\\work\\docs', target)).toBe('chapters/one.md');
  });

  it('creates document-relative references', () => {
    expect(getRelativePath('C:\\work\\docs\\chapters', 'C:\\work\\docs\\images\\a.png')).toBe(
      '../images/a.png',
    );
  });

  it('sorts numbered names naturally', () => {
    expect(['image-10.png', 'image-2.png'].sort(naturalCompare)).toEqual([
      'image-2.png',
      'image-10.png',
    ]);
  });
});
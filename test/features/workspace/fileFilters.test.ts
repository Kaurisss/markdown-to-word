import { describe, expect, it } from 'vitest';
import {
  classifyWorkspaceFile,
  getFileExtension,
  getImageMimeType,
  shouldShowWorkspaceEntry,
} from '@/features/workspace/fileFilters';

describe('workspace file filters', () => {
  it('classifies supported document and image extensions case-insensitively', () => {
    expect(classifyWorkspaceFile('notes.MARKDOWN')).toBe('document');
    expect(classifyWorkspaceFile('photo.JPEG')).toBe('image');
    expect(classifyWorkspaceFile('icon.svg')).toBeNull();
  });

  it('hides metadata and unsupported files while keeping ordinary directories', () => {
    expect(shouldShowWorkspaceEntry('.md2word', true)).toBe(false);
    expect(shouldShowWorkspaceEntry('chapters', true)).toBe(true);
    expect(shouldShowWorkspaceEntry('draft.md', false)).toBe(true);
    expect(shouldShowWorkspaceEntry('diagram.svg', false)).toBe(false);
  });

  it('does not treat dotfiles or trailing dots as extensions', () => {
    expect(getFileExtension('.gitignore')).toBe('');
    expect(getFileExtension('draft.')).toBe('');
  });

  it('maps supported images to browser MIME types', () => {
    expect(getImageMimeType('a.jpg')).toBe('image/jpeg');
    expect(getImageMimeType('a.webp')).toBe('image/webp');
    expect(getImageMimeType('a.svg')).toBeNull();
  });
});
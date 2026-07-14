import { describe, expect, it } from 'vitest';
import {
  createConflictFreeFileName,
  createImageImportDestination,
  resolveDocumentResource,
  selectImageDirectory,
  sortImagePaths,
} from '@/features/workspace/resourceResolver';

describe('document resource resolver', () => {
  const workspaceRoot = 'C:\\work\\docs';
  const markdownPath = 'C:\\work\\docs\\chapters\\one.md';

  it('resolves image references from the Markdown document directory', () => {
    expect(resolveDocumentResource(workspaceRoot, markdownPath, '../images/cover.png')).toBe(
      'C:/work/docs/images/cover.png',
    );
  });

  it('rejects outside, absolute, and remote image references', () => {
    expect(() => resolveDocumentResource(workspaceRoot, markdownPath, '../../outside.png')).toThrow(
      '拒绝访问工作区外路径',
    );
    expect(() => resolveDocumentResource(workspaceRoot, markdownPath, 'C:\\outside\\a.png')).toThrow(
      '不支持的图片引用',
    );
    expect(() => resolveDocumentResource(workspaceRoot, markdownPath, 'https://example.com/a.png')).toThrow(
      '不支持的图片引用',
    );
  });

  it('prefers images, then assets, then a new images directory', () => {
    expect(
      selectImageDirectory(workspaceRoot, markdownPath, ['C:\\work\\docs\\chapters\\images']),
    ).toBe('C:/work/docs/chapters/images');
    expect(
      selectImageDirectory(workspaceRoot, markdownPath, ['C:\\work\\docs\\chapters\\assets']),
    ).toBe('C:/work/docs/chapters/assets');
    expect(selectImageDirectory(workspaceRoot, markdownPath, [])).toBe(
      'C:/work/docs/chapters/images',
    );
  });

  it('uses stable numeric suffixes without overwriting existing files', () => {
    expect(createConflictFreeFileName('cover.png', ['cover.png', 'cover-2.png'])).toBe('cover-3.png');
    expect(createConflictFreeFileName('Cover.PNG', ['cover.png'])).toBe('Cover-2.PNG');
  });

  it('builds an import destination and Markdown reference in one operation', () => {
    expect(
      createImageImportDestination({
        workspaceRoot,
        markdownPath,
        sourceFileName: 'cover.png',
        existingDirectoryPaths: [],
        existingFileNames: ['cover.png'],
      }),
    ).toEqual({
      directoryPath: 'C:/work/docs/chapters/images',
      filePath: 'C:/work/docs/chapters/images/cover-2.png',
      markdownReference: 'images/cover-2.png',
    });
  });

  it('sorts sibling images naturally by file name', () => {
    expect(sortImagePaths(['C:/a/image-10.png', 'C:/a/image-2.png'])).toEqual([
      'C:/a/image-2.png',
      'C:/a/image-10.png',
    ]);
  });
});
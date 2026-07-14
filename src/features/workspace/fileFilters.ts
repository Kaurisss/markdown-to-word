import { WORKSPACE_METADATA_DIRECTORY, type WorkspaceEntryKind } from './types';

export const DOCUMENT_EXTENSIONS = ['.md', '.markdown', '.txt'] as const;
export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'] as const;
export const SUPPORTED_FILE_EXTENSIONS = [...DOCUMENT_EXTENSIONS, ...IMAGE_EXTENSIONS] as const;

const DOCUMENT_EXTENSION_SET = new Set<string>(DOCUMENT_EXTENSIONS);
const IMAGE_EXTENSION_SET = new Set<string>(IMAGE_EXTENSIONS);

export function getFileExtension(fileName: string): string {
  const lastSlashIndex = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
  const baseName = fileName.slice(lastSlashIndex + 1);
  const dotIndex = baseName.lastIndexOf('.');

  if (dotIndex <= 0 || dotIndex === baseName.length - 1) {
    return '';
  }

  return baseName.slice(dotIndex).toLowerCase();
}

export function isDocumentFile(fileName: string): boolean {
  return DOCUMENT_EXTENSION_SET.has(getFileExtension(fileName));
}

export function isImageFile(fileName: string): boolean {
  return IMAGE_EXTENSION_SET.has(getFileExtension(fileName));
}

export function classifyWorkspaceFile(fileName: string): Exclude<WorkspaceEntryKind, 'directory'> | null {
  if (isDocumentFile(fileName)) return 'document';
  if (isImageFile(fileName)) return 'image';
  return null;
}

export function shouldShowWorkspaceEntry(name: string, isDirectory: boolean): boolean {
  if (isDirectory) {
    return name !== WORKSPACE_METADATA_DIRECTORY;
  }

  return classifyWorkspaceFile(name) !== null;
}

export function getImageMimeType(fileName: string): string | null {
  switch (getFileExtension(fileName)) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return null;
  }
}
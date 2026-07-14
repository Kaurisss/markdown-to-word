import { isImageFile } from './fileFilters';
import {
  assertPathWithinWorkspace,
  getBaseName,
  getParentPath,
  getRelativePath,
  isAbsolutePath,
  joinWorkspacePath,
  naturalCompare,
  normalizeAbsolutePath,
} from './pathUtils';
import { WorkspaceError } from './workspaceErrors';

const EXTERNAL_REFERENCE_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export interface ImageImportDestination {
  directoryPath: string;
  filePath: string;
  markdownReference: string;
}

export function resolveDocumentResource(
  workspaceRoot: string,
  markdownPath: string,
  reference: string,
): string {
  const trimmedReference = reference.trim();
  if (
    !trimmedReference
    || isAbsolutePath(trimmedReference)
    || EXTERNAL_REFERENCE_PATTERN.test(trimmedReference)
  ) {
    throw new WorkspaceError('invalid-path', `不支持的图片引用：${reference}`);
  }

  const documentDirectory = getParentPath(assertPathWithinWorkspace(workspaceRoot, markdownPath));
  const resolved = normalizeAbsolutePath(`${documentDirectory}/${trimmedReference}`);
  return assertPathWithinWorkspace(workspaceRoot, resolved);
}

export function createMarkdownImageReference(markdownPath: string, imagePath: string): string {
  return getRelativePath(getParentPath(markdownPath), imagePath);
}

export function selectImageDirectory(
  workspaceRoot: string,
  markdownPath: string,
  existingDirectoryPaths: Iterable<string>,
): string {
  const documentDirectory = getParentPath(assertPathWithinWorkspace(workspaceRoot, markdownPath));
  const existing = new Set(
    Array.from(existingDirectoryPaths, (path) => normalizeAbsolutePath(path).toLocaleLowerCase('en-US')),
  );
  const imagesDirectory = joinWorkspacePath(documentDirectory, 'images');
  const assetsDirectory = joinWorkspacePath(documentDirectory, 'assets');

  if (existing.has(imagesDirectory.toLocaleLowerCase('en-US'))) return imagesDirectory;
  if (existing.has(assetsDirectory.toLocaleLowerCase('en-US'))) return assetsDirectory;
  return imagesDirectory;
}

export function createConflictFreeFileName(fileName: string, existingNames: Iterable<string>): string {
  const existing = new Set(Array.from(existingNames, (name) => name.toLocaleLowerCase('en-US')));
  if (!existing.has(fileName.toLocaleLowerCase('en-US'))) return fileName;

  const dotIndex = fileName.lastIndexOf('.');
  const hasExtension = dotIndex > 0;
  const baseName = hasExtension ? fileName.slice(0, dotIndex) : fileName;
  const extension = hasExtension ? fileName.slice(dotIndex) : '';

  for (let index = 2; ; index += 1) {
    const candidate = `${baseName}-${index}${extension}`;
    if (!existing.has(candidate.toLocaleLowerCase('en-US'))) return candidate;
  }
}

export function createImageImportDestination(options: {
  workspaceRoot: string;
  markdownPath: string;
  sourceFileName: string;
  existingDirectoryPaths: Iterable<string>;
  existingFileNames: Iterable<string>;
}): ImageImportDestination {
  if (!isImageFile(options.sourceFileName)) {
    throw new WorkspaceError('unsupported-file', `不支持的图片格式：${options.sourceFileName}`);
  }

  const directoryPath = selectImageDirectory(
    options.workspaceRoot,
    options.markdownPath,
    options.existingDirectoryPaths,
  );
  const fileName = createConflictFreeFileName(getBaseName(options.sourceFileName), options.existingFileNames);
  const filePath = joinWorkspacePath(directoryPath, fileName);

  return {
    directoryPath,
    filePath,
    markdownReference: createMarkdownImageReference(options.markdownPath, filePath),
  };
}

export function sortImagePaths(paths: readonly string[]): string[] {
  return [...paths].sort((left, right) => naturalCompare(getBaseName(left), getBaseName(right)));
}
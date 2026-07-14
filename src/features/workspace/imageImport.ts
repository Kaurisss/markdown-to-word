import { createImageImportDestination } from './resourceResolver';
import { joinWorkspacePath } from './pathUtils';
import type { WorkspaceFsAdapter } from './workspaceFs';

export interface ImageImportInput {
  fs: WorkspaceFsAdapter;
  markdownPath: string;
  sourceFileName: string;
  content: Uint8Array;
}

export async function importImageToWorkspace(input: ImageImportInput): Promise<string> {
  const documentDirectory = input.markdownPath.slice(0, input.markdownPath.lastIndexOf('/'));
  const directoryEntries = await input.fs.readDirectory(documentDirectory);
  const existingDirectories = directoryEntries
    .filter((entry) => entry.kind === 'directory')
    .map((entry) => entry.absolutePath);
  const destination = createImageImportDestination({
    workspaceRoot: input.fs.workspaceRoot,
    markdownPath: input.markdownPath,
    sourceFileName: input.sourceFileName,
    existingDirectoryPaths: existingDirectories,
    existingFileNames: [],
  });

  if (!await input.fs.exists(destination.directoryPath)) {
    await input.fs.createDirectory(destination.directoryPath);
  }
  const siblingEntries = await input.fs.readDirectory(destination.directoryPath);
  const destinationWithConflictResolution = createImageImportDestination({
    workspaceRoot: input.fs.workspaceRoot,
    markdownPath: input.markdownPath,
    sourceFileName: input.sourceFileName,
    existingDirectoryPaths: [...existingDirectories, destination.directoryPath],
    existingFileNames: siblingEntries.map((entry) => entry.name),
  });

  await input.fs.writeBinaryAsset(
    destinationWithConflictResolution.filePath,
    input.content,
  );
  return destinationWithConflictResolution.markdownReference;
}

export async function readBrowserImage(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function createImageReferenceMarkdown(reference: string, alt: string): string {
  const safeAlt = alt.trim() || reference.slice(reference.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '');
  return `![${safeAlt}](${reference})`;
}
import type { DocumentConfig } from '@/types/config';
import { getWorkspaceRelativePath } from './pathUtils';
import type { WorkspaceDocumentState, WorkspaceMetadata } from './types';
import type { WorkspaceFsAdapter } from './workspaceFs';
import { getDocumentConfig } from './workspaceMetadataStorage';

export interface OpenDocumentOptions {
  fs: WorkspaceFsAdapter;
  metadata: WorkspaceMetadata;
  absolutePath: string;
}

export async function openDocumentSession(
  options: OpenDocumentOptions,
): Promise<WorkspaceDocumentState> {
  const relativePath = getWorkspaceRelativePath(options.fs.workspaceRoot, options.absolutePath);
  const content = await options.fs.readTextDocument(options.absolutePath);
  return {
    absolutePath: options.absolutePath,
    relativePath,
    content,
    config: getDocumentConfig(options.metadata, relativePath),
    dirty: false,
  };
}

export function updateDocumentContent(
  document: WorkspaceDocumentState,
  content: string,
): WorkspaceDocumentState {
  if (content === document.content) return document;
  return { ...document, content, dirty: true };
}

export function updateDocumentConfig(
  document: WorkspaceDocumentState,
  config: DocumentConfig,
): WorkspaceDocumentState {
  return { ...document, config, dirty: true };
}

export async function saveDocumentSession(
  fs: WorkspaceFsAdapter,
  document: WorkspaceDocumentState,
): Promise<WorkspaceDocumentState> {
  await fs.writeTextDocument(document.absolutePath, document.content);
  return {
    ...document,
    dirty: false,
    lastSavedAt: Date.now(),
  };
}
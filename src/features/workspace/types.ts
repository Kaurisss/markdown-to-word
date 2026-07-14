import type { DocumentConfig } from '@/types/config';

export const WORKSPACE_METADATA_DIRECTORY = '.md2word';
export const WORKSPACE_METADATA_FILE = `${WORKSPACE_METADATA_DIRECTORY}/workspace.json`;

export type WorkspaceEntryKind = 'directory' | 'document' | 'image';

export interface WorkspaceEntry {
  id: string;
  kind: WorkspaceEntryKind;
  name: string;
  absolutePath: string;
  relativePath: string;
  parentPath: string | null;
  extension?: string;
  size?: number;
  modifiedAt?: number;
  hasChildren?: boolean;
}

export interface WorkspaceDocumentState {
  absolutePath: string;
  relativePath: string;
  content: string;
  config: DocumentConfig;
  dirty: boolean;
  lastSavedAt?: number;
}

export interface WorkspaceMetadata {
  version: 1;
  defaultConfig: DocumentConfig;
  documents: Record<string, DocumentConfig>;
}

export interface RecentWorkspace {
  absolutePath: string;
  name: string;
  openedAt: number;
}

export interface ImageCaptionConfig {
  useAltText: boolean;
  autoNumber: boolean;
}
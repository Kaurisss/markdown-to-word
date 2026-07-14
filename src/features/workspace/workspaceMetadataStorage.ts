import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { normalizeDocumentConfig } from '@/config/documentConfigStorage';
import type { DocumentConfig } from '@/types/config';
import { joinWorkspacePath } from './pathUtils';
import { parseWorkspaceMetadata } from './schemas';
import {
  WORKSPACE_METADATA_DIRECTORY,
  WORKSPACE_METADATA_FILE,
  type WorkspaceMetadata,
} from './types';
import type { WorkspaceFsAdapter } from './workspaceFs';

function cloneConfig(config: DocumentConfig): DocumentConfig {
  return JSON.parse(JSON.stringify(config)) as DocumentConfig;
}

export function createWorkspaceMetadata(defaultConfig: DocumentConfig = DEFAULT_CONFIG): WorkspaceMetadata {
  return {
    version: 1,
    defaultConfig: cloneConfig(normalizeDocumentConfig(defaultConfig)),
    documents: {},
  };
}

export async function loadWorkspaceMetadata(
  fs: WorkspaceFsAdapter,
  legacyConfig: DocumentConfig = DEFAULT_CONFIG,
): Promise<WorkspaceMetadata> {
  const metadataPath = joinWorkspacePath(fs.workspaceRoot, WORKSPACE_METADATA_FILE);
  if (!await fs.exists(metadataPath)) {
    return createWorkspaceMetadata(legacyConfig);
  }

  try {
    return parseWorkspaceMetadata(JSON.parse(await fs.readTextDocument(metadataPath)));
  } catch {
    return createWorkspaceMetadata(legacyConfig);
  }
}

export async function saveWorkspaceMetadata(
  fs: WorkspaceFsAdapter,
  metadata: WorkspaceMetadata,
): Promise<void> {
  const metadataDirectory = joinWorkspacePath(fs.workspaceRoot, WORKSPACE_METADATA_DIRECTORY);
  const metadataPath = joinWorkspacePath(fs.workspaceRoot, WORKSPACE_METADATA_FILE);
  if (!await fs.exists(metadataDirectory)) {
    await fs.createDirectory(metadataDirectory);
  }

  const serialized = `${JSON.stringify(metadata, null, 2)}\n`;
  if (await fs.exists(metadataPath)) {
    await fs.writeTextDocument(metadataPath, serialized);
  } else {
    await fs.createFile(metadataPath, serialized);
  }
}

export function getDocumentConfig(
  metadata: WorkspaceMetadata,
  relativePath: string,
): DocumentConfig {
  return cloneConfig(metadata.documents[relativePath] ?? metadata.defaultConfig);
}

export function setDocumentConfig(
  metadata: WorkspaceMetadata,
  relativePath: string,
  config: DocumentConfig,
): WorkspaceMetadata {
  return {
    ...metadata,
    documents: {
      ...metadata.documents,
      [relativePath]: cloneConfig(normalizeDocumentConfig(config)),
    },
  };
}

export function renameDocumentConfig(
  metadata: WorkspaceMetadata,
  fromRelativePath: string,
  toRelativePath: string,
): WorkspaceMetadata {
  const config = metadata.documents[fromRelativePath];
  if (!config) return metadata;

  const documents = { ...metadata.documents };
  delete documents[fromRelativePath];
  documents[toRelativePath] = config;
  return { ...metadata, documents };
}

export function removeDocumentConfig(
  metadata: WorkspaceMetadata,
  relativePath: string,
): WorkspaceMetadata {
  if (!(relativePath in metadata.documents)) return metadata;
  const documents = { ...metadata.documents };
  delete documents[relativePath];
  return { ...metadata, documents };
}
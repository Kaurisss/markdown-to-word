import { z } from 'zod';
import { normalizeDocumentConfig } from '@/config/documentConfigStorage';
import type { WorkspaceMetadata } from './types';

const workspaceMetadataSchema = z.object({
  version: z.literal(1),
  defaultConfig: z.unknown(),
  documents: z.record(z.string(), z.unknown()),
}).strict();

export function parseWorkspaceMetadata(value: unknown): WorkspaceMetadata {
  const parsed = workspaceMetadataSchema.parse(value);
  return {
    version: 1,
    defaultConfig: normalizeDocumentConfig(parsed.defaultConfig),
    documents: Object.fromEntries(
      Object.entries(parsed.documents).map(([path, config]) => [
        path.replace(/\\/g, '/'),
        normalizeDocumentConfig(config),
      ]),
    ),
  };
}
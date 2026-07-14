import { create } from 'zustand';
import { loadDocumentConfig } from '@/config/documentConfigStorage';
import type { DocumentConfig } from '@/types/config';
import {
  openDocumentSession,
  saveDocumentSession,
  updateDocumentContent,
} from './documentSession';
import { getBaseName, normalizeAbsolutePath } from './pathUtils';
import type {
  RecentWorkspace,
  WorkspaceDocumentState,
  WorkspaceEntry,
  WorkspaceMetadata,
} from './types';
import { createTauriWorkspaceFs, selectWorkspaceDirectory, type WorkspaceFsAdapter } from './workspaceFs';
import {
  loadWorkspaceMetadata,
  saveWorkspaceMetadata,
  setDocumentConfig,
} from './workspaceMetadataStorage';

const RECENT_WORKSPACES_KEY = 'md2word_recent_workspaces';
const WORKSPACE_UI_STATE_PREFIX = 'md2word_workspace_ui:';
const MAX_RECENT_WORKSPACES = 5;

export type DirtyDocumentDecision = 'save' | 'discard' | 'cancel';
export type DirtyDocumentResolver = (
  document: WorkspaceDocumentState,
) => Promise<DirtyDocumentDecision>;

interface WorkspaceStoreState {
  workspaceRoot: string | null;
  workspaceName: string | null;
  fs: WorkspaceFsAdapter | null;
  metadata: WorkspaceMetadata | null;
  activeDocument: WorkspaceDocumentState | null;
  directoryEntries: Record<string, WorkspaceEntry[]>;
  recentWorkspaces: RecentWorkspace[];
  selectedImagePath: string | null;
  sheetOpen: boolean;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  openWorkspace: (path?: string, fs?: WorkspaceFsAdapter) => Promise<boolean>;
  closeWorkspace: () => void;
  loadDirectory: (path: string, force?: boolean) => Promise<WorkspaceEntry[]>;
  refreshDirectory: (path: string) => Promise<WorkspaceEntry[]>;
  openDocument: (
    path: string,
    options: { autoSave: boolean; resolveDirty?: DirtyDocumentResolver },
  ) => Promise<boolean>;
  updateActiveContent: (content: string) => void;
  updateActiveConfig: (config: DocumentConfig) => Promise<void>;
  saveActiveDocument: () => Promise<boolean>;
  reloadActiveDocument: (content: string) => void;
  setSelectedImagePath: (path: string | null) => void;
  setSheetOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseRecentWorkspaces(storage: StorageLike | null = getStorage()): RecentWorkspace[] {
  if (!storage) return [];
  try {
    const value: unknown = JSON.parse(storage.getItem(RECENT_WORKSPACES_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value
      .filter((entry): entry is RecentWorkspace => Boolean(
        entry
        && typeof entry === 'object'
        && typeof entry.absolutePath === 'string'
        && typeof entry.name === 'string'
        && typeof entry.openedAt === 'number',
      ))
      .slice(0, MAX_RECENT_WORKSPACES);
  } catch {
    return [];
  }
}

function saveRecentWorkspaces(recent: RecentWorkspace[], storage: StorageLike | null = getStorage()): void {
  try {
    storage?.setItem(RECENT_WORKSPACES_KEY, JSON.stringify(recent));
  } catch {
    // Persistence failure must not block opening a workspace.
  }
}

function addRecentWorkspace(
  recent: RecentWorkspace[],
  absolutePath: string,
): RecentWorkspace[] {
  const normalized = normalizeAbsolutePath(absolutePath);
  const next = [
    { absolutePath: normalized, name: getBaseName(normalized), openedAt: Date.now() },
    ...recent.filter((entry) => normalizeAbsolutePath(entry.absolutePath) !== normalized),
  ].slice(0, MAX_RECENT_WORKSPACES);
  saveRecentWorkspaces(next);
  return next;
}

function getLastDocumentPath(workspaceRoot: string, storage: StorageLike | null = getStorage()): string | null {
  try {
    return storage?.getItem(`${WORKSPACE_UI_STATE_PREFIX}${workspaceRoot}:last-document`) ?? null;
  } catch {
    return null;
  }
}

function saveLastDocumentPath(
  workspaceRoot: string,
  relativePath: string,
  storage: StorageLike | null = getStorage(),
): void {
  try {
    storage?.setItem(`${WORKSPACE_UI_STATE_PREFIX}${workspaceRoot}:last-document`, relativePath);
  } catch {
    // UI state is best-effort and does not belong in workspace metadata.
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaceRoot: null,
  workspaceName: null,
  fs: null,
  metadata: null,
  activeDocument: null,
  directoryEntries: {},
  recentWorkspaces: parseRecentWorkspaces(),
  selectedImagePath: null,
  sheetOpen: false,
  searchQuery: '',
  loading: false,
  error: null,

  async openWorkspace(path, injectedFs) {
    set({ loading: true, error: null });
    try {
      const selectedPath = path ?? await selectWorkspaceDirectory();
      if (!selectedPath) {
        set({ loading: false });
        return false;
      }

      const root = normalizeAbsolutePath(selectedPath);
      const fs = injectedFs ?? createTauriWorkspaceFs(root);
      const [metadata, rootEntries] = await Promise.all([
        loadWorkspaceMetadata(fs, loadDocumentConfig()),
        fs.readDirectory(root),
      ]);
      const recentWorkspaces = addRecentWorkspace(get().recentWorkspaces, root);

      set({
        workspaceRoot: root,
        workspaceName: getBaseName(root),
        fs,
        metadata,
        activeDocument: null,
        directoryEntries: { [root]: rootEntries },
        recentWorkspaces,
        selectedImagePath: null,
        loading: false,
        error: null,
      });

      const documents = rootEntries.filter((entry) => entry.kind === 'document');
      const lastRelativePath = getLastDocumentPath(root);
      const lastDocument = documents.find((entry) => entry.relativePath === lastRelativePath);
      const documentToOpen = lastDocument ?? (documents.length === 1 ? documents[0] : null);
      if (documentToOpen) {
        await get().openDocument(documentToOpen.absolutePath, { autoSave: true });
      }
      return true;
    } catch (error) {
      set({ loading: false, error: errorMessage(error) });
      return false;
    }
  },

  closeWorkspace() {
    set({
      workspaceRoot: null,
      workspaceName: null,
      fs: null,
      metadata: null,
      activeDocument: null,
      directoryEntries: {},
      selectedImagePath: null,
      searchQuery: '',
      sheetOpen: false,
      loading: false,
      error: null,
    });
  },

  async loadDirectory(path, force = false) {
    const { fs, directoryEntries } = get();
    if (!fs) return [];
    const target = normalizeAbsolutePath(path);
    if (!force && directoryEntries[target]) return directoryEntries[target];

    try {
      const entries = await fs.readDirectory(target);
      set((state) => ({
        directoryEntries: { ...state.directoryEntries, [target]: entries },
        error: null,
      }));
      return entries;
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  async refreshDirectory(path) {
    return get().loadDirectory(path, true);
  },

  async openDocument(path, options) {
    const { fs, metadata, activeDocument } = get();
    if (!fs || !metadata) return false;
    if (activeDocument?.absolutePath === normalizeAbsolutePath(path)) return true;

    try {
      if (activeDocument?.dirty) {
        const decision = options.autoSave
          ? 'save'
          : await options.resolveDirty?.(activeDocument) ?? 'cancel';
        if (decision === 'cancel') return false;
        if (decision === 'save' && !await get().saveActiveDocument()) return false;
      }

      const document = await openDocumentSession({ fs, metadata: get().metadata ?? metadata, absolutePath: path });
      saveLastDocumentPath(fs.workspaceRoot, document.relativePath);
      set({ activeDocument: document, selectedImagePath: null, sheetOpen: false, error: null });
      return true;
    } catch (error) {
      set({ error: errorMessage(error) });
      return false;
    }
  },

  updateActiveContent(content) {
    set((state) => ({
      activeDocument: state.activeDocument
        ? updateDocumentContent(state.activeDocument, content)
        : null,
    }));
  },

  async updateActiveConfig(config) {
    const { activeDocument, metadata, fs } = get();
    if (!activeDocument || !metadata || !fs) return;
    const nextMetadata = setDocumentConfig(metadata, activeDocument.relativePath, config);
    set({
      activeDocument: { ...activeDocument, config },
      metadata: nextMetadata,
    });
    try {
      await saveWorkspaceMetadata(fs, nextMetadata);
      set({ error: null });
    } catch (error) {
      set({ error: errorMessage(error) });
      throw error;
    }
  },

  async saveActiveDocument() {
    const { activeDocument, fs } = get();
    if (!activeDocument || !fs) return false;
    try {
      const saved = await saveDocumentSession(fs, activeDocument);
      set({ activeDocument: saved, error: null });
      return true;
    } catch (error) {
      set({ error: errorMessage(error) });
      return false;
    }
  },

  reloadActiveDocument(content) {
    set((state) => ({
      activeDocument: state.activeDocument
        ? { ...state.activeDocument, content, dirty: false, lastSavedAt: Date.now() }
        : null,
    }));
  },

  setSelectedImagePath(path) {
    set({ selectedImagePath: path });
  },

  setSheetOpen(open) {
    set({ sheetOpen: open });
  },

  setSearchQuery(query) {
    set({ searchQuery: query });
  },
}));
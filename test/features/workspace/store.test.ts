import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '@/config/defaultConfig';
import { normalizeAbsolutePath } from '@/features/workspace/pathUtils';
import { useWorkspaceStore } from '@/features/workspace/store';
import type { WorkspaceEntry } from '@/features/workspace/types';
import type { WorkspaceFsAdapter } from '@/features/workspace/workspaceFs';

function createDocumentEntry(root: string, name: string): WorkspaceEntry {
  const absolutePath = normalizeAbsolutePath(`${root}/${name}`);
  return {
    id: name,
    kind: 'document',
    name,
    absolutePath,
    relativePath: name,
    parentPath: normalizeAbsolutePath(root),
    extension: '.md',
  };
}

function createFakeFs(
  root: string,
  initialFiles: Record<string, string>,
): WorkspaceFsAdapter & { files: Map<string, string>; failWrites: boolean } {
  const normalizedRoot = normalizeAbsolutePath(root);
  const files = new Map(
    Object.entries(initialFiles).map(([path, content]) => [normalizeAbsolutePath(path), content]),
  );
  const directories = new Set([normalizedRoot]);

  return {
    workspaceRoot: normalizedRoot,
    files,
    failWrites: false,
    async readDirectory(path) {
      const directory = normalizeAbsolutePath(path);
      return [...files.keys()]
        .filter((filePath) => filePath.slice(0, filePath.lastIndexOf('/')) === directory)
        .map((filePath) => createDocumentEntry(directory, filePath.slice(filePath.lastIndexOf('/') + 1)))
        .filter((entry) => entry.name.endsWith('.md'));
    },
    async readTextDocument(path) {
      const content = files.get(normalizeAbsolutePath(path));
      if (content === undefined) throw new Error('not found');
      return content;
    },
    async writeTextDocument(path, content) {
      if (this.failWrites) throw new Error('write failed');
      files.set(normalizeAbsolutePath(path), content);
    },
    async readBinaryAsset() {
      return new Uint8Array();
    },
    async writeBinaryAsset(path, content) {
      files.set(normalizeAbsolutePath(path), new TextDecoder().decode(content));
    },
    async copyFile() {},
    async createFile(path, content) {
      files.set(normalizeAbsolutePath(path), content);
    },
    async createDirectory(path) {
      directories.add(normalizeAbsolutePath(path));
    },
    async renameEntry(from, to) {
      const content = files.get(normalizeAbsolutePath(from));
      if (content === undefined) throw new Error('not found');
      files.delete(normalizeAbsolutePath(from));
      files.set(normalizeAbsolutePath(to), content);
    },
    async moveToRecycleBin(path) {
      files.delete(normalizeAbsolutePath(path));
    },
    async revealInExplorer() {},
    async exists(path) {
      const normalized = normalizeAbsolutePath(path);
      return files.has(normalized) || directories.has(normalized);
    },
  };
}

describe('workspace store', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().closeWorkspace();
    useWorkspaceStore.setState({ recentWorkspaces: [] });
  });

  it('opens the only Markdown document and saves dirty content', async () => {
    const root = 'C:\\work\\docs';
    const fs = createFakeFs(root, { [`${root}\\one.md`]: '# One' });

    expect(await useWorkspaceStore.getState().openWorkspace(root, fs)).toBe(true);
    expect(useWorkspaceStore.getState().activeDocument?.relativePath).toBe('one.md');

    useWorkspaceStore.getState().updateActiveContent('# Changed');
    expect(useWorkspaceStore.getState().activeDocument?.dirty).toBe(true);
    expect(await useWorkspaceStore.getState().saveActiveDocument()).toBe(true);
    expect(fs.files.get('C:/work/docs/one.md')).toBe('# Changed');
    expect(useWorkspaceStore.getState().activeDocument?.dirty).toBe(false);
  });

  it('keeps the current document when autosave fails during a switch', async () => {
    const root = 'C:\\work\\docs';
    const fs = createFakeFs(root, {
      [`${root}\\one.md`]: '# One',
      [`${root}\\two.md`]: '# Two',
    });

    await useWorkspaceStore.getState().openWorkspace(root, fs);
    await useWorkspaceStore.getState().openDocument(`${root}\\one.md`, { autoSave: true });
    useWorkspaceStore.getState().updateActiveContent('# Unsaved');
    fs.failWrites = true;

    expect(await useWorkspaceStore.getState().openDocument(`${root}\\two.md`, { autoSave: true })).toBe(false);
    expect(useWorkspaceStore.getState().activeDocument?.relativePath).toBe('one.md');
    expect(useWorkspaceStore.getState().activeDocument?.content).toBe('# Unsaved');
    expect(useWorkspaceStore.getState().activeDocument?.dirty).toBe(true);
  });

  it('honors cancel and persists document-specific config independently', async () => {
    const root = 'C:\\work\\docs';
    const fs = createFakeFs(root, {
      [`${root}\\one.md`]: '# One',
      [`${root}\\two.md`]: '# Two',
    });

    await useWorkspaceStore.getState().openWorkspace(root, fs);
    await useWorkspaceStore.getState().openDocument(`${root}\\one.md`, { autoSave: true });
    useWorkspaceStore.getState().updateActiveContent('# Unsaved');
    const resolveDirty = vi.fn(async () => 'cancel' as const);

    expect(await useWorkspaceStore.getState().openDocument(`${root}\\two.md`, {
      autoSave: false,
      resolveDirty,
    })).toBe(false);
    expect(resolveDirty).toHaveBeenCalledOnce();

    const oneConfig = {
      ...DEFAULT_CONFIG,
      global: { ...DEFAULT_CONFIG.global, baseFontCn: 'KaiTi' },
    };
    await useWorkspaceStore.getState().updateActiveConfig(oneConfig);
    expect(useWorkspaceStore.getState().metadata?.documents['one.md'].global.baseFontCn).toBe('KaiTi');
    expect(useWorkspaceStore.getState().metadata?.documents['two.md']).toBeUndefined();
    expect(fs.files.has('C:/work/docs/.md2word/workspace.json')).toBe(true);
  });
});
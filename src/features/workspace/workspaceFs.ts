import { classifyWorkspaceFile, getFileExtension, shouldShowWorkspaceEntry } from './fileFilters';
import {
  assertPathWithinWorkspace,
  getParentPath,
  getWorkspaceRelativePath,
  joinWorkspacePath,
  naturalCompare,
  normalizeAbsolutePath,
} from './pathUtils';
import type { WorkspaceEntry } from './types';
import { WorkspaceError, type WorkspaceErrorCode } from './workspaceErrors';

export interface WorkspaceFsAdapter {
  readonly workspaceRoot: string;
  readDirectory(path: string): Promise<WorkspaceEntry[]>;
  readTextDocument(path: string): Promise<string>;
  writeTextDocument(path: string, content: string): Promise<void>;
  readBinaryAsset(path: string): Promise<Uint8Array>;
  writeBinaryAsset(path: string, content: Uint8Array): Promise<void>;
  copyFile(sourcePath: string, targetPath: string): Promise<void>;
  createFile(path: string, content: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  renameEntry(from: string, to: string): Promise<void>;
  moveToRecycleBin(path: string): Promise<void>;
  revealInExplorer(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}

function mapFsError(error: unknown, operation: string): WorkspaceError {
  const details = error instanceof Error ? error.message : String(error);
  const lower = details.toLocaleLowerCase('en-US');
  let code: WorkspaceErrorCode = 'io-error';

  if (/not found|cannot find|os error 2|不存在/.test(lower)) code = 'not-found';
  if (/permission|access is denied|os error 5|拒绝访问/.test(lower)) code = 'permission-denied';
  if (/already exists|os error 183|已存在/.test(lower)) code = 'conflict';

  return new WorkspaceError(code, `${operation}失败：${details}`, error);
}

function assertTarget(root: string, path: string): string {
  return assertPathWithinWorkspace(root, path);
}

export async function selectWorkspaceDirectory(): Promise<string | null> {
  const { open } = await import('@tauri-apps/plugin-dialog');
  const selected = await open({
    title: '选择 Markdown 工作区',
    directory: true,
    multiple: false,
    recursive: true,
  });

  return typeof selected === 'string' ? normalizeAbsolutePath(selected) : null;
}

export function createTauriWorkspaceFs(workspaceRoot: string): WorkspaceFsAdapter {
  const root = normalizeAbsolutePath(workspaceRoot);

  return {
    workspaceRoot: root,

    async readDirectory(path) {
      const target = assertTarget(root, path);
      try {
        const fs = await import('@tauri-apps/plugin-fs');
        const entries = await fs.readDir(target);
        const visibleEntries = entries.filter((entry) => (
          !entry.isSymlink && shouldShowWorkspaceEntry(entry.name, entry.isDirectory)
        ));

        const resolvedEntries = await Promise.all(visibleEntries.map(async (entry): Promise<WorkspaceEntry | null> => {
          const absolutePath = joinWorkspacePath(target, entry.name);
          const relativePath = getWorkspaceRelativePath(root, absolutePath);
          const kind = entry.isDirectory ? 'directory' : classifyWorkspaceFile(entry.name);
          if (!kind) return null;

          let size: number | undefined;
          let modifiedAt: number | undefined;
          try {
            const info = await fs.stat(absolutePath);
            size = info.isFile ? info.size : undefined;
            modifiedAt = info.mtime?.getTime();
          } catch {
            // Basic tree navigation remains available if optional metadata cannot be read.
          }

          return {
            id: relativePath || '.',
            kind,
            name: entry.name,
            absolutePath,
            relativePath,
            parentPath: getParentPath(absolutePath),
            extension: entry.isFile ? getFileExtension(entry.name) || undefined : undefined,
            size,
            modifiedAt,
            hasChildren: entry.isDirectory ? true : undefined,
          };
        }));

        return resolvedEntries
          .filter((entry): entry is WorkspaceEntry => entry !== null)
          .sort((left, right) => {
            if (left.kind === 'directory' && right.kind !== 'directory') return -1;
            if (left.kind !== 'directory' && right.kind === 'directory') return 1;
            return naturalCompare(left.name, right.name);
          });
      } catch (error) {
        throw mapFsError(error, '读取目录');
      }
    },

    async readTextDocument(path) {
      try {
        const { readTextFile } = await import('@tauri-apps/plugin-fs');
        return await readTextFile(assertTarget(root, path));
      } catch (error) {
        throw mapFsError(error, '读取文档');
      }
    },

    async writeTextDocument(path, content) {
      try {
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');
        await writeTextFile(assertTarget(root, path), content);
      } catch (error) {
        throw mapFsError(error, '保存文档');
      }
    },

    async readBinaryAsset(path) {
      try {
        const { readFile } = await import('@tauri-apps/plugin-fs');
        return await readFile(assertTarget(root, path));
      } catch (error) {
        throw mapFsError(error, '读取图片');
      }
    },

    async writeBinaryAsset(path, content) {
      try {
        const { writeFile } = await import('@tauri-apps/plugin-fs');
        await writeFile(assertTarget(root, path), content);
      } catch (error) {
        throw mapFsError(error, '写入图片');
      }
    },

    async copyFile(sourcePath, targetPath) {
      try {
        const fs = await import('@tauri-apps/plugin-fs');
        const safeTarget = assertTarget(root, targetPath);
        if (await fs.exists(safeTarget)) {
          throw new WorkspaceError('conflict', `目标文件已存在：${safeTarget}`);
        }
        await fs.copyFile(normalizeAbsolutePath(sourcePath), safeTarget);
      } catch (error) {
        if (error instanceof WorkspaceError) throw error;
        throw mapFsError(error, '复制文件');
      }
    },

    async createFile(path, content) {
      try {
        const fs = await import('@tauri-apps/plugin-fs');
        const target = assertTarget(root, path);
        if (await fs.exists(target)) {
          throw new WorkspaceError('conflict', `目标文件已存在：${target}`);
        }
        await fs.writeTextFile(target, content);
      } catch (error) {
        if (error instanceof WorkspaceError) throw error;
        throw mapFsError(error, '新建文件');
      }
    },

    async createDirectory(path) {
      try {
        const fs = await import('@tauri-apps/plugin-fs');
        const target = assertTarget(root, path);
        if (await fs.exists(target)) {
          throw new WorkspaceError('conflict', `目标目录已存在：${target}`);
        }
        await fs.mkdir(target);
      } catch (error) {
        if (error instanceof WorkspaceError) throw error;
        throw mapFsError(error, '新建目录');
      }
    },

    async renameEntry(from, to) {
      try {
        const fs = await import('@tauri-apps/plugin-fs');
        const source = assertTarget(root, from);
        const target = assertTarget(root, to);
        if (await fs.exists(target)) {
          throw new WorkspaceError('conflict', `目标路径已存在：${target}`);
        }
        await fs.rename(source, target);
      } catch (error) {
        if (error instanceof WorkspaceError) throw error;
        throw mapFsError(error, '重命名');
      }
    },

    async moveToRecycleBin(path) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('move_to_recycle_bin', { path: assertTarget(root, path) });
      } catch (error) {
        throw mapFsError(error, '移动到回收站');
      }
    },

    async revealInExplorer(path) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('reveal_in_explorer', { path: assertTarget(root, path) });
      } catch (error) {
        throw mapFsError(error, '在文件管理器中显示');
      }
    },

    async exists(path) {
      try {
        const { exists } = await import('@tauri-apps/plugin-fs');
        return await exists(assertTarget(root, path));
      } catch (error) {
        throw mapFsError(error, '检查路径');
      }
    },
  };
}
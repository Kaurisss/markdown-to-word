import { getParentPath, normalizeAbsolutePath, isPathWithinWorkspace } from './pathUtils';
import { WORKSPACE_METADATA_DIRECTORY } from './types';
import { WorkspaceError } from './workspaceErrors';

export interface WorkspaceWatchEvent {
  paths: string[];
}

export type WorkspaceWatchCallback = (changedDirectories: string[]) => void;
export type WorkspaceWatchSubscribe = (
  path: string,
  callback: (event: WorkspaceWatchEvent) => void,
) => Promise<() => void>;

export interface WorkspaceWatcherOptions {
  workspaceRoot: string;
  onChange: WorkspaceWatchCallback;
  debounceMs?: number;
  subscribe?: WorkspaceWatchSubscribe;
}

export interface WorkspaceWatcherHandle {
  stop(): Promise<void>;
}

function isMetadataPath(workspaceRoot: string, path: string): boolean {
  const relative = normalizeAbsolutePath(path)
    .slice(normalizeAbsolutePath(workspaceRoot).length)
    .replace(/^[/\\]+/, '');
  return relative === WORKSPACE_METADATA_DIRECTORY
    || relative.startsWith(`${WORKSPACE_METADATA_DIRECTORY}/`);
}

function getAffectedDirectories(workspaceRoot: string, paths: readonly string[]): string[] {
  const root = normalizeAbsolutePath(workspaceRoot);
  const directories = new Set<string>();

  for (const path of paths) {
    let normalized: string;
    try {
      normalized = normalizeAbsolutePath(path);
    } catch {
      continue;
    }

    if (!isPathWithinWorkspace(root, normalized) || isMetadataPath(root, normalized)) continue;
    directories.add(getParentPath(normalized));
  }

  return [...directories];
}

async function subscribeWithTauri(
  workspaceRoot: string,
  callback: (event: WorkspaceWatchEvent) => void,
): Promise<() => void> {
  const { watch } = await import('@tauri-apps/plugin-fs');
  return watch(workspaceRoot, callback, { recursive: true, delayMs: 300 });
}

export async function startWorkspaceWatcher(
  options: WorkspaceWatcherOptions,
): Promise<WorkspaceWatcherHandle> {
  const root = normalizeAbsolutePath(options.workspaceRoot);
  const subscribe = options.subscribe ?? subscribeWithTauri;
  const debounceMs = options.debounceMs ?? 300;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingDirectories = new Set<string>();

  const flush = (): void => {
    timer = undefined;
    if (stopped || pendingDirectories.size === 0) return;
    const directories = [...pendingDirectories];
    pendingDirectories = new Set();
    options.onChange(directories);
  };

  const unwatch = await subscribe(root, (event) => {
    if (stopped) return;
    for (const directory of getAffectedDirectories(root, event.paths)) {
      pendingDirectories.add(directory);
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, debounceMs);
  });

  return {
    async stop() {
      if (stopped) return;
      stopped = true;
      if (timer) clearTimeout(timer);
      pendingDirectories = new Set();
      try {
        await unwatch();
      } catch (error) {
        throw new WorkspaceError('io-error', '停止工作区监听失败', error);
      }
    },
  };
}
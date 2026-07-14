import React from 'react';
import {
  FileNewLine,
  FolderOpenLine,
  NewFolderLine,
  Refresh1Line,
} from '@mingcute/react';
import { Button } from '@/components/ui/button';
import { createConflictFreeFileName } from '@/features/workspace/resourceResolver';
import { joinWorkspacePath } from '@/features/workspace/pathUtils';
import { useWorkspaceStore } from '@/features/workspace/store';

const EMPTY_WORKSPACE_ENTRIES = [] as const;

export function WorkspaceToolbar() {
  const root = useWorkspaceStore((state) => state.workspaceRoot);
  const fs = useWorkspaceStore((state) => state.fs);
  const entries = useWorkspaceStore((state) => root ? state.directoryEntries[root] ?? EMPTY_WORKSPACE_ENTRIES : EMPTY_WORKSPACE_ENTRIES);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const refreshDirectory = useWorkspaceStore((state) => state.refreshDirectory);
  const openDocument = useWorkspaceStore((state) => state.openDocument);

  const createDocument = async () => {
    if (!root || !fs) return;
    const name = createConflictFreeFileName('未命名.md', entries.map((entry) => entry.name));
    const path = joinWorkspacePath(root, name);
    await fs.createFile(path, '');
    await refreshDirectory(root);
    await openDocument(path, { autoSave: true });
  };

  const createDirectory = async () => {
    if (!root || !fs) return;
    const name = createConflictFreeFileName('新建文件夹', entries.map((entry) => entry.name));
    await fs.createDirectory(joinWorkspacePath(root, name));
    await refreshDirectory(root);
  };

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <Button variant="outline" size="sm" onClick={() => void openWorkspace()} className="mr-auto h-8 text-xs">
        <FolderOpenLine />
        打开文件夹
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => void createDocument()} disabled={!root} aria-label="新建 Markdown">
        <FileNewLine />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => void createDirectory()} disabled={!root} aria-label="新建文件夹">
        <NewFolderLine />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => root && void refreshDirectory(root)}
        disabled={!root}
        aria-label="刷新工作区"
      >
        <Refresh1Line />
      </Button>
    </div>
  );
}
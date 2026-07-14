import React from 'react';
import { FolderOpenLine } from '@mingcute/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useSettingsStore } from '@/features/settings/store';
import { useWorkspaceStore } from '@/features/workspace/store';
import { WorkspaceSearch } from './WorkspaceSearch';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { WorkspaceTree } from './WorkspaceTree';
import { ImageInspector } from './ImageInspector';

async function requestDirtyDecision(): Promise<'save' | 'discard' | 'cancel'> {
  if (window.confirm('当前文档有未保存修改。是否先保存再切换？')) return 'save';
  if (window.confirm('是否放弃未保存修改并继续切换？')) return 'discard';
  return 'cancel';
}

export function WorkspaceSheet() {
  const { settings } = useSettingsStore();
  const open = useWorkspaceStore((state) => state.sheetOpen);
  const setOpen = useWorkspaceStore((state) => state.setSheetOpen);
  const root = useWorkspaceStore((state) => state.workspaceRoot);
  const rootName = useWorkspaceStore((state) => state.workspaceName);
  const recent = useWorkspaceStore((state) => state.recentWorkspaces);
  const query = useWorkspaceStore((state) => state.searchQuery);
  const setQuery = useWorkspaceStore((state) => state.setSearchQuery);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const error = useWorkspaceStore((state) => state.error);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <header className="border-b border-ui-border-subtle px-4 pb-3 pt-4">
          <SheetTitle className="pr-8 text-sm font-semibold text-ui-text">工作区</SheetTitle>
          <p className="mt-1 truncate text-[11px] text-ui-text-muted">
            {rootName ?? '选择一个包含 Markdown 的文件夹'}
          </p>
        </header>

        <WorkspaceToolbar />
        <WorkspaceSearch value={query} onChange={setQuery} />

        {root ? (
          <WorkspaceTree
            query={query}
            autoSave={settings.autoSave}
            onRequestDirtyDecision={requestDirtyDecision}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-4 py-6">
            <div className="rounded-xl border border-dashed border-ui-border bg-ui-surface-subtle px-5 py-7 text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-lg bg-ui-surface text-ui-text-muted shadow-sm">
                <FolderOpenLine className="size-5" />
              </span>
              <p className="mt-3 text-sm font-medium text-ui-text">打开普通文件夹</p>
              <p className="mt-1 text-xs leading-5 text-ui-text-muted">文档与相对图片路径会保持原样。</p>
              <Button size="sm" className="mt-4" onClick={() => void openWorkspace()}>选择工作区</Button>
            </div>

            {recent.length > 0 && (
              <div className="mt-6 min-h-0">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ui-text-muted">最近使用</p>
                <div className="space-y-1">
                  {recent.map((workspace) => (
                    <button
                      key={workspace.absolutePath}
                      type="button"
                      onClick={() => void openWorkspace(workspace.absolutePath)}
                      className="w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-ui-control-hover"
                    >
                      <span className="block truncate text-xs font-medium text-ui-text">{workspace.name}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-ui-text-muted">{workspace.absolutePath}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ImageInspector />

        {error && (
          <p className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
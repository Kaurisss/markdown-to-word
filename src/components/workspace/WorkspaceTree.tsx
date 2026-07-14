import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DownSmallLine,
  FileLine,
  FolderLine,
  FolderOpenLine,
  PicLine,
  RightSmallLine,
} from '@mingcute/react';
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { cn } from '@/lib/utils';
import type { WorkspaceEntry } from '@/features/workspace/types';
import { useWorkspaceStore } from '@/features/workspace/store';

interface WorkspaceTreeProps {
  query: string;
  autoSave: boolean;
  onRequestDirtyDecision: () => Promise<'save' | 'discard' | 'cancel'>;
}

function iconFor(entry: WorkspaceEntry, expanded: boolean) {
  if (entry.kind === 'directory') {
    return expanded
      ? <FolderOpenLine className="size-4 text-amber-500" />
      : <FolderLine className="size-4 text-amber-500" />;
  }
  if (entry.kind === 'image') return <PicLine className="size-4 text-sky-500" />;
  return <FileLine className="size-4 text-ui-text-muted" />;
}

export function WorkspaceTree({
  query,
  autoSave,
  onRequestDirtyDecision,
}: WorkspaceTreeProps) {
  const root = useWorkspaceStore((state) => state.workspaceRoot);
  const rootName = useWorkspaceStore((state) => state.workspaceName);
  const directoryEntries = useWorkspaceStore((state) => state.directoryEntries);
  const activeDocument = useWorkspaceStore((state) => state.activeDocument);
  const selectedImagePath = useWorkspaceStore((state) => state.selectedImagePath);
  const loadDirectory = useWorkspaceStore((state) => state.loadDirectory);
  const openDocument = useWorkspaceStore((state) => state.openDocument);
  const setSelectedImagePath = useWorkspaceStore((state) => state.setSelectedImagePath);
  const [expandedItems, setExpandedItems] = useState<string[]>(() => root ? [root] : []);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    setExpandedItems(root ? [root] : []);
    setSelectedItems([]);
  }, [root]);

  const itemMap = useMemo(() => {
    const map = new Map<string, WorkspaceEntry>();
    if (root) {
      map.set(root, {
        id: root,
        kind: 'directory',
        name: rootName ?? root,
        absolutePath: root,
        relativePath: '',
        parentPath: null,
        hasChildren: true,
      });
    }
    Object.values(directoryEntries).flat().forEach((entry) => map.set(entry.absolutePath, entry));
    return map;
  }, [directoryEntries, root, rootName]);

  const setExpanded = useCallback((next: string[]) => {
    setExpandedItems(next);
    for (const itemId of next) {
      const entry = itemMap.get(itemId);
      if (entry?.kind === 'directory' && !directoryEntries[itemId]) {
        void loadDirectory(itemId);
      }
    }
  }, [directoryEntries, itemMap, loadDirectory]);

  const tree = useTree<WorkspaceEntry>({
    rootItemId: root ?? '__workspace_root__',
    state: { expandedItems, selectedItems },
    setExpandedItems: setExpanded,
    setSelectedItems,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().kind === 'directory',
    dataLoader: {
      getItem: (itemId) => itemMap.get(itemId) ?? {
        id: itemId,
        kind: 'directory',
        name: itemId,
        absolutePath: itemId,
        relativePath: '',
        parentPath: null,
      },
      getChildren: (itemId) => (directoryEntries[itemId] ?? []).map((entry) => entry.absolutePath),
    },
    onPrimaryAction: (item) => {
      const entry = item.getItemData();
      if (entry.kind === 'directory') {
        if (item.isExpanded()) item.collapse();
        else item.expand();
        return;
      }
      if (entry.kind === 'image') {
        setSelectedImagePath(entry.absolutePath);
        return;
      }
      void openDocument(entry.absolutePath, {
        autoSave,
        resolveDirty: async () => onRequestDirtyDecision(),
      });
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  if (!root) return null;

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const items = tree.getItems().filter((item) => {
    if (item.getId() === root) return !normalizedQuery;
    if (!normalizedQuery) return true;
    return item.getItemName().toLocaleLowerCase().includes(normalizedQuery);
  });

  return (
    <div {...tree.getContainerProps('工作区文件')} className="min-h-0 flex-1 overflow-y-auto px-2 py-2 outline-none">
      {items.map((item) => {
        const entry = item.getItemData();
        const level = item.getId() === root ? 0 : item.getItemMeta().level;
        const active = entry.absolutePath === activeDocument?.absolutePath;
        const selectedImage = entry.absolutePath === selectedImagePath;
        return (
          <button
            {...item.getProps()}
            key={item.getKey()}
            type="button"
            onDoubleClick={() => item.primaryAction()}
            className={cn(
              'group flex h-8 w-full items-center gap-1.5 rounded-md pr-2 text-left text-[13px] text-ui-text outline-none transition-colors',
              'hover:bg-ui-control-hover focus-visible:ring-1 focus-visible:ring-brand-500',
              (item.isSelected() || selectedImage) && 'bg-ui-surface-subtle',
              active && 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
            )}
            style={{ paddingLeft: `${8 + level * 16}px` }}
          >
            <span className="grid size-4 shrink-0 place-items-center text-ui-text-muted">
              {entry.kind === 'directory'
                ? item.isExpanded()
                  ? <DownSmallLine className="size-3.5" />
                  : <RightSmallLine className="size-3.5" />
                : null}
            </span>
            {iconFor(entry, item.isExpanded())}
            <span className="min-w-0 flex-1 truncate">{entry.name}</span>
            {activeDocument?.dirty && active && (
              <span className="size-1.5 shrink-0 rounded-full bg-amber-500" aria-label="未保存" />
            )}
          </button>
        );
      })}
      {normalizedQuery && items.length === 0 && (
        <p className="px-3 py-8 text-center text-xs text-ui-text-muted">没有匹配的文件</p>
      )}
    </div>
  );
}
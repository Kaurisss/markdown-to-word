import { importImageToWorkspace } from './imageImport';
import { getParentPath, normalizeAbsolutePath } from './pathUtils';
import { startWorkspaceWatcher, type WorkspaceWatcherHandle } from './workspaceWatcher';
import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { DocumentConfig } from '@/types/config';
import { useWorkspaceStore } from './store';

interface UseWorkspaceDocumentOptions {
  autoSave: boolean;
  updateEditorContent: (content: string) => void;
  replaceEditorContent: (content: string) => void;
  setConfig: Dispatch<SetStateAction<DocumentConfig>>;
  showError: (message: string) => void;
}

export interface WorkspaceImageImporter {
  importImage: (sourceFileName: string, content: Uint8Array) => Promise<string | null>;
}

export function useWorkspaceDocument(options: UseWorkspaceDocumentOptions) {
  const {
    autoSave,
    updateEditorContent,
    replaceEditorContent,
    setConfig,
    showError,
  } = options;
  const workspaceRoot = useWorkspaceStore((state) => state.workspaceRoot);
  const activeDocumentPath = useWorkspaceStore((state) => state.activeDocument?.absolutePath ?? null);
  const recentWorkspaces = useWorkspaceStore((state) => state.recentWorkspaces);
  const openWorkspace = useWorkspaceStore((state) => state.openWorkspace);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const lastWorkspace = recentWorkspaces[0];
    if (lastWorkspace) {
      void openWorkspace(lastWorkspace.absolutePath);
    }
  }, [openWorkspace, recentWorkspaces]);

  useEffect(() => {
    if (!workspaceRoot) return;

    let disposed = false;
    let watcher: WorkspaceWatcherHandle | null = null;

    const handleChanges = async (directories: string[]) => {
      if (disposed) return;
      await Promise.all(directories.map((directory) => (
        useWorkspaceStore.getState().refreshDirectory(directory).catch(() => undefined)
      )));

      const state = useWorkspaceStore.getState();
      const active = state.activeDocument;
      if (!active || !directories.some((directory) => normalizeAbsolutePath(directory) === getParentPath(active.absolutePath))) {
        return;
      }

      try {
        const nextContent = await state.fs?.readTextDocument(active.absolutePath);
        if (nextContent === undefined || nextContent === active.content) return;
        if (active.dirty) {
          showError('当前文档已被外部修改，未保存内容未被覆盖');
          return;
        }
        state.reloadActiveDocument(nextContent);
        replaceEditorContent(nextContent);
      } catch (error) {
        showError(error instanceof Error ? error.message : String(error));
      }
    };

    void startWorkspaceWatcher({ workspaceRoot, onChange: (directories) => void handleChanges(directories) })
      .then((handle) => {
        if (disposed) {
          void handle.stop();
        } else {
          watcher = handle;
        }
      })
      .catch((error: unknown) => {
        if (!disposed) showError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      disposed = true;
      if (watcher) void watcher.stop();
    };
  }, [workspaceRoot, replaceEditorContent, showError]);

  useEffect(() => {
    if (!activeDocumentPath) return;
    const document = useWorkspaceStore.getState().activeDocument;
    if (!document || document.absolutePath !== activeDocumentPath) return;
    replaceEditorContent(document.content);
    setConfig(document.config);
  }, [activeDocumentPath, replaceEditorContent, setConfig]);

  const updateContent = useCallback((content: string) => {
    updateEditorContent(content);
    if (useWorkspaceStore.getState().activeDocument) {
      useWorkspaceStore.getState().updateActiveContent(content);
    }
  }, [updateEditorContent]);

  const updateConfig = useCallback((config: DocumentConfig) => {
    setConfig(config);
    if (!useWorkspaceStore.getState().activeDocument) return;
    void useWorkspaceStore.getState().updateActiveConfig(config).catch((error: unknown) => {
      showError(error instanceof Error ? error.message : String(error));
    });
  }, [setConfig, showError]);

  const save = useCallback(async (content: string) => {
    const state = useWorkspaceStore.getState();
    if (!state.activeDocument) return;
    state.updateActiveContent(content);
    if (!await state.saveActiveDocument()) {
      showError(useWorkspaceStore.getState().error ?? '自动保存失败');
    }
  }, [showError]);

  const importImage = useCallback(async (sourceFileName: string, content: Uint8Array) => {
    const state = useWorkspaceStore.getState();
    if (!state.fs || !state.activeDocument) {
      showError('请先打开工作区中的 Markdown 文档');
      return null;
    }

    try {
      return await importImageToWorkspace({
        fs: state.fs,
        markdownPath: state.activeDocument.absolutePath,
        sourceFileName,
        content,
      });
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
      return null;
    }
  }, [showError]);

  return {
    workspaceRoot,
    activeDocumentPath,
    updateContent,
    updateConfig,
    importImage,
    autoSaveHandler: workspaceRoot && autoSave ? save : undefined,
  };
}
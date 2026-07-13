import { useState, useEffect, useCallback, useRef } from 'react';
import { ToastType } from '../../components/shell/Toast';

interface UseFileDropOptions {
  enabled: boolean;
  showToast: (message: string, type?: ToastType) => void;
  onImport: (content: string) => void;
}

export function useFileDrop({ enabled, showToast, onImport }: UseFileDropOptions) {
  const [isFileDragActive, setIsFileDragActive] = useState(false);
  const fileDragCounterRef = useRef(0);

  const isSupportedImportFile = useCallback((file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith('.md') || name.endsWith('.markdown') || name.endsWith('.txt');
  }, []);

  const isSupportedImportPath = useCallback((path: string) => {
    const lower = path.toLowerCase();
    return lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt');
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const isFileDrag = (e: DragEvent) => {
      const dt = e.dataTransfer;
      if (!dt) return false;
      try {
        const hasFiles = dt.files && dt.files.length > 0;
        const hasFileItems = Array.from(dt.items || []).some(item => item.kind === 'file');
        const hasFileType = Array.from(dt.types || []).includes('Files');
        return hasFiles || hasFileItems || hasFileType;
      } catch {
        return false;
      }
    };

    const handleDragEnter = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      if (!enabled) return;
      fileDragCounterRef.current += 1;
      setIsFileDragActive(true);
    };

    const handleDragOver = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      fileDragCounterRef.current = Math.max(0, fileDragCounterRef.current - 1);
      if (fileDragCounterRef.current === 0) {
        setIsFileDragActive(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();

      fileDragCounterRef.current = 0;
      setIsFileDragActive(false);
      if (!enabled) return;

      const files = e.dataTransfer?.files;
      const file = files && files.length > 0 ? files[0] : null;
      if (!file) return;

      if (!isSupportedImportFile(file)) {
        showToast('仅支持拖入 .md / .markdown / .txt 文件', 'error');
        return;
      }

      try {
        const text = await file.text();
        onImport(text);
        showToast(`已导入：${file.name}`);
      } catch (err) {
        console.error('Failed to import dropped file:', err);
        showToast('导入失败：无法读取文件内容', 'error');
      }
    };

    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    let unlistenTauriDrop: (() => void) | undefined;
    let disposed = false;

    const setupTauriFileDrop = async () => {
      try {
        const { getCurrentWebview } = await import('@tauri-apps/api/webview');
        const { readTextFile } = await import('@tauri-apps/plugin-fs');
        const webview = getCurrentWebview();

        const unlisten = await webview.onDragDropEvent(async ({ payload }) => {
          if (payload.type === 'enter' || payload.type === 'over') {
            setIsFileDragActive(true);
            return;
          }

          if (payload.type === 'leave') {
            setIsFileDragActive(false);
            return;
          }

          if (payload.type !== 'drop') return;

          setIsFileDragActive(false);
          const filePath = payload.paths?.[0];
          if (!filePath) return;

          if (!isSupportedImportPath(filePath)) {
            showToast('仅支持拖入 .md / .markdown / .txt 文件', 'error');
            return;
          }

          try {
            const text = await readTextFile(filePath);
            onImport(text);
            const name = filePath.split(/[/\\]/).pop() ?? filePath;
            showToast(`已导入：${name}`);
          } catch (err) {
            console.error('Failed to import dropped file:', err);
            showToast('导入失败：无法读取文件内容', 'error');
          }
        });
        if (disposed) {
          unlisten();
        } else {
          unlistenTauriDrop = unlisten;
        }
      } catch (err) {
        console.debug('Tauri file drop not available', err);
      }
    };

    setupTauriFileDrop();

    return () => {
      disposed = true;
      document.removeEventListener('dragenter', handleDragEnter, true);
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
      if (unlistenTauriDrop) unlistenTauriDrop();
    };
  }, [enabled, showToast, onImport, isSupportedImportFile, isSupportedImportPath]);

  return {
    isFileDragActive,
  };
}

import { useEffect } from 'react';
import { saveAutoSaveContent } from '../settings/store';

interface UseAutoSaveOptions {
  content: string;
  autoSave: boolean;
}

export function useAutoSave({ content, autoSave }: UseAutoSaveOptions) {
  useEffect(() => {
    if (!autoSave) return;
    const timer = window.setTimeout(() => {
      saveAutoSaveContent(content);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [content, autoSave]);
}

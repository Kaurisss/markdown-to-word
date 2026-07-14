import { useEffect } from 'react';
import { saveAutoSaveContent } from '../settings/store';

interface UseAutoSaveOptions {
  content: string;
  autoSave: boolean;
  onSave?: (content: string) => void | Promise<void>;
}

export function useAutoSave({ content, autoSave, onSave }: UseAutoSaveOptions) {
  useEffect(() => {
    if (!autoSave) return;
    const timer = window.setTimeout(() => {
      if (onSave) {
        void onSave(content);
        return;
      }
      saveAutoSaveContent(content);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [content, autoSave, onSave]);
}

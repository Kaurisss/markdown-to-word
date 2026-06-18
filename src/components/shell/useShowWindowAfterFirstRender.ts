import { useEffect } from 'react';

export function useShowWindowAfterFirstRender() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void import('@tauri-apps/api/window')
        .then(({ getCurrentWindow }) => getCurrentWindow().show())
        .catch(() => {
          // Ignore when running outside Tauri.
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);
}

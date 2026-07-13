import { useState, useEffect, useRef } from 'react';

interface UseThemeOptions {
  appSettingsTheme: 'light' | 'dark';
}

export function useTheme({ appSettingsTheme }: UseThemeOptions) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return appSettingsTheme;
    const stored = localStorage.getItem('app_theme');
    return stored === 'dark' || stored === 'light' ? stored : appSettingsTheme;
  });

  const isFirstThemePaintRef = useRef(true);
  const hasShownMainWindowRef = useRef(false);

  // Apply theme to document
  useEffect(() => {
    const isDark = theme === 'dark';
    const root = document.documentElement;

    let transitionTimer: number | undefined;
    if (isFirstThemePaintRef.current) {
      isFirstThemePaintRef.current = false;
    } else {
      root.classList.add('theme-switching');
      transitionTimer = window.setTimeout(() => {
        root.classList.remove('theme-switching');
      }, 320);
    }

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.backgroundColor = isDark ? '#1e1e1e' : '#f9fafb';
    root.style.colorScheme = isDark ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme', theme);
    }

    const syncWindowBackground = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const currentWindow = getCurrentWindow();
        await currentWindow.setBackgroundColor(isDark ? '#1e1e1e' : '#f9fafb');
        await currentWindow.setTheme(isDark ? 'dark' : 'light');
        if (!hasShownMainWindowRef.current) {
          await currentWindow.show();
          hasShownMainWindowRef.current = true;
        }
      } catch {
        // Ignore when running in browser mode.
        // If running in Tauri and the style sync failed, still try to show the main window once.
        if (!hasShownMainWindowRef.current) {
          try {
            const { getCurrentWindow } = await import('@tauri-apps/api/window');
            await getCurrentWindow().show();
            hasShownMainWindowRef.current = true;
          } catch {
            // noop
          }
        }
      }
    };

    void syncWindowBackground();

    return () => {
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, [theme]);

  // Keep the main window theme synced with persisted settings.
  useEffect(() => {
    if (appSettingsTheme !== theme) {
      setTheme(appSettingsTheme);
    }
  }, [appSettingsTheme, theme]);

  return {
    theme,
  };
}

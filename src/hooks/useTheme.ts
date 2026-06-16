import { useState, useEffect, useRef } from 'react';

interface UseThemeOptions {
  isConfigWindow: boolean;
  isSettingsWindow: boolean;
  appSettingsTheme: 'light' | 'dark';
}

export function useTheme({ isConfigWindow, isSettingsWindow, appSettingsTheme }: UseThemeOptions) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const params = new URLSearchParams(window.location.search);
    const queryTheme = params.get('theme');
    if (queryTheme === 'dark' || queryTheme === 'light') {
      return queryTheme;
    }
    const stored = localStorage.getItem('app_theme');
    return stored === 'dark' || stored === 'light' ? stored : 'light';
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
        if (!isConfigWindow && !isSettingsWindow && !hasShownMainWindowRef.current) {
          await currentWindow.show();
          hasShownMainWindowRef.current = true;
        }
      } catch {
        // Ignore when running in browser mode.
        // If running in Tauri and the style sync failed, still try to show the main window once.
        if (!isConfigWindow && !isSettingsWindow && !hasShownMainWindowRef.current) {
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
  }, [theme, isConfigWindow, isSettingsWindow]);

  // Keep main window theme synced with settings window changes.
  useEffect(() => {
    if (isConfigWindow || isSettingsWindow) return;
    if (appSettingsTheme !== theme) {
      setTheme(appSettingsTheme);
    }
  }, [appSettingsTheme, theme, isConfigWindow, isSettingsWindow]);

  return {
    theme,
    setTheme,
  };
}

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface IThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<IThemeContextValue | undefined>(undefined);

interface IThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider(props: IThemeProviderProps): React.JSX.Element {
  const { children } = props;
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clear the pending theme-transition timer on unmount so it can't fire after the
  // component (and, in tests, the jsdom document) is gone.
  useEffect((): (() => void) => {
    return (): void => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  useEffect((): (() => void) | undefined => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const initialTheme = storedTheme || 'system';
    setThemeState(initialTheme);

    const updateResolvedTheme = (): void => {
      if (initialTheme === 'system') {
        const isDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(isDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
      }
    };

    updateResolvedTheme();

    if (initialTheme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent): void => {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      };

      mediaQuery?.addEventListener('change', handleChange);
      return () => {
        mediaQuery?.removeEventListener('change', handleChange);
      };
    }

    return undefined;
  }, []);

  const setTheme = (newTheme: 'light' | 'dark' | 'system'): void => {
    document.documentElement.classList.add('theme-transitioning');

    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const isDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 150);
  };

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): IThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

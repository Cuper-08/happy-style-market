/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
  isAdminTheme: boolean;
  setIsAdminTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'bras-conceito-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to light theme for customer-facing pages
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'light';
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');
  const [isAdminTheme, setIsAdminTheme] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    const getSystemTheme = (): 'dark' | 'light' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (newTheme: Theme) => {
      let resolved: 'dark' | 'light';

      if (isAdminTheme) {
        // Admin area respects theme preference
        resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
      } else {
        // Customer area: always light theme for main content
        // Header/footer/mobile-nav handle their own dark styling via CSS classes
        resolved = 'light';
      }

      setResolvedTheme(resolved);

      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isAdminTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isAdminTheme, setIsAdminTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

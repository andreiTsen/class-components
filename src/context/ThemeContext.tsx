import { useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContextValue';

type ThemeProviderProperties = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProperties) {
  const [theme, setTheme] = useState<Theme>('light');

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setTheme((currentTheme) =>
          currentTheme === 'light' ? 'dark' : 'light'
        );
      },
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="theme-root" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

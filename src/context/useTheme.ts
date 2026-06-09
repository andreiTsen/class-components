import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './themeContextValue';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme used outside ThemeProvider');
  }

  return context;
}

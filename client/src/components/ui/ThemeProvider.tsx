import React, { createContext, useContext, ReactNode } from 'react';
import theme from '../../lib/theme';

// Create a context with the theme
export const ThemeContext = createContext(theme);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  themeOverride?: Partial<typeof theme>;
}

/**
 * ThemeProvider component
 * 
 * Provides theme values to all child components via React Context.
 * Accepts an optional themeOverride prop to customize the theme.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  themeOverride 
}) => {
  // Merge default theme with any overrides
  const mergedTheme = themeOverride 
    ? { ...theme, ...themeOverride }
    : theme;

  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme in any component
 * 
 * @returns The theme object
 */
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return theme;
};

export default ThemeProvider; 
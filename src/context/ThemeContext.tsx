import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material';
import { blue, purple, green, orange, grey, teal, indigo, pink, deepOrange } from '@mui/material/colors';

type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'indigo' | 'pink' | 'deepOrange';
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  currentTheme: Theme;
}

const colorMap: Record<ThemeColor, any> = {
  blue,
  purple,
  green,
  orange,
  teal,
  indigo,
  pink,
  deepOrange
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useThemeContext = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get saved theme preferences from localStorage
  const savedMode = localStorage.getItem('themeMode') as ThemeMode || 'system';
  const savedColor = localStorage.getItem('themeColor') as ThemeColor || 'teal';
  const savedSidebarState = localStorage.getItem('sidebarCollapsed') === 'true';

  const [mode, setMode] = useState<ThemeMode>(savedMode);
  const [themeColor, setThemeColor] = useState<ThemeColor>(savedColor);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(savedSidebarState);
  
  // Determine actual palette mode (light/dark) based on system preference if needed
  const [actualMode, setActualMode] = useState<PaletteMode>(
    mode === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light'
      : mode as PaletteMode
  );

  // Listen for system theme changes if using system theme
  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setActualMode(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setActualMode(mode as PaletteMode);
    }
  }, [mode]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [mode, themeColor, sidebarCollapsed]);

  // Create the MUI theme
  const theme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode: actualMode,
        primary: {
          main: colorMap[themeColor][actualMode === 'dark' ? 300 : 600],
        },
        secondary: {
          main: actualMode === 'dark' ? orange[300] : orange[700],
        },
        background: {
          default: actualMode === 'dark' ? '#121212' : '#f5f5f5',
          paper: actualMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 3px 5px 0 rgba(0, 0, 0, 0.12)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: actualMode === 'dark' 
                ? '0 4px 12px 0 rgba(0, 0, 0, 0.4)' 
                : '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: actualMode === 'dark' 
                  ? '0 12px 24px 0 rgba(0, 0, 0, 0.6)' 
                  : '0 12px 24px 0 rgba(0, 0, 0, 0.1)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
            elevation1: {
              boxShadow: actualMode === 'dark' 
                ? '0 2px 8px 0 rgba(0, 0, 0, 0.3)' 
                : '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              backdropFilter: 'blur(8px)',
              backgroundColor: actualMode === 'dark' 
                ? 'rgba(30, 30, 30, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              borderBottom: `1px solid ${actualMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: 'none',
              boxShadow: actualMode === 'dark' 
                ? '4px 0 8px 0 rgba(0, 0, 0, 0.3)' 
                : '4px 0 8px 0 rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              transition: 'all 0.2s ease',
            },
          },
        },
      },
    });
  }, [actualMode, themeColor]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleSetThemeColor = (newColor: ThemeColor) => {
    setThemeColor(newColor);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode: handleSetMode,
        themeColor,
        setThemeColor: handleSetThemeColor,
        sidebarCollapsed,
        toggleSidebar,
        currentTheme: theme,
      }}
    >
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    return savedTheme || 'system';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    
    // Determine if dark mode should be applied
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldApplyDark = 
      theme === 'dark' || 
      (theme === 'system' && systemDarkMode);
    
    if (shouldApplyDark) {
      root.classList.add('dark');
      setIsDarkMode(true);
    } else {
      root.classList.add('light');
      setIsDarkMode(false);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        
        if (mediaQuery.matches) {
          root.classList.add('dark');
          setIsDarkMode(true);
        } else {
          root.classList.add('light');
          setIsDarkMode(false);
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

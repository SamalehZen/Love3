import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeColors, darkTheme, lightTheme } from '../constants/theme';

console.log('[Love3 Debug] ThemeContext.tsx: Module loaded');

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
  theme: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('[Love3 Debug] ThemeProvider rendering');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    console.log('[Love3 Debug] ThemeProvider useEffect running');
    if (typeof window === 'undefined') {
      console.log('[Love3 Debug] Window undefined, skipping theme detection');
      return;
    }
    
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    console.log('[Love3 Debug] System prefers dark mode:', mq.matches);
    setIsDarkMode(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      console.log('[Love3 Debug] Theme preference changed:', e.matches);
      setIsDarkMode(e.matches);
    };
    mq.addEventListener('change', handler);
    
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    setIsDarkMode(dark);
  }, []);

  const theme: ThemeColors = isDarkMode ? darkTheme : lightTheme;

  console.log('[Love3 Debug] ThemeProvider providing context, isDarkMode:', isDarkMode);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error('[Love3 Debug] useTheme called outside ThemeProvider!');
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

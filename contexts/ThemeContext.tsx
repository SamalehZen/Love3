import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeColors, darkTheme, lightTheme } from '../constants/theme';

console.log('[Love3 Debug] ThemeContext.tsx: Module loaded');

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
  theme: ThemeColors;
}

const defaultThemeContext: ThemeContextType = {
  isDarkMode: true,
  toggleTheme: () => {},
  setTheme: () => {},
  theme: darkTheme
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  console.log('[Love3 Debug] ThemeProvider rendering');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('[Love3 Debug] ThemeProvider useEffect running');
    try {
      if (typeof window === 'undefined') {
        console.log('[Love3 Debug] Window undefined, using default dark mode');
        setIsReady(true);
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
      setIsReady(true);
      
      return () => mq.removeEventListener('change', handler);
    } catch (error) {
      console.error('[Love3 Debug] Error in ThemeProvider:', error);
      setIsReady(true);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    setIsDarkMode(dark);
  }, []);

  const theme: ThemeColors = isDarkMode ? darkTheme : lightTheme;

  console.log('[Love3 Debug] ThemeProvider ready:', isReady, 'isDarkMode:', isDarkMode);
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  console.log('[Love3 Debug] useTheme called, context exists:', !!context);
  return context;
};

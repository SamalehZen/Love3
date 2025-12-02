import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

export interface ThemeColors {
  bg: string;
  surface: string;
  textMain: string;
  textSub: string;
  border: string;
  overlay: string;
  cardBorder: string;
  cardShadow: string;
  sliderBg: string;
  shimmerText: string;
  iconBtnBg: string;
  iconBtnBorder: string;
  headerBg: string;
  chip: string;
  inputBg: string;
  inputBorder: string;
  userBubble: string;
  aiBubble: string;
  typingDot: string;
  suggestionBg: string;
  suggestionText: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
  theme: ThemeColors;
}

const darkTheme: ThemeColors = {
  bg: 'bg-[#0f0f0f]',
  surface: 'bg-surface border-white/5',
  textMain: 'text-white',
  textSub: 'text-gray-400',
  border: 'border-white/10',
  overlay: 'from-[#32D583]/20 via-[#121214] to-[#121214]',
  cardBorder: 'border-white/10',
  cardShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
  sliderBg: 'bg-[#1C1C1E] border-white/10',
  shimmerText: 'from-white/20 via-white to-white/20',
  iconBtnBg: 'bg-[#1C1C1E]',
  iconBtnBorder: 'border-white/10',
  headerBg: 'bg-[#121214]/90 border-white/5',
  chip: 'bg-chip border-white/5',
  inputBg: 'bg-surface',
  inputBorder: 'border-white/10',
  userBubble: 'bg-[#32D583] text-black',
  aiBubble: 'bg-surface border border-white/5 text-gray-200',
  typingDot: 'bg-gray-500',
  suggestionBg: 'bg-white/5 border-white/10 hover:bg-white/10',
  suggestionText: 'text-gray-300',
};

const lightTheme: ThemeColors = {
  bg: 'bg-[#F2F2F7]',
  surface: 'bg-white border-gray-200 shadow-sm',
  textMain: 'text-gray-900',
  textSub: 'text-gray-500',
  border: 'border-black/5',
  overlay: 'from-[#32D583]/10 via-[#F2F2F7] to-[#F2F2F7]',
  cardBorder: 'border-white',
  cardShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
  sliderBg: 'bg-white border-gray-200 shadow-sm',
  shimmerText: 'from-gray-400 via-gray-900 to-gray-400',
  iconBtnBg: 'bg-white',
  iconBtnBorder: 'border-black/5',
  headerBg: 'bg-white/90 border-gray-200',
  chip: 'bg-white border-gray-200 shadow-sm',
  inputBg: 'bg-white',
  inputBorder: 'border-gray-200',
  userBubble: 'bg-[#32D583] text-black',
  aiBubble: 'bg-white border border-gray-200 text-gray-800 shadow-sm',
  typingDot: 'bg-gray-400',
  suggestionBg: 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
  suggestionText: 'text-gray-700',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
  }, []);

  const theme = useMemo(() => isDarkMode ? darkTheme : lightTheme, [isDarkMode]);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme,
    setDarkMode,
    theme,
  }), [isDarkMode, toggleTheme, setDarkMode, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { darkTheme, lightTheme };

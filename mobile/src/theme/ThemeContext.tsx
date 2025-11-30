// ═══════════════════════════════════════════════════════
// THEME CONTEXT - КОНТЕКСТ ТЕМЫ ДЛЯ ПРИЛОЖЕНИЯ
// ═══════════════════════════════════════════════════════
// Файл: /Users/a00/mysterymeet/mobile/src/theme/ThemeContext.tsx
// 
// Что здесь:
// 1. ThemeProvider - провайдер темы для всего приложения
// 2. useTheme - хук для доступа к теме и переключения
// 3. Типы для TypeScript
// ═══════════════════════════════════════════════════════

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Theme, theme } from './index';
import { LightColors, DarkColors } from './colors';

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const currentTheme: Theme = {
    ...theme,
    colors: isDark ? DarkColors : LightColors,
  };

  const toggleTheme = () => setIsDark(!isDark);
  const setTheme = (dark: boolean) => setIsDark(dark);

  return (
    <ThemeContext.Provider value={{ 
      theme: currentTheme, 
      isDark, 
      toggleTheme, 
      setTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
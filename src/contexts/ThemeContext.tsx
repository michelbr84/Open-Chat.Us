import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'theme-light' | 'theme-dark' | 'theme-neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>('theme-neon');
  const [isInitialized, setIsInitialized] = useState(false);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('preferredTheme', newTheme);
    
    // Apply theme to document body
    document.body.className = `${newTheme} chat-mode`;
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['theme-neon', 'theme-dark', 'theme-light'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  useEffect(() => {
    // Load saved theme or default to neon
    const savedTheme = localStorage.getItem('preferredTheme') as Theme;
    const initialTheme = savedTheme || 'theme-neon';
    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  // Don't render children until context is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
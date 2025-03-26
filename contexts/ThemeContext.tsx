import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  activeTheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme() || 'light';
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('thaler_theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('thaler_theme', theme).catch(error => {
        console.error('Failed to save theme preference:', error);
      });
    }
  }, [theme, isLoading]);

  // Determine the active theme based on preference
  const activeTheme = theme === 'system' ? systemColorScheme : theme;

  // Function to set theme
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Function to toggle between light and dark
  const toggleTheme = () => {
    if (theme === 'system') {
      // If system, switch to the opposite of current system theme
      setThemeState(systemColorScheme === 'light' ? 'dark' : 'light');
    } else {
      // Otherwise toggle between light and dark
      setThemeState(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, setTheme, toggleTheme }}>
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

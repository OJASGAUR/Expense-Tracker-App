import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Default colors for light mode
const lightColors = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryLight: '#38bdf8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  gray: '#6b7280',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
  white: '#ffffff',
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

// Default colors for dark mode
const darkColors = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryLight: '#38bdf8',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  gray: '#9ca3af',
  grayLight: '#374151',
  grayDark: '#f3f4f6',
  white: '#1f2937',
  background: '#111827',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  border: '#374151',
};

export const ThemeProvider = ({ children }) => {
  // Initialize with light mode by default
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use system preference if no saved preference
        const systemTheme = Appearance.getColorScheme();
        setIsDarkMode(systemTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsReady(true);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Always provide colors - use light mode as default
  const colors = isDarkMode ? darkColors : lightColors;

  // Always provide colors, even during initialization
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors, isReady }}>
      {children}
    </ThemeContext.Provider>
  );
};

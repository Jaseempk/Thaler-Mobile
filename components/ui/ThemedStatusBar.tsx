import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemedStatusBar component that adapts to the current theme
 * This ensures the status bar is visible in both light and dark modes
 */
const ThemedStatusBar: React.FC = () => {
  const { activeTheme } = useTheme();
  
  // Use light status bar for dark theme and dark status bar for light theme
  const statusBarStyle = activeTheme === 'dark' ? 'light' : 'dark';
  
  return <StatusBar style={statusBarStyle} />;
};

export default ThemedStatusBar;

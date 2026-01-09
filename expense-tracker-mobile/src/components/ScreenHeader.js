// This component is no longer needed as headers are handled by navigation
// Keeping for backward compatibility but it won't be used
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const ScreenHeader = ({ title, subtitle }) => {
  // Headers are now handled by navigation, this is kept for compatibility
  return null;
};

export default ScreenHeader;

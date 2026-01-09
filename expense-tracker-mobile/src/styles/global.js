import { StyleSheet } from 'react-native';

// Legacy colors export for backward compatibility
export const colors = {
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
};

// Create global styles function that accepts theme colors
export const createGlobalStyles = (themeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
    padding: 16,
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: themeColors.text,
  },
  button: {
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: themeColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: themeColors.grayLight,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    color: themeColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.textSecondary,
    marginBottom: 16,
  },
  errorText: {
    color: themeColors.danger,
    fontSize: 14,
    marginBottom: 16,
    padding: 12,
    backgroundColor: themeColors.isDarkMode ? '#7f1d1d' : '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themeColors.isDarkMode ? '#991b1b' : '#fecaca',
  },
  text: {
    fontSize: 16,
    color: themeColors.text,
  },
  textSmall: {
    fontSize: 14,
    color: themeColors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Default global styles for backward compatibility
export const globalStyles = createGlobalStyles({
  background: colors.background,
  card: colors.white,
  text: colors.grayDark,
  textSecondary: colors.gray,
  border: colors.grayLight,
  primary: colors.primary,
  white: colors.white,
  grayLight: colors.grayLight,
  danger: colors.danger,
  isDarkMode: false,
});

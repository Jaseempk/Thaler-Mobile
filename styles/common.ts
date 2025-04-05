import { StyleSheet, Platform, ViewStyle } from 'react-native';
import Colors from '../constants/Colors';

/**
 * Common shadow styles for cards and elevated elements
 */
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    } as ViewStyle,
    android: {
      elevation: 4,
    } as ViewStyle,
  }) as ViewStyle,
  button: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } as ViewStyle,
    android: {
      elevation: 3,
    } as ViewStyle,
  }) as ViewStyle,
  subtle: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    } as ViewStyle,
    android: {
      elevation: 1,
    } as ViewStyle,
  }) as ViewStyle,
};

/**
 * Common typography styles for consistent text appearance
 */
export const typography = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
  },
  caption: {
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.8,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
  },
});

/**
 * Common layout styles for consistent spacing and structure
 */
export const layouts = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Get theme-aware styles based on the active theme
 * @param activeTheme The current active theme ('light' or 'dark')
 */
export const getThemedStyles = (activeTheme: 'light' | 'dark') => {
  return StyleSheet.create({
    card: {
      backgroundColor: Colors[activeTheme].card,
      borderColor: Colors[activeTheme].border,
      borderWidth: 1,
      ...layouts.card,
      ...shadows.card,
    },
    text: {
      color: Colors[activeTheme].text,
    },
    textSecondary: {
      color: Colors[activeTheme].textSecondary,
    },
    background: {
      backgroundColor: Colors[activeTheme].background,
    },
    secondaryBackground: {
      backgroundColor: Colors[activeTheme].secondaryLight,
    },
    input: {
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: Colors[activeTheme].text,
      borderWidth: 1,
      borderColor: Colors[activeTheme].border,
    },
  });
};

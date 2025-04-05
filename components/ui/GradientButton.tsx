import React from 'react';
import { 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  Platform,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  colors?: string[] | readonly [string, string];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  hapticFeedback?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

/**
 * A reusable gradient button component with consistent styling
 * Supports various sizes, variants, loading states, and haptic feedback
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  colors,
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 1 },
  style,
  textStyle,
  disabled = false,
  loading = false,
  hapticFeedback = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Medium,
  icon,
  size = 'medium',
  variant = 'primary'
}) => {
  const { activeTheme } = useTheme();
  const isDarkMode = activeTheme === 'dark';

  // Get gradient colors based on variant and theme
  const getGradientColors = (): readonly [string, string] => {
    if (colors && Array.isArray(colors) && colors.length >= 2) {
      return [colors[0], colors[1]] as readonly [string, string];
    }

    switch (variant) {
      case 'primary':
        return isDarkMode 
          ? ['#6B8AFF', '#454A75'] 
          : ['#6B8AFF', '#454A75'];
      case 'secondary':
        return isDarkMode 
          ? ['#6c757d', '#495057'] 
          : ['#6c757d', '#495057'];
      case 'success':
        return isDarkMode 
          ? ['#28a745', '#218838'] 
          : ['#28a745', '#218838'];
      case 'danger':
        return isDarkMode 
          ? ['#dc3545', '#c82333'] 
          : ['#dc3545', '#c82333'];
      default:
        return isDarkMode 
          ? ['#6B8AFF', '#454A75'] 
          : ['#6B8AFF', '#454A75'];
    }
  };

  // Get button size styles
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 16,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
        };
    }
  };

  // Get text size based on button size
  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      case 'medium':
      default:
        return 16;
    }
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(hapticStyle);
    }
    
    onPress();
  };

  return (
    <Pressable 
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#CCCCCC', '#AAAAAA'] as readonly [string, string] : getGradientColors()}
        start={startPoint}
        end={endPoint}
        style={[
          styles.gradient, 
          getSizeStyles(),
          style,
          Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size={size === 'small' ? 'small' : 'small'} />
        ) : (
          <>
            {icon}
            <Text 
              style={[
                styles.text, 
                { fontSize: getTextSize() },
                icon ? { marginLeft: 8 } : undefined,
                textStyle
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default GradientButton;

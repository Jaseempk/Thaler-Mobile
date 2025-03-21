import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View,
  Animated,
  Easing,
  Platform
} from 'react-native';
import Colors from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  icon,
}) => {
  // Animation value for press effect
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
  
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: Colors.light.primary,
          ...Platform.select({
            ios: {
              shadowColor: Colors.light.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            },
            android: {
              elevation: 5,
            },
          }),
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: Colors.light.secondary,
          ...Platform.select({
            ios: {
              shadowColor: Colors.light.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 2,
            },
          }),
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.light.primary,
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 16,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 24,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 28,
        };
        break;
    }
    
    // Disabled style
    if (disabled) {
      buttonStyle = {
        ...buttonStyle,
        opacity: 0.5,
      };
    }
    
    // Full width
    if (fullWidth) {
      buttonStyle = {
        ...buttonStyle,
        width: '100%',
      };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleObj: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };
    
    switch (variant) {
      case 'primary':
        textStyleObj = {
          ...textStyleObj,
          color: '#FFFFFF',
        };
        break;
      case 'secondary':
        textStyleObj = {
          ...textStyleObj,
          color: Colors.light.text,
        };
        break;
      case 'outline':
        textStyleObj = {
          ...textStyleObj,
          color: Colors.light.primary,
        };
        break;
    }
    
    switch (size) {
      case 'small':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 14,
        };
        break;
      case 'medium':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 16,
        };
        break;
      case 'large':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 18,
        };
        break;
    }
    
    return textStyleObj;
  };
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      <TouchableOpacity
        style={[styles.button, getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? Colors.light.primary : '#FFFFFF'} 
          />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.buttonText, getTextStyle(), textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View
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
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: Colors.light.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: Colors.light.secondary,
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
        alignItems: 'center',
      };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let style: TextStyle = {
      fontWeight: '600',
    };
    
    // Variant text color
    switch (variant) {
      case 'primary':
      case 'secondary':
        style = {
          ...style,
          color: '#FFFFFF',
        };
        break;
      case 'outline':
        style = {
          ...style,
          color: Colors.light.primary,
        };
        break;
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        style = {
          ...style,
          fontSize: 14,
        };
        break;
      case 'medium':
        style = {
          ...style,
          fontSize: 16,
        };
        break;
      case 'large':
        style = {
          ...style,
          fontSize: 18,
        };
        break;
    }
    
    return style;
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? Colors.light.primary : '#FFFFFF'} 
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text,
            getTextStyle(),
            disabled && styles.textDisabled,
            textStyle,
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button;

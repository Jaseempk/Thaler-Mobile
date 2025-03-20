import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = () => {
    let cardStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'default':
        cardStyle = {
          backgroundColor: Colors.light.card,
          borderRadius: 12,
        };
        break;
      case 'elevated':
        cardStyle = {
          backgroundColor: Colors.light.card,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
        break;
      case 'outlined':
        cardStyle = {
          backgroundColor: Colors.light.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
        break;
    }
    
    // Padding styles
    switch (padding) {
      case 'none':
        cardStyle = {
          ...cardStyle,
          padding: 0,
        };
        break;
      case 'small':
        cardStyle = {
          ...cardStyle,
          padding: 8,
        };
        break;
      case 'medium':
        cardStyle = {
          ...cardStyle,
          padding: 16,
        };
        break;
      case 'large':
        cardStyle = {
          ...cardStyle,
          padding: 24,
        };
        break;
    }
    
    return cardStyle;
  };
  
  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({});

export default Card;

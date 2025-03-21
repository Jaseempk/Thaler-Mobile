import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform, Animated, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
  onPress,
}) => {
  const getCardStyle = () => {
    let cardStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'default':
        cardStyle = {
          backgroundColor: Colors.light.card,
          borderRadius: 16,
        };
        break;
      case 'elevated':
        cardStyle = {
          backgroundColor: Colors.light.card,
          borderRadius: 16,
          ...Platform.select({
            ios: {
              shadowColor: Colors.light.shadow,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
            android: {
              elevation: 6,
            },
          }),
        };
        break;
      case 'outlined':
        cardStyle = {
          backgroundColor: Colors.light.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
        break;
      case 'glass':
        cardStyle = {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          ...Platform.select({
            ios: {
              shadowColor: Colors.light.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 4,
            },
          }),
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
          padding: 12,
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
  
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer 
      style={[styles.card, getCardStyle(), style]}
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
    >
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default Card;

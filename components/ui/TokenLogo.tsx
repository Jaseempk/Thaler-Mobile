import React from 'react';
import { View, Image, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getEthereumLogo } from '../../utils/themeUtils';

interface TokenLogoProps {
  symbol: string;
  size?: number;
  showFallback?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  style?: any;
}

/**
 * A reusable component for displaying token logos with consistent styling
 * Supports ETH and USDC tokens with appropriate logos and fallback for other tokens
 */
const TokenLogo: React.FC<TokenLogoProps> = ({
  symbol,
  size = 40,
  showFallback = true,
  backgroundColor,
  borderColor,
  style
}) => {
  const { activeTheme } = useTheme();
  
  // Get the appropriate logo source based on token symbol
  const getLogoSource = () => {
    if (symbol === 'ETH') {
      return getEthereumLogo(activeTheme);
    } else if (symbol === 'USDC') {
      return require('../../assets/images/usdc.png');
    } else {
      return null;
    }
  };
  
  const logoSource = getLogoSource();
  
  // Get the appropriate background color based on token symbol
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    if (symbol === 'ETH') {
      return '#454A75';
    } else if (symbol === 'USDC') {
      return '#2775CA';
    } else {
      return '#AAAAAA';
    }
  };
  
  // Create dynamic styles based on props
  const dynamicStyles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(80, 80, 100, 0.5)',
      borderWidth: 1,
      borderColor: borderColor || 'rgba(255, 255, 255, 0.4)',
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    fallbackContainer: {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getBackgroundColor(),
      borderWidth: 1,
      borderColor: borderColor || 'rgba(255, 255, 255, 0.4)',
    },
    logo: {
      width: size * 0.8,
      height: size * 0.8,
      resizeMode: 'contain',
    },
    fallbackText: {
      color: '#FFFFFF',
      fontSize: size * 0.4,
      fontWeight: '600',
    },
  });

  // Render the logo if available, otherwise show fallback
  if (logoSource) {
    return (
      <View style={[dynamicStyles.container, style]}>
        <Image source={logoSource} style={dynamicStyles.logo} />
      </View>
    );
  } else if (showFallback) {
    return (
      <View style={[dynamicStyles.fallbackContainer, style]}>
        <Text style={dynamicStyles.fallbackText}>{symbol.charAt(0)}</Text>
      </View>
    );
  }
  
  return null;
};

export default TokenLogo;

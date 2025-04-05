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
  logo?: any;
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
  style,
  logo
}) => {
  const { activeTheme } = useTheme();
  
  // Get the appropriate logo source based on token symbol
  const getLogoSource = () => {
    // If custom logo is provided, use it
    if (logo) {
      return logo;
    }
    
    if (symbol === 'ETH') {
      return getEthereumLogo(activeTheme);
    } else if (symbol === 'USDC') {
      return require('../../assets/images/usdc.png');
    }
    return null;
  };
  
  const logoSource = getLogoSource();
  
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: backgroundColor || 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      borderWidth: borderColor ? 1 : 0,
      borderColor: borderColor || 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1.5,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    fallbackText: {
      color: '#FFFFFF',
      fontSize: size * 0.4,
      fontWeight: 'bold',
    },
    logo: {
      width: size * 0.8,
      height: size * 0.8,
      resizeMode: 'contain',
    },
  });
  
  return (
    <View style={[styles.container, style]}>
      {logoSource ? (
        <Image source={logoSource} style={styles.logo} />
      ) : (
        showFallback && <Text style={styles.fallbackText}>{symbol.substring(0, 2)}</Text>
      )}
    </View>
  );
};

export default TokenLogo;

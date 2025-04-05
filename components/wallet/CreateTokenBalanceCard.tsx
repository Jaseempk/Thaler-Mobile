import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface CreateTokenBalanceCardProps {
  token: {
    symbol: string;
    balance: string;
    price?: number;
    logo: any;
  };
}

export default function CreateTokenBalanceCard({ token }: CreateTokenBalanceCardProps) {
  const { activeTheme } = useTheme();
  
  // Calculate USD value
  const balanceUSD = token.price 
    ? (parseFloat(token.balance) * token.price).toFixed(2)
    : '0';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: Colors[activeTheme].border,
      overflow: 'hidden',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    icon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[activeTheme].textSecondary,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    amountContainer: {
      flex: 1,
    },
    amount: {
      fontSize: 28,
      fontWeight: '700',
      color: Colors[activeTheme].text,
      marginBottom: 4,
    },
    usdValue: {
      fontSize: 14,
      color: Colors[activeTheme].textSecondary,
    },
    symbol: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[activeTheme].textSecondary,
      marginLeft: 4,
      alignSelf: 'flex-end',
      marginBottom: 6,
    },
  });

  // Get gradient colors based on token
  const gradientColors = token.symbol === 'ETH' 
    ? ['#6B8AFF', '#454A75'] as const
    : ['#2775CA', '#2775CA'] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Image 
            source={token.logo} 
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Available Balance</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{token.balance}</Text>
          <Text style={styles.usdValue}>${balanceUSD} USD</Text>
        </View>
        <Text style={styles.symbol}>{token.symbol}</Text>
      </View>
    </View>
  );
}
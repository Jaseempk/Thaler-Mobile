import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';

interface CreateTokenBalanceCardProps {
  token: {
    symbol: string;
    balance: string;
    price?: number;
    logo: any;
  };
  onRefresh: () => void;
}

export default function CreateTokenBalanceCard({ token, onRefresh }: CreateTokenBalanceCardProps) {
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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 8,
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
      alignItems: 'center',
    },
    amount: {
      fontSize: 24,
      fontWeight: '700',
      color: Colors[activeTheme].text,
    },
    usdValue: {
      fontSize: 14,
      color: Colors[activeTheme].textSecondary,
    },
    refreshButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors[activeTheme].primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={token.logo} 
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>Available Balance</Text>
      </View>
      <View style={styles.row}>
        <View>
          <Text style={styles.amount}>{token.balance} {token.symbol}</Text>
          <Text style={styles.usdValue}>${balanceUSD} USD</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 
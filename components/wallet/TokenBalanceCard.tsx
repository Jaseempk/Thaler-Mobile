import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface TokenBalanceCardProps {
  token: {
    symbol: string;
    name: string;
    balance: string;
    value: string;
    change: string;
    isPositive: boolean;
    logo: any;
    gradientColors: string[];
  };
  theme: 'light' | 'dark';
  onPress?: () => void;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({ token, theme, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={token.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.contentContainer}>
          <View style={styles.tokenInfo}>
            <View style={styles.logoContainer}>
              {typeof token.logo === 'string' ? (
                <Image source={{ uri: token.logo }} style={styles.tokenLogo} />
              ) : (
                <Image source={token.logo} style={styles.tokenLogo} />
              )}
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.tokenSymbol}>{token.symbol}</Text>
              <Text style={styles.tokenName}>{token.name}</Text>
            </View>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.tokenBalance}>{token.balance}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.tokenValue}>${token.value}</Text>
              <View style={[
                styles.changeContainer, 
                { backgroundColor: token.isPositive ? 'rgba(76, 217, 100, 0.2)' : 'rgba(255, 59, 48, 0.2)' }
              ]}>
                <Ionicons 
                  name={token.isPositive ? 'arrow-up' : 'arrow-down'} 
                  size={12} 
                  color={token.isPositive ? Colors[theme].success : Colors[theme].error} 
                />
                <Text style={[
                  styles.changeText, 
                  { color: token.isPositive ? Colors[theme].success : Colors[theme].error }
                ]}>
                  {token.change}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientBackground: {
    borderRadius: 16,
  },
  contentContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tokenName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default TokenBalanceCard;

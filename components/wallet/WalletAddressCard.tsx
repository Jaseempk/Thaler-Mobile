import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface WalletAddressCardProps {
  address: string | null;
  isConnected: boolean;
  theme: 'light' | 'dark';
  onPress?: () => void;
}

const WalletAddressCard: React.FC<WalletAddressCardProps> = ({ 
  address, 
  isConnected, 
  theme,
  onPress 
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyToClipboard = () => {
    if (address) {
      Clipboard.setString(address);
      // You could add a toast notification here
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <LinearGradient
        colors={theme === 'dark' 
          ? ['#2E7D32', '#1A237E'] 
          : ['#4CAF50', '#1E88E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.walletTitle}>Embedded Wallet</Text>
          </View>
          
          <View style={styles.addressContainer}>
            {isConnected && address ? (
              <>
                <Text style={styles.addressText}>{formatAddress(address)}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={copyToClipboard}
                >
                  <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.addressText}>Not Connected</Text>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: isConnected ? '#4CD964' : '#FF3B30' }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default WalletAddressCard;

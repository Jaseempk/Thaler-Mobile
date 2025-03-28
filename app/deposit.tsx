import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Colors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../context/WalletContext';

// Import token logos
const ethLogo = require('../assets/images/ethereum.png');
const usdcLogo = require('../assets/images/usdc.png');

type ColorScheme = {
  text: string;
  textSecondary: string;
  background: string;
  card: string;
  primary: string;
  secondaryLight: string;
  success: string;
  error: string;
  gray: string;
};

type ColorTheme = {
  light: ColorScheme;
  dark: ColorScheme;
};

export default function DepositScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const { address } = useWallet();
  const isDarkMode = activeTheme === 'dark';

  // Format address to show only start and end
  const formatAddress = (addr: string | null) => {
    if (!addr) return 'Loading...';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Handle copy address
  const handleCopyAddress = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      Alert.alert('Success', 'Full address copied to clipboard!');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: (Colors as ColorTheme)[activeTheme].background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={(Colors as ColorTheme)[activeTheme].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: (Colors as ColorTheme)[activeTheme].text }]}>Deposit</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.addressSection}>
          <Text style={[styles.sectionTitle, { color: (Colors as ColorTheme)[activeTheme].text }]}>Your Deposit Address</Text>
          <Text style={[styles.description, { color: (Colors as ColorTheme)[activeTheme].textSecondary }]}>
            Send ETH or USDC to this address to deposit funds into your wallet
          </Text>
          
          <TouchableOpacity
            style={[styles.addressContainer, { backgroundColor: (Colors as ColorTheme)[activeTheme].secondaryLight }]}
            onPress={handleCopyAddress}
          >
            <Text style={[styles.address, { color: (Colors as ColorTheme)[activeTheme].text }]}>
              {formatAddress(address)}
            </Text>
            <View style={styles.copyButton}>
              <Ionicons name="copy-outline" size={20} color={(Colors as ColorTheme)[activeTheme].primary} />
              <Text style={[styles.copyText, { color: (Colors as ColorTheme)[activeTheme].primary }]}>Copy</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: (Colors as ColorTheme)[activeTheme].card }]}>
            <Ionicons name="information-circle-outline" size={24} color={(Colors as ColorTheme)[activeTheme].primary} />
            <Text style={[styles.infoText, { color: (Colors as ColorTheme)[activeTheme].text }]}>
              This address accepts both ETH and USDC deposits. Make sure to send only these tokens to avoid permanent loss.
            </Text>
          </View>
        </View>

        <View style={styles.supportedTokens}>
          <Text style={[styles.sectionTitle, { color: (Colors as ColorTheme)[activeTheme].text }]}>Supported Tokens</Text>
          <View style={[styles.tokenList, { backgroundColor: (Colors as ColorTheme)[activeTheme].card }]}>
            <View style={styles.tokenItem}>
              <View style={styles.tokenIconContainer}>
                <Image source={ethLogo} style={styles.tokenIcon} />
              </View>
              <Text style={[styles.tokenName, { color: (Colors as ColorTheme)[activeTheme].text }]}>Ethereum</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: (Colors as ColorTheme)[activeTheme].secondaryLight }]} />
            <View style={styles.tokenItem}>
              <View style={styles.tokenIconContainer}>
                <Image source={usdcLogo} style={styles.tokenIcon} />
              </View>
              <Text style={[styles.tokenName, { color: (Colors as ColorTheme)[activeTheme].text }]}>USD Coin</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addressSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  address: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  supportedTokens: {
    marginBottom: 24,
  },
  tokenList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tokenIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 6,
  },
  tokenIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
}); 
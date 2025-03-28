import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

// Import token logos
const ethLogo = require('../assets/images/ethereum.png');
const usdcLogo = require('../assets/images/usdc.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - (CARD_PADDING * 4);

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

type Token = {
  symbol: string;
  name: string;
  logo: any;
  balance: string;
  address?: string;
  decimals: number;
};

export default function WithdrawScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const { address, getProvider, getSigner } = useWallet();
  const isDarkMode = activeTheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);

  // Available tokens with mock balances
  const tokens: Token[] = [
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      logo: ethLogo, 
      balance: '1.245',
      decimals: 18
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      logo: usdcLogo, 
      balance: '2,500.00',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract address
      decimals: 6
    },
  ];

  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  // Validate Ethereum address
  const validateAddress = (address: string) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddressChange = (text: string) => {
    setRecipientAddress(text);
    if (text.length > 0) {
      setIsAddressValid(validateAddress(text));
    } else {
      setIsAddressValid(true);
    }
  };

  const handleWithdraw = async () => {
    if (!address) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const provider = await getProvider();
      const signer = await getSigner();
      
      if (!provider || !signer) {
        throw new Error('Failed to get provider or signer');
      }

      const amountInWei = ethers.utils.parseUnits(
        amount,
        selectedToken.decimals
      );

      if (selectedToken.symbol === 'ETH') {
        // Handle ETH withdrawal
        const tx = await signer.sendTransaction({
          to: recipientAddress,
          value: amountInWei,
        });
        await tx.wait();
        Alert.alert('Success', 'ETH withdrawal successful!');
      } else {
        // Handle ERC20 withdrawal
        const contract = new ethers.Contract(
          selectedToken.address!,
          ['function transfer(address to, uint256 amount) returns (bool)'],
          signer
        );

        const tx = await contract.transfer(recipientAddress, amountInWei);
        await tx.wait();
        Alert.alert('Success', 'USDC withdrawal successful!');
      }

      // Clear form and go back
      setAmount('');
      setRecipientAddress('');
      router.back();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to process withdrawal. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isWithdrawEnabled = () => {
    return (
      selectedToken &&
      amount &&
      parseFloat(amount) > 0 &&
      recipientAddress &&
      isAddressValid &&
      parseFloat(amount) <= parseFloat(selectedToken.balance.replace(',', ''))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: (Colors as ColorTheme)[activeTheme].background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={(Colors as ColorTheme)[activeTheme].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: (Colors as ColorTheme)[activeTheme].text }]}>Withdraw</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Token Selection */}
          <Text style={[styles.sectionTitle, { color: (Colors as ColorTheme)[activeTheme].text }]}>Select Token</Text>
          <View style={[styles.tokenList, { backgroundColor: (Colors as ColorTheme)[activeTheme].card }]}>
            {tokens.map((token, index) => (
              <React.Fragment key={token.symbol}>
                <TouchableOpacity
                  style={[
                    styles.tokenItem,
                    selectedToken.symbol === token.symbol && {
                      backgroundColor: isDarkMode 
                        ? 'rgba(46, 125, 50, 0.35)' 
                        : 'rgba(76, 175, 80, 0.1)',
                      borderWidth: 1,
                      borderColor: isDarkMode 
                        ? 'rgba(76, 175, 80, 0.5)' 
                        : 'rgba(46, 125, 50, 0.2)',
                      shadowColor: isDarkMode ? "#4CAF50" : "#2E7D32",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDarkMode ? 0.2 : 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    },
                  ]}
                  onPress={() => setSelectedToken(token)}
                >
                  <View style={styles.tokenInfo}>
                    <View style={[
                      styles.tokenIconContainer,
                      selectedToken.symbol === token.symbol && {
                        backgroundColor: isDarkMode 
                          ? 'rgba(46, 125, 50, 0.25)' 
                          : 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 1,
                        borderColor: isDarkMode 
                          ? 'rgba(76, 175, 80, 0.4)' 
                          : 'rgba(46, 125, 50, 0.2)',
                      }
                    ]}>
                      <Image source={token.logo} style={styles.tokenIcon} />
                    </View>
                    <View>
                      <Text style={[
                        styles.tokenSymbol, 
                        { 
                          color: (Colors as ColorTheme)[activeTheme].text,
                          fontWeight: selectedToken.symbol === token.symbol ? '700' : '600',
                          fontSize: selectedToken.symbol === token.symbol ? 18 : 16,
                        }
                      ]}>
                        {token.symbol}
                      </Text>
                      <Text style={[
                        styles.tokenName, 
                        { 
                          color: (Colors as ColorTheme)[activeTheme].textSecondary,
                          opacity: selectedToken.symbol === token.symbol ? 1 : 0.7
                        }
                      ]}>
                        {token.name}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text style={[
                      styles.tokenBalance, 
                      { 
                        color: (Colors as ColorTheme)[activeTheme].text,
                        fontWeight: selectedToken.symbol === token.symbol ? '700' : '600',
                        fontSize: selectedToken.symbol === token.symbol ? 18 : 16,
                      }
                    ]}>
                      {token.balance}
                    </Text>
                    <Text style={[
                      styles.balanceLabel, 
                      { 
                        color: (Colors as ColorTheme)[activeTheme].textSecondary,
                        opacity: selectedToken.symbol === token.symbol ? 1 : 0.7
                      }
                    ]}>
                      Available
                    </Text>
                  </View>
                </TouchableOpacity>
                {index < tokens.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: (Colors as ColorTheme)[activeTheme].secondaryLight }]} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Amount Input */}
          <Text style={[styles.sectionTitle, { color: (Colors as ColorTheme)[activeTheme].text, marginTop: 24 }]}>
            Amount
          </Text>
          <View style={[styles.amountContainer, { backgroundColor: (Colors as ColorTheme)[activeTheme].card }]}>
            <TextInput
              style={[styles.amountInput, { color: (Colors as ColorTheme)[activeTheme].text }]}
              placeholder="0.00"
              placeholderTextColor={(Colors as ColorTheme)[activeTheme].textSecondary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.maxButton}>
              <TouchableOpacity
                style={[styles.maxButtonInner, { backgroundColor: (Colors as ColorTheme)[activeTheme].secondaryLight }]}
                onPress={() => setAmount(selectedToken.balance)}
              >
                <Text style={[styles.maxButtonText, { color: (Colors as ColorTheme)[activeTheme].primary }]}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipient Address */}
          <Text style={[styles.sectionTitle, { color: (Colors as ColorTheme)[activeTheme].text, marginTop: 24 }]}>
            Recipient Address
          </Text>
          <View style={[styles.addressContainer, { backgroundColor: (Colors as ColorTheme)[activeTheme].card }]}>
            <TextInput
              style={[
                styles.addressInput,
                { color: (Colors as ColorTheme)[activeTheme].text },
                !isAddressValid && { color: (Colors as ColorTheme)[activeTheme].error },
              ]}
              placeholder="Enter Ethereum address (0x...)"
              placeholderTextColor={(Colors as ColorTheme)[activeTheme].textSecondary}
              value={recipientAddress}
              onChangeText={handleAddressChange}
              autoCapitalize="none"
            />
          </View>
          {!isAddressValid && recipientAddress.length > 0 && (
            <Text style={[styles.errorText, { color: (Colors as ColorTheme)[activeTheme].error }]}>
              Please enter a valid Ethereum address
            </Text>
          )}

          {/* Withdraw Button */}
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              {
                backgroundColor: isWithdrawEnabled()
                  ? (Colors as ColorTheme)[activeTheme].primary
                  : (Colors as ColorTheme)[activeTheme].gray,
              },
            ]}
            onPress={handleWithdraw}
            disabled={!isWithdrawEnabled() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.withdrawButtonText}>Withdraw {selectedToken.symbol}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  tokenList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tokenIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenName: {
    fontSize: 14,
    marginTop: 2,
  },
  tokenBalance: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  balanceLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  amountContainer: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  maxButton: {
    marginLeft: 12,
  },
  maxButtonInner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressContainer: {
    borderRadius: 16,
    padding: 16,
  },
  addressInput: {
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  withdrawButton: {
    marginTop: 32,
    marginBottom: 24,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
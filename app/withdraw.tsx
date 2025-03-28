import React, { useState, useRef, useEffect } from 'react';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';

// Import token logos
const ethLogo = require('../assets/images/ethereum.png');
const usdcLogo = require('../assets/images/usdc.png');

// USDC contract ABI (minimal for balanceOf)
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// Base Sepolia USDC address
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

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
  const { address, getProvider, getSigner, isConnected } = useWallet();
  const isDarkMode = activeTheme === 'dark';
  const [isLoading, setIsLoading] = useState(false);
  const [ethBalance, setEthBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [ethPrice, setEthPrice] = useState(0);
  const [ethValue, setEthValue] = useState('0.00');
  const [usdcValue, setUsdcValue] = useState('0.00');
  const [ethChange, setEthChange] = useState('0.00');
  const [totalBalanceUSD, setTotalBalanceUSD] = useState('0.00');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  // Animation values for each token
  const animationValues = useRef({
    ETH: new Animated.Value(1),
    USDC: new Animated.Value(0),
  }).current;

  // Format the balance for display with proper decimal places
  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance);
    return balanceNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  // Format USD value for display
  const formatUSD = (value: string) => {
    const valueNum = parseFloat(value);
    return valueNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Fetch ETH price from CoinGecko
  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    } catch (error) {
      console.error('Error fetching ETH price:', error);
    }
  };

  // Fetch balances
  const fetchBalances = async () => {
    try {
      const provider = await getProvider();
      if (!provider || !address) return;

      // Fetch ETH balance
      const ethBalanceWei = await provider.getBalance(address);
      const formattedEthBalance = ethers.utils.formatEther(ethBalanceWei);
      setEthBalance(formattedEthBalance);

      // Fetch USDC balance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
      const usdcBalanceWei = await usdcContract.balanceOf(address);
      const usdcDecimals = await usdcContract.decimals();
      const formattedUsdcBalance = ethers.utils.formatUnits(usdcBalanceWei, usdcDecimals);
      setUsdcBalance(formattedUsdcBalance);

      // Calculate total balance in USD
      const ethBalanceUSD = parseFloat(formattedEthBalance) * ethPrice;
      const usdcBalanceUSD = parseFloat(formattedUsdcBalance); // USDC is pegged to USD
      const total = ethBalanceUSD + usdcBalanceUSD;
      setTotalBalanceUSD(total.toFixed(2));

    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Update balances and prices
  useEffect(() => {
    if (isConnected) {
      fetchEthPrice();
      fetchBalances();

      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchEthPrice();
        fetchBalances();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchEthPrice(), fetchBalances()]);
    setRefreshing(false);
  }, []);

  // Available tokens with real balances
  const tokens: Token[] = [
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      logo: ethLogo, 
      balance: formatBalance(ethBalance),
      decimals: 18
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      logo: usdcLogo, 
      balance: formatBalance(usdcBalance),
      address: USDC_ADDRESS,
      decimals: 6
    },
  ];

  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);

  const animateSelection = (token: Token) => {
    // Animate previous selection out
    Animated.spring(animationValues[selectedToken.symbol as keyof typeof animationValues], {
      toValue: 0,
      tension: 40,
      friction: 7,
      useNativeDriver: false,
    }).start();

    // Animate new selection in
    Animated.spring(animationValues[token.symbol as keyof typeof animationValues], {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: false,
    }).start();

    setSelectedToken(token);
  };

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

  // Add styles for balance display
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 16,
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
    tokenBalanceLabel: {
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
    tokenItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    totalBalanceContainer: {
      marginBottom: 24,
      alignItems: 'center',
    },
    totalBalanceLabel: {
      fontSize: 14,
      marginBottom: 4,
    },
    totalBalanceAmount: {
      fontSize: 28,
      fontWeight: '700',
    },
    balanceContainer: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: Colors[activeTheme].card,
      marginBottom: 16,
      borderRadius: 16,
      shadowColor: Colors[activeTheme].shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    balanceLabel: {
      fontSize: 14,
      color: Colors[activeTheme].textSecondary,
      marginBottom: 8,
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    balanceAmount: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors[activeTheme].text,
    },
    eyeButton: {
      padding: 8,
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[activeTheme].background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors[activeTheme].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[activeTheme].text }]}>Withdraw</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={[styles.balanceContainer, { backgroundColor: Colors[activeTheme].card }]}>
            <Text style={[styles.balanceLabel, { color: Colors[activeTheme].textSecondary }]}>
              Total Balance
            </Text>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceAmount, { color: Colors[activeTheme].text }]}>
                ${isConnected
                  ? isBalanceVisible
                    ? formatUSD(totalBalanceUSD)
                    : "••••••"
                  : "---"}
              </Text>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                <Ionicons
                  name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color={Colors[activeTheme].text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}>Select Token</Text>
          <View style={[styles.tokenList, { backgroundColor: Colors[activeTheme].card }]}>
            {tokens.map((token, index) => {
              const isSelected = selectedToken.symbol === token.symbol;
              const animValue = animationValues[token.symbol as keyof typeof animationValues];
              
              return (
                <React.Fragment key={token.symbol}>
                  <Animated.View
                    style={[
                      styles.tokenItem,
                      {
                        backgroundColor: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            'transparent',
                            isDarkMode 
                              ? 'rgba(46, 125, 50, 0.35)'
                              : 'rgba(76, 175, 80, 0.1)',
                          ],
                        }),
                        borderWidth: 1,
                        borderColor: animValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                            'transparent',
                            isDarkMode 
                              ? 'rgba(76, 175, 80, 0.5)'
                              : 'rgba(46, 125, 50, 0.2)',
                          ],
                        }),
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => animateSelection(token)}
                      activeOpacity={0.7}
                      style={styles.tokenItemContent}
                    >
                      <View style={styles.tokenInfo}>
                        <Animated.View style={[
                          styles.tokenIconContainer,
                          {
                            backgroundColor: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['#FFFFFF', isDarkMode ? 'rgba(46, 125, 50, 0.25)' : '#FFFFFF'],
                            }),
                          },
                        ]}>
                          <Image source={token.logo} style={styles.tokenIcon} />
                        </Animated.View>
                        <View>
                          <Animated.Text style={[
                            styles.tokenSymbol,
                            {
                              color: Colors[activeTheme].text,
                              fontWeight: isSelected ? '700' : '600',
                              fontSize: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [16, 18],
                              }),
                            },
                          ]}>
                            {token.symbol}
                          </Animated.Text>
                          <Animated.Text style={[
                            styles.tokenName,
                            {
                              color: Colors[activeTheme].textSecondary,
                              opacity: animValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, 1],
                              }),
                            },
                          ]}>
                            {token.name}
                          </Animated.Text>
                        </View>
                      </View>
                      <View>
                        <Animated.Text style={[
                          styles.tokenBalance,
                          {
                            color: Colors[activeTheme].text,
                            fontWeight: isSelected ? '700' : '600',
                            fontSize: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [16, 18],
                            }),
                          },
                        ]}>
                          {token.balance}
                        </Animated.Text>
                        <Animated.Text style={[
                          styles.tokenBalanceLabel,
                          {
                            color: Colors[activeTheme].textSecondary,
                            opacity: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.7, 1],
                            }),
                          },
                        ]}>
                          Available
                        </Animated.Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                  {index < tokens.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: Colors[activeTheme].secondaryLight }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Amount Input */}
          <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text, marginTop: 24 }]}>
            Amount
          </Text>
          <View style={[styles.amountContainer, { backgroundColor: Colors[activeTheme].card }]}>
            <TextInput
              style={[styles.amountInput, { color: Colors[activeTheme].text }]}
              placeholder="0.00"
              placeholderTextColor={Colors[activeTheme].textSecondary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.maxButton}>
              <TouchableOpacity
                style={[styles.maxButtonInner, { backgroundColor: Colors[activeTheme].secondaryLight }]}
                onPress={() => setAmount(selectedToken.balance)}
              >
                <Text style={[styles.maxButtonText, { color: Colors[activeTheme].primary }]}>MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipient Address */}
          <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text, marginTop: 24 }]}>
            Recipient Address
          </Text>
          <View style={[styles.addressContainer, { backgroundColor: Colors[activeTheme].card }]}>
            <TextInput
              style={[
                styles.addressInput,
                { color: Colors[activeTheme].text },
                !isAddressValid && { color: Colors[activeTheme].error },
              ]}
              placeholder="Enter Ethereum address (0x...)"
              placeholderTextColor={Colors[activeTheme].textSecondary}
              value={recipientAddress}
              onChangeText={handleAddressChange}
              autoCapitalize="none"
            />
          </View>
          {!isAddressValid && recipientAddress.length > 0 && (
            <Text style={[styles.errorText, { color: Colors[activeTheme].error }]}>
              Please enter a valid Ethereum address
            </Text>
          )}

          {/* Withdraw Button */}
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              {
                backgroundColor: isWithdrawEnabled()
                  ? Colors[activeTheme].primary
                  : Colors[activeTheme].gray,
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
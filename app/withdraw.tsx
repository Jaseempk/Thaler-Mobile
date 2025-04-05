import React, { useState, useRef, useEffect, useMemo } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { useTheme } from "../contexts/ThemeContext";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "react-native";
import { useTokenBalances } from "../hooks/useTokenBalances";
import { useEmbeddedEthereumWallet } from "@privy-io/expo";
import StatusModal from '../components/modals/StatusModal';
import { Clipboard } from 'react-native';
import { getEthereumLogo } from '../utils/themeUtils';

// Import token logos
const usdcLogo = require("../assets/images/usdc.png");

// USDC contract ABI (minimal for balanceOf)
const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// Base Sepolia USDC address
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 4;

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

// Add EIP1193Provider type
interface EIP1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
}

export default function WithdrawScreen() {
  const router = useRouter();
  const { activeTheme } = useTheme();
  const { address, isConnected } = useWallet();
  const isDarkMode = activeTheme === "dark";
  const [isLoading, setIsLoading] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme() ?? "light";

  // Get the embedded wallet
  const { wallets } = useEmbeddedEthereumWallet();
  const embeddedWallet = wallets.find((wallet) => wallet.address === address);

  // Use the useTokenBalances hook
  const {
    balances: tokenBalances,
    totalBalanceUSD,
    refreshBalances,
    isLoading: isBalanceLoading,
  } = useTokenBalances();

  // Initialize tokens with loading state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Get theme-based Ethereum logo
  const ethLogo = getEthereumLogo(activeTheme);

  // Update tokens and selected token when balances are loaded
  useEffect(() => {
    if (tokenBalances.length > 0) {
      const newTokens: Token[] = tokenBalances.map(
        (token): Token => ({
          symbol: token.symbol,
          name: token.name,
          logo: token.symbol === "ETH" ? ethLogo : usdcLogo,
          balance: token.balance,
          address: token.symbol === "USDC" ? USDC_ADDRESS : undefined,
          decimals: token.symbol === "ETH" ? 18 : 6,
        })
      );

      setTokens(newTokens);
      // Set initial selected token if not already set
      if (!selectedToken) {
        setSelectedToken(newTokens[0]);
      }
    }
  }, [tokenBalances]);

  // Initialize animation values with selected token
  const animationValues = useRef({
    ETH: new Animated.Value(selectedToken?.symbol === "ETH" ? 1 : 0),
    USDC: new Animated.Value(selectedToken?.symbol === "USDC" ? 1 : 0),
  }).current;

  const animateSelection = (token: Token) => {
    // Reset all animation values first
    Object.keys(animationValues).forEach((key) => {
      if (key !== token.symbol) {
        Animated.spring(animationValues[key as keyof typeof animationValues], {
          toValue: 0,
          tension: 40,
          friction: 7,
          useNativeDriver: false,
        }).start();
      }
    });

    // Animate new selection in
    Animated.spring(
      animationValues[token.symbol as keyof typeof animationValues],
      {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: false,
      }
    ).start();

    setSelectedToken(token);
  };

  // Validate Ethereum address
  const validateAddress = (address: string) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isAddressValid, setIsAddressValid] = useState(true);

  const handleAddressChange = (text: string) => {
    setRecipientAddress(text);
    if (text.length > 0) {
      setIsAddressValid(validateAddress(text));
    } else {
      setIsAddressValid(true);
    }
  };

  // Optimize isWithdrawEnabled check
  const isWithdrawEnabled = useMemo(() => {
    if (!selectedToken || !amount || !recipientAddress) return false;

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(selectedToken.balance.replace(",", ""));

    return amountNum > 0 && amountNum <= balanceNum && isAddressValid;
  }, [selectedToken, amount, recipientAddress, isAddressValid]);

  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  }, [refreshBalances]);

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!amount || !selectedToken || !embeddedWallet) {
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Invalid Input',
        message: 'Please fill in all fields and select a token',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get the provider from the embedded wallet
      const rawProvider = await embeddedWallet.getProvider();
      console.log("embeddedWalet:", embeddedWallet);

      if (!rawProvider) {
        throw new Error("Failed to get provider");
      }

      // Cast the provider to EIP1193Provider
      const provider = rawProvider as unknown as EIP1193Provider;

      // Convert amount to Wei
      const amountWei = ethers.utils.parseUnits(amount, selectedToken.decimals);

      if (selectedToken.symbol === "ETH") {
        // Handle ETH withdrawal
        const tx = {
          to: recipientAddress,
          value: ethers.utils.hexlify(amountWei),
          from: address,
          chainId: "84532", // Base Sepolia chain ID in hex
        };

        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [tx],
        });

        setStatusModal({
          visible: true,
          type: 'success',
          title: 'Transaction Successful',
          message: `Successfully sent ${amount} ${selectedToken.symbol} to ${recipientAddress}`,
          transactionHash: txHash,
        });

        // Clear form
        setAmount("");
        setRecipientAddress("");
      } else {
        // Handle USDC withdrawal
        const erc20Interface = new ethers.utils.Interface([
          "function transfer(address to, uint256 amount) returns (bool)",
        ]);

        // Encode the transfer function call
        const data = erc20Interface.encodeFunctionData("transfer", [
          recipientAddress,
          amountWei,
        ]);

        // Send the transaction
        const txHash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: selectedToken.address,
              data,
              from: address,
              chainId: "84532", // Base Sepolia chain ID in hex
            },
          ],
        });

        setStatusModal({
          visible: true,
          type: 'success',
          title: 'Transaction Successful',
          message: `Successfully sent ${amount} ${selectedToken.symbol} to ${recipientAddress}`,
          transactionHash: txHash,
        });

        // Clear form
        setAmount("");
        setRecipientAddress("");
      }

      // Refresh balances after successful withdrawal
      refreshBalances();
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      
      // Handle specific error cases
      let errorMessage = "Failed to process withdrawal. Please try again.";
      if (error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction. Please check your balance.";
      } else if (error.message?.includes("user rejected")) {
        errorMessage = "Transaction was rejected. Please try again.";
      } else if (error.message?.includes("nonce too low")) {
        errorMessage = "Transaction failed. Please try again.";
      }

      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Transaction Failed',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
    tokenList: {
      borderRadius: 16,
      overflow: "hidden",
    },
    tokenItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 4,
      marginVertical: 2,
    },
    tokenInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    tokenIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
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
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    tokenSymbol: {
      fontSize: 16,
      fontWeight: "600",
    },
    tokenName: {
      fontSize: 14,
      marginTop: 2,
    },
    tokenBalance: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "right",
    },
    tokenBalanceLabel: {
      fontSize: 12,
      marginTop: 2,
      textAlign: "right",
    },
    divider: {
      height: 1,
      marginHorizontal: 16,
    },
    amountContainer: {
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    amountInput: {
      flex: 1,
      fontSize: 24,
      fontWeight: "600",
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
      fontWeight: "600",
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
      justifyContent: "center",
      alignItems: "center",
    },
    withdrawButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    tokenItemContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    totalBalanceContainer: {
      marginBottom: 24,
      alignItems: "center",
    },
    totalBalanceLabel: {
      fontSize: 14,
      marginBottom: 4,
    },
    totalBalanceAmount: {
      fontSize: 28,
      fontWeight: "700",
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    balanceAmount: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[activeTheme].text,
    },
    eyeButton: {
      padding: 8,
    },
  });

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    transactionHash?: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[activeTheme].background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[activeTheme].text}
            />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: Colors[activeTheme].text }]}
          >
            Withdraw
          </Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            style={[
              styles.balanceContainer,
              { backgroundColor: Colors[activeTheme].card },
            ]}
          >
            <Text
              style={[
                styles.balanceLabel,
                { color: Colors[activeTheme].textSecondary },
              ]}
            >
              Total Balance
            </Text>
            <View style={styles.balanceRow}>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: Colors[activeTheme].text },
                ]}
              >
                $
                {isConnected
                  ? isBalanceVisible
                    ? totalBalanceUSD
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

          <Text
            style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}
          >
            Select Token
          </Text>
          <View
            style={[
              styles.tokenList,
              { backgroundColor: Colors[activeTheme].card },
            ]}
          >
            {tokens.length === 0 ? (
              <View style={[styles.tokenItem, { justifyContent: "center" }]}>
                <ActivityIndicator color={Colors[activeTheme].primary} />
              </View>
            ) : (
              tokens.map((token, index) => {
                const isSelected = selectedToken?.symbol === token.symbol;
                const animValue =
                  animationValues[token.symbol as keyof typeof animationValues];

                return (
                  <React.Fragment key={token.symbol}>
                    <Animated.View
                      style={[
                        styles.tokenItem,
                        {
                          backgroundColor: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              "transparent",
                              isDarkMode
                                ? "rgba(46, 125, 50, 0.35)"
                                : "rgba(76, 175, 80, 0.1)",
                            ],
                          }),
                          borderWidth: 1,
                          borderColor: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [
                              "transparent",
                              isDarkMode
                                ? "rgba(76, 175, 80, 0.5)"
                                : "rgba(46, 125, 50, 0.2)",
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
                          <Animated.View
                            style={[
                              styles.tokenIconContainer,
                              {
                                backgroundColor: animValue.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [
                                    "#FFFFFF",
                                    isDarkMode
                                      ? "rgba(46, 125, 50, 0.25)"
                                      : "#FFFFFF",
                                  ],
                                }),
                              },
                            ]}
                          >
                            <Image
                              source={token.logo}
                              style={styles.tokenIcon}
                            />
                          </Animated.View>
                          <View>
                            <Animated.Text
                              style={[
                                styles.tokenSymbol,
                                {
                                  color: Colors[activeTheme].text,
                                  fontWeight: isSelected ? "700" : "600",
                                  fontSize: animValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [16, 18],
                                  }),
                                },
                              ]}
                            >
                              {token.symbol}
                            </Animated.Text>
                            <Animated.Text
                              style={[
                                styles.tokenName,
                                {
                                  color: Colors[activeTheme].textSecondary,
                                  opacity: animValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.7, 1],
                                  }),
                                },
                              ]}
                            >
                              {token.name}
                            </Animated.Text>
                          </View>
                        </View>
                        <View>
                          <Animated.Text
                            style={[
                              styles.tokenBalance,
                              {
                                color: Colors[activeTheme].text,
                                fontWeight: isSelected ? "700" : "600",
                                fontSize: animValue.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [16, 18],
                                }),
                              },
                            ]}
                          >
                            {token.balance}
                          </Animated.Text>
                          <Animated.Text
                            style={[
                              styles.tokenBalanceLabel,
                              {
                                color: Colors[activeTheme].textSecondary,
                                opacity: animValue.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.7, 1],
                                }),
                              },
                            ]}
                          >
                            Available
                          </Animated.Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                    {index < tokens.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          {
                            backgroundColor: Colors[activeTheme].secondaryLight,
                          },
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </View>

          {/* Amount Input */}
          <Text
            style={[
              styles.sectionTitle,
              { color: Colors[activeTheme].text, marginTop: 24 },
            ]}
          >
            Amount
          </Text>
          <View
            style={[
              styles.amountContainer,
              { backgroundColor: Colors[activeTheme].card },
            ]}
          >
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
                style={[
                  styles.maxButtonInner,
                  { backgroundColor: Colors[activeTheme].secondaryLight },
                ]}
                onPress={() =>
                  selectedToken?.balance && setAmount(selectedToken.balance)
                }
              >
                <Text
                  style={[
                    styles.maxButtonText,
                    { color: Colors[activeTheme].primary },
                  ]}
                >
                  MAX
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recipient Address */}
          <Text
            style={[
              styles.sectionTitle,
              { color: Colors[activeTheme].text, marginTop: 24 },
            ]}
          >
            Recipient Address
          </Text>
          <View
            style={[
              styles.addressContainer,
              { backgroundColor: Colors[activeTheme].card },
            ]}
          >
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
            <Text
              style={[styles.errorText, { color: Colors[activeTheme].error }]}
            >
              Please enter a valid Ethereum address
            </Text>
          )}

          {/* Withdraw Button */}
          <TouchableOpacity
            style={[
              styles.withdrawButton,
              {
                backgroundColor: isWithdrawEnabled
                  ? Colors[activeTheme].primary
                  : Colors[activeTheme].gray,
              },
            ]}
            onPress={handleWithdraw}
            disabled={!isWithdrawEnabled || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.withdrawButtonText}>
                Withdraw {selectedToken?.symbol}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Status Modal */}
      <StatusModal
        visible={statusModal.visible}
        onClose={() => setStatusModal(prev => ({ ...prev, visible: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        transactionHash={statusModal.transactionHash}
        theme={activeTheme}
      />
    </SafeAreaView>
  );
}

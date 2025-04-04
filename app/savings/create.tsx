import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { PrivyProvider, PrivyElements, usePrivy } from "@privy-io/expo";
import { UsePrivy } from "../../types/privy";
import { useWallet } from "../../context/WalletContext";
import { useSavingsPool } from "../../context/SavingsPoolContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import CreateTokenBalanceCard from "../../components/wallet/CreateTokenBalanceCard";
import StatusModal from "../../components/modals/StatusModal";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Import token logos
const ethLogo = require("../../assets/images/ethereum.png");
const usdcLogo = require("../../assets/images/usdc.png");

// Constants for measurements and animations
const TOGGLE_PADDING = 4;
const TOGGLE_HEIGHT = 48;
const TOGGLE_BORDER_RADIUS = 16;
const TOGGLE_TEXT_SIZE = 16;
const SLIDER_HEIGHT = 40;
const ANIMATION_CONFIG = {
  SPRING: {
    stiffness: 180,
    damping: 20,
    mass: 1,
    useNativeDriver: true,
  },
  TIMING: {
    duration: 150,
    useNativeDriver: true,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  },
};

const ANIMATION_DURATION = 250;

// Add token interface with logo
interface Token {
  address: string;
  symbol: string;
  name: string;
  logo: any;
}

// Add USDC token constant with logo
const USDC_TOKEN: Token = {
  address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  symbol: "USDC",
  name: "USD Coin",
  logo: usdcLogo,
};

export default function CreateSavingsScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const privyState = usePrivy() as unknown as UsePrivy;
  const { user } = privyState;
  const { address: walletAddress, isConnected } = useWallet();
  const { createEthSavingsPool, createERC20SavingsPool, isLoading } =
    useSavingsPool();
  const { activeTheme } = useTheme();
  const { balances, refreshBalances } = useTokenBalances();

  // Cache token balances and prices
  const [cachedBalances, setCachedBalances] = useState<{
    ETH?: { balance: string; price: number | null };
    USDC?: { balance: string; price: number | null };
  }>({});

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    transactionHash?: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // Update cached values when balances change
  useEffect(() => {
    const newCachedBalances: typeof cachedBalances = {};

    // Update ETH balance
    const ethToken = balances.find((token) => token.symbol === "ETH");
    if (ethToken) {
      newCachedBalances.ETH = {
        balance: ethToken.balance,
        price: ethToken.price || null,
      };
    }

    // Update USDC balance
    const usdcToken = balances.find((token) => token.symbol === "USDC");
    if (usdcToken) {
      newCachedBalances.USDC = {
        balance: usdcToken.balance,
        price: usdcToken.price || null,
      };
    }

    setCachedBalances(newCachedBalances);
  }, [balances]);

  // Calculate USD value using cached price
  const ethBalanceUSD = cachedBalances.ETH?.price
    ? (
        parseFloat(cachedBalances.ETH.balance) * cachedBalances.ETH.price
      ).toFixed(2)
    : "0";

  // Calculate precise measurements
  const containerPadding = 20; // Form section padding
  const containerWidth = width - containerPadding * 2; // Available width minus padding
  const [tokenButtonWidth, setTokenButtonWidth] = useState(0);
  const [durationButtonWidth, setDurationButtonWidth] = useState(0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[activeTheme].secondary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      paddingTop: Platform.OS === "ios" ? 50 : 20,
      paddingBottom: 20,
      backgroundColor: "rgba(42, 87, 65, 0.9)",
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    placeholder: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    formSection: {
      backgroundColor: Colors[activeTheme].card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: Colors[activeTheme].shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[activeTheme].text,
      marginBottom: 20,
      letterSpacing: 0.5,
    },
    tokenTypeContainer: {
      flexDirection: "row",
      marginBottom: 20,
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: TOGGLE_BORDER_RADIUS,
      height: TOGGLE_HEIGHT,
      overflow: "hidden",
      padding: 2,
    },
    tokenTypeButton: {
      flex: 1,
      height: TOGGLE_HEIGHT - 4,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    tokenTypeSliderContainer: {
      position: 'absolute',
      top: 2,
      left: 2,
      right: 2,
      bottom: 2,
    },
    tokenTypeSlider: {
      position: "absolute",
      width: "50%",
      height: "100%",
      backgroundColor: "rgba(42, 87, 65, 0.85)",
      borderRadius: TOGGLE_BORDER_RADIUS - 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    tokenTypeText: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[activeTheme].textSecondary,
      textAlign: "center",
    },
    tokenTypeTextActive: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    tokenTypeTextContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      padding: 0,
      margin: 0,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[activeTheme].text,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    input: {
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: Colors[activeTheme].text,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[activeTheme].border,
    },
    amountInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: Colors[activeTheme].border,
      height: 56,
    },
    amountInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 18,
      color: Colors[activeTheme].text,
      fontWeight: "600",
    },
    amountSymbol: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[activeTheme].textSecondary,
      marginLeft: 8,
    },
    durationContainer: {
      flexDirection: "row",
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: TOGGLE_BORDER_RADIUS,
      height: TOGGLE_HEIGHT,
      overflow: "hidden",
      marginBottom: 20,
      padding: 2,
    },
    durationButton: {
      flex: 1,
      height: TOGGLE_HEIGHT - 4,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    durationSliderContainer: {
      position: 'absolute',
      top: 2,
      left: 2,
      right: 2,
      bottom: 2,
    },
    durationSlider: {
      position: "absolute",
      width: "33.33%",
      height: "100%",
      backgroundColor: "rgba(42, 87, 65, 0.85)",
      borderRadius: TOGGLE_BORDER_RADIUS - 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    durationText: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors[activeTheme].textSecondary,
      textAlign: "center",
    },
    durationTextActive: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    summarySection: {
      backgroundColor: Colors[activeTheme].card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: Colors[activeTheme].shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    summaryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingVertical: 4,
    },
    summaryLabel: {
      fontSize: 15,
      color: Colors[activeTheme].textSecondary,
      fontWeight: "500",
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "700",
      color: Colors[activeTheme].text,
    },
    createButton: {
      backgroundColor: "rgba(42, 87, 65, 0.9)",
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 24,
      marginHorizontal: 16,
      shadowColor: "rgba(42, 87, 65, 0.5)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
    },
    createButtonGradient: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    createButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    authContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
    },
    authTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: Colors[activeTheme].text,
      marginBottom: 8,
    },
    authSubtitle: {
      fontSize: 16,
      color: Colors[activeTheme].textSecondary,
      textAlign: "center",
      marginBottom: 32,
    },
    authButton: {
      backgroundColor: Colors[activeTheme].primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    authButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
    tokenDropdown: {
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[activeTheme].border,
      height: 56,
    },
    tokenDropdownContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    tokenDropdownLogo: {
      width: 28,
      height: 28,
      marginRight: 12,
      borderRadius: 14,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      padding: 4,
    },
    tokenDropdownSymbol: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[activeTheme].text,
    },
    tokenDropdownPlaceholder: {
      fontSize: 16,
      color: Colors[activeTheme].textSecondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: Colors[activeTheme].card,
      borderRadius: 20,
      padding: 20,
      width: "85%",
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[activeTheme].text,
      marginBottom: 16,
    },
    tokenOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors[activeTheme].border,
      borderRadius: 12,
      marginBottom: 8,
    },
    tokenOptionSelected: {
      backgroundColor: Colors[activeTheme].secondaryLight,
    },
    tokenOptionLogo: {
      width: 28,
      height: 28,
      marginRight: 12,
      borderRadius: 14,
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      padding: 6,
    },
    tokenOptionSymbol: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: Colors[activeTheme].text,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalCloseButton: {
      padding: 8,
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 12,
    },
    modalInput: {
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
      fontSize: 16,
      color: Colors[activeTheme].text,
      borderWidth: 1,
      borderColor: Colors[activeTheme].border,
      height: 50,
    },
    modalInputError: {
      borderColor: Colors[activeTheme].error,
    },
    modalInputErrorText: {
      color: Colors[activeTheme].error,
      fontSize: 12,
      marginTop: -12,
      marginBottom: 12,
      marginLeft: 4,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    modalButton: {
      padding: 10,
      borderRadius: 12,
      marginLeft: 12,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    addTokenButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 12,
      marginTop: 12,
    },
    addTokenButtonText: {
      fontSize: 16,
      color: "#2A5741",
      marginLeft: 8,
    },
    calculatedDepositContainer: {
      marginBottom: 0,
      backgroundColor: Colors[activeTheme].secondaryLight,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(30, 59, 47, 0.2)",
    },
    calculatedDepositNote: {
      fontSize: 12,
      color: Colors[activeTheme].textSecondary,
      marginTop: 8,
      fontStyle: "italic",
    },
    calculatedValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(42, 87, 65, 0.2)",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: 8,
    },
    calculatedValue: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[activeTheme].text,
    },
    calculatedSymbol: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[activeTheme].textSecondary,
      marginLeft: 8,
    },
    sectionSeparator: {
      height: 16,
    },
  });

  // State management
  const [tokenType, setTokenType] = useState<"ETH" | "ERC20">("ETH");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [amountToSave, setAmountToSave] = useState("");
  const [duration, setDuration] = useState<number>(90); // 3 months in days
  const [intervals, setIntervals] = useState<number>(3); // 3 deposits
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([USDC_TOKEN]);
  const [newTokenAddress, setNewTokenAddress] = useState("");
  const [newTokenSymbol, setNewTokenSymbol] = useState("");
  const [newTokenName, setNewTokenName] = useState("");
  const [isCreatingPool, setIsCreatingPool] = useState(false);

  // Animation values
  const tokenTypeAnimatedValue = useRef(new Animated.Value(tokenType === "ETH" ? 0 : 1)).current;
  const durationAnimatedValue = useRef(new Animated.Value(duration === 90 ? 0 : duration === 180 ? 1 : 2)).current;

  // Animation configurations
  const animationConfig = {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    useNativeDriver: true
  };

  // Calculate initial deposit based on total amount and intervals
  const calculateInitialDeposit = useCallback(() => {
    if (!amountToSave || parseFloat(amountToSave) <= 0 || intervals <= 0) {
      return "0";
    }

    // Initial deposit is the monthly amount (total / number of months)
    const monthlyAmount = parseFloat(amountToSave) / intervals;
    return monthlyAmount.toFixed(4);
  }, [amountToSave, intervals]);

  // Get initial deposit value
  const initialDeposit = calculateInitialDeposit();

  // Handle token type selection
  const handleTokenTypeSelect = (type: "ETH" | "ERC20") => {
    const toValue = type === "ETH" ? 0 : 1;
    
    Animated.spring(tokenTypeAnimatedValue, {
      toValue,
      friction: 12,
      tension: 80,
      useNativeDriver: true
    }).start();
    
    setTokenType(type);
    if (type === "ETH") {
      setTokenSymbol("ETH");
      setTokenAddress("");
    } else {
      setTokenSymbol("");
    }
  };

  // Handle duration selection
  const handleDurationSelect = (months: number) => {
    const toValue = months === 3 ? 0 : months === 6 ? 1 : 2;
    
    Animated.spring(durationAnimatedValue, {
      toValue,
      friction: 12,
      tension: 80,
      useNativeDriver: true
    }).start();
    
    // Use 365 days for 12 months instead of 360 days
    if (months === 12) {
      setDuration(365); // 365 days for 12 months
    } else {
      setDuration(months * 30); // 30 days per month for 3 and 6 months
    }

    if (months === 3) setIntervals(3);
    else if (months === 6) setIntervals(6);
    else setIntervals(12);
  };

  // Handle token selection
  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setTokenType("ERC20");
    setTokenAddress(token.address);
    setTokenSymbol(token.symbol);
    setShowTokenModal(false);
  };

  // Validate token address
  const validateTokenAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Handle adding new token with validation
  const handleAddToken = () => {
    if (!newTokenAddress || !newTokenSymbol || !newTokenName) {
      Alert.alert("Error", "Please fill in all token details");
      return;
    }

    if (!validateTokenAddress(newTokenAddress)) {
      Alert.alert("Error", "Please enter a valid token address");
      return;
    }

    const newToken: Token = {
      address: newTokenAddress,
      symbol: newTokenSymbol,
      name: newTokenName,
      logo: require("../../assets/images/usdc.png"), // Default to USDC logo for now
    };

    setAvailableTokens([...availableTokens, newToken]);
    setNewTokenAddress("");
    setNewTokenSymbol("");
    setNewTokenName("");
    setShowAddTokenModal(false);
    handleTokenSelect(newToken);
  };

  // Replace the existing token selection UI with this improved version
  const renderTokenSelection = () => {
    if (tokenType !== "ERC20") return null;

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Token</Text>
        <TouchableOpacity
          style={styles.tokenDropdown}
          onPress={() => setShowTokenModal(true)}
        >
          <View style={styles.tokenDropdownContent}>
            {selectedToken ? (
              <>
                {selectedToken.symbol === "USDC" && (
                  <View style={styles.tokenDropdownLogo}>
                    <Image
                      source={require("../../assets/images/usdc.png")}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </View>
                )}
                <Text style={styles.tokenDropdownSymbol}>
                  {selectedToken.symbol}
                </Text>
              </>
            ) : (
              <Text style={styles.tokenDropdownPlaceholder}>
                Select a token
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-down"
            size={24}
            color={Colors[activeTheme].text}
          />
        </TouchableOpacity>

        <Modal
          visible={showTokenModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTokenModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Token</Text>
                <TouchableOpacity
                  onPress={() => setShowTokenModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors[activeTheme].text}
                  />
                </TouchableOpacity>
              </View>

              {availableTokens.map((token, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tokenOption,
                    selectedToken?.symbol === token.symbol &&
                      styles.tokenOptionSelected,
                  ]}
                  onPress={() => handleTokenSelect(token)}
                >
                  {token.symbol === "USDC" && (
                    <View style={styles.tokenOptionLogo}>
                      <Image
                        source={require("../../assets/images/usdc.png")}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                  <Text style={styles.tokenOptionSymbol}>{token.symbol}</Text>
                  {selectedToken?.symbol === token.symbol && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors[activeTheme].primary}
                    />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.addTokenButton}
                onPress={() => {
                  setShowTokenModal(false);
                  setShowAddTokenModal(true);
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={Colors[activeTheme].primary}
                />
                <Text style={styles.addTokenButtonText}>Add Custom Token</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showAddTokenModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddTokenModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Custom Token</Text>
                <TouchableOpacity
                  onPress={() => setShowAddTokenModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors[activeTheme].text}
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.modalInput,
                  !validateTokenAddress(newTokenAddress) &&
                    newTokenAddress.length > 0 &&
                    styles.modalInputError,
                ]}
                placeholder="Token Address (0x...)"
                placeholderTextColor={Colors[activeTheme].textSecondary}
                value={newTokenAddress}
                onChangeText={setNewTokenAddress}
                autoCapitalize="none"
              />
              {!validateTokenAddress(newTokenAddress) &&
                newTokenAddress.length > 0 && (
                  <Text style={styles.modalInputErrorText}>
                    Please enter a valid token address
                  </Text>
                )}

              <TextInput
                style={styles.modalInput}
                placeholder="Token Symbol (e.g. USDC)"
                placeholderTextColor={Colors[activeTheme].textSecondary}
                value={newTokenSymbol}
                onChangeText={setNewTokenSymbol}
                autoCapitalize="characters"
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Token Name"
                placeholderTextColor={Colors[activeTheme].textSecondary}
                value={newTokenName}
                onChangeText={setNewTokenName}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: Colors[activeTheme].secondaryLight },
                  ]}
                  onPress={() => setShowAddTokenModal(false)}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: Colors[activeTheme].text },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: Colors[activeTheme].primary },
                  ]}
                  onPress={handleAddToken}
                >
                  <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
                    Add Token
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // Update the CreateTokenBalanceCard component call to remove onRefresh prop
  const renderBalanceCard = () => {
    if (tokenType === "ETH" && cachedBalances.ETH) {
      return (
        <CreateTokenBalanceCard
          token={{
            symbol: "ETH",
            balance: cachedBalances.ETH.balance,
            price: cachedBalances.ETH.price || undefined,
            logo: ethLogo,
          }}
        />
      );
    }

    if (
      tokenType === "ERC20" &&
      selectedToken?.symbol === "USDC" &&
      cachedBalances.USDC
    ) {
      return (
        <CreateTokenBalanceCard
          token={{
            symbol: "USDC",
            balance: cachedBalances.USDC.balance,
            price: cachedBalances.USDC.price || undefined,
            logo: usdcLogo,
          }}
        />
      );
    }

    return null;
  };

  // Validate form
  const validateForm = () => {
    if (!amountToSave || parseFloat(amountToSave) <= 0) {
      Alert.alert("Error", "Please enter a valid amount to save");
      return false;
    }

    if (parseFloat(initialDeposit) <= 0) {
      Alert.alert(
        "Error",
        "The calculated deposit amount is invalid. Please enter a higher total amount."
      );
      return false;
    }

    if (tokenType === "ERC20" && !tokenAddress) {
      Alert.alert("Error", "Please enter a valid token address");
      return false;
    }

    return true;
  };

  // Create savings pool
  const handleCreateSavingsPool = async () => {
    if (!validateForm()) return;

    if (!walletAddress) {
      Alert.alert(
        "Wallet Not Connected",
        "Please connect your wallet to create a savings pool"
      );
      return;
    }

    setIsCreatingPool(true);

    try {
      // Convert duration from days to seconds
      const durationInSeconds = duration * 24 * 60 * 60;
      let txHash: string;

      if (tokenType === "ETH") {
        txHash = await createEthSavingsPool(
          amountToSave,
          durationInSeconds,
          initialDeposit,
          intervals
        );

        setTimeout(() => {
          setStatusModal({
            visible: true,
            type: "success",
            title: "Transaction Successful",
            message: `ETH Savings Pool Created Successfully`,
            transactionHash: txHash,
          });
          setIsCreatingPool(false);
        }, 500);
      } else {
        console.log("tokenAddress:", tokenAddress);
        txHash = await createERC20SavingsPool(
          tokenAddress,
          amountToSave,
          durationInSeconds,
          initialDeposit,
          intervals
        );

        setTimeout(() => {
          setStatusModal({
            visible: true,
            type: "success",
            title: "Transaction Successful",
            message: `${
              tokenSymbol || "ERC20"
            } Savings Pool Created Successfully`,
            transactionHash: txHash,
          });
          setIsCreatingPool(false);
        }, 500);
      }
    } catch (error) {
      console.error("Error creating savings pool:", error);

      setTimeout(() => {
        setStatusModal({
          visible: true,
          type: "error",
          title: "Transaction Failed",
          message: String(error),
        });
        setIsCreatingPool(false);
      }, 500);
    }
  };

  if (!isConnected || !walletAddress) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Wallet Connection Required</Text>
          <Text style={styles.authSubtitle}>
            Please connect your wallet to create a savings pool
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push("/wallet/connect")}
          >
            <Text style={styles.authButtonText}>Connect Wallet</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Savings Pool</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Token Type</Text>
            <View 
              style={styles.tokenTypeContainer}
              onLayout={(e) => setTokenButtonWidth(e.nativeEvent.layout.width / 2 - 2)}
            >
              <TouchableOpacity
                style={[
                  styles.tokenTypeButton,
                ]}
                onPress={() => handleTokenTypeSelect("ETH")}
              >
                <Text
                  style={[
                    styles.tokenTypeText,
                    tokenType === "ETH" && styles.tokenTypeTextActive,
                  ]}
                >
                  ETH
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tokenTypeButton,
                ]}
                onPress={() => handleTokenTypeSelect("ERC20")}
              >
                <Text
                  style={[
                    styles.tokenTypeText,
                    tokenType === "ERC20" && styles.tokenTypeTextActive,
                  ]}
                >
                  ERC20
                </Text>
              </TouchableOpacity>
              <View style={styles.tokenTypeSliderContainer}>
                <Animated.View
                  style={[
                    styles.tokenTypeSlider,
                    {
                      transform: [
                        {
                          translateX: tokenTypeAnimatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, tokenButtonWidth],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>

            {renderBalanceCard()}

            {renderTokenSelection()}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Savings Plan</Text>

            <Text style={styles.inputLabel}>Total Amount to Save</Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.0"
                placeholderTextColor={Colors.light.textSecondary}
                value={amountToSave}
                onChangeText={setAmountToSave}
                keyboardType="numeric"
              />
              <Text style={styles.amountSymbol}>{tokenSymbol}</Text>
            </View>

            <Text style={styles.inputLabel}>Duration</Text>
            <View 
              style={styles.durationContainer}
              onLayout={(e) => setDurationButtonWidth(e.nativeEvent.layout.width / 3 - 2)}
            >
              <TouchableOpacity
                style={[
                  styles.durationButton,
                ]}
                onPress={() => handleDurationSelect(3)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === 90 && styles.durationTextActive,
                  ]}
                >
                  3 Months
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.durationButton,
                ]}
                onPress={() => handleDurationSelect(6)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === 180 && styles.durationTextActive,
                  ]}
                >
                  6 Months
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.durationButton,
                ]}
                onPress={() => handleDurationSelect(12)}
              >
                <Text
                  style={[
                    styles.durationText,
                    duration === 365 && styles.durationTextActive,
                  ]}
                >
                  12 Months
                </Text>
              </TouchableOpacity>
              <View style={styles.durationSliderContainer}>
                <Animated.View
                  style={[
                    styles.durationSlider,
                    {
                      transform: [
                        {
                          translateX: durationAnimatedValue.interpolate({
                            inputRange: [0, 1, 2],
                            outputRange: [0, durationButtonWidth, durationButtonWidth * 2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>

            <View
              style={[styles.calculatedDepositContainer, { marginTop: 20 }]}
            >
              <Text style={styles.inputLabel}>Monthly Deposit</Text>
              <View style={styles.calculatedValueContainer}>
                <Text style={styles.calculatedValue}>
                  {initialDeposit}
                </Text>
                <Text style={styles.calculatedSymbol}>{tokenSymbol}</Text>
              </View>
              <Text style={styles.calculatedDepositNote}>
                This is the amount you gotta deposit each month
              </Text>
            </View>
          </View>

          <View style={styles.sectionSeparator} />

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Summary</Text>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Token</Text>
              <Text style={styles.summaryValue}>{tokenSymbol}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                {amountToSave ? `${amountToSave} ${tokenSymbol}` : "-"}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monthly Deposit</Text>
              <Text style={styles.summaryValue}>
                {initialDeposit ? `${initialDeposit} ${tokenSymbol}` : "-"}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {duration === 90
                  ? "3 Months"
                  : duration === 180
                  ? "6 Months"
                  : "12 Months"}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Number of Deposits</Text>
              <Text style={styles.summaryValue}>{intervals}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Deposit Frequency</Text>
              <Text style={styles.summaryValue}>Monthly</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Deposit Amount</Text>
              <Text style={styles.summaryValue}>
                {amountToSave && initialDeposit
                  ? `${(
                      (parseFloat(amountToSave) - parseFloat(initialDeposit)) /
                      (intervals - 1)
                    ).toFixed(4)} ${tokenSymbol}`
                  : "-"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateSavingsPool}
            disabled={isCreatingPool}
          >
            <LinearGradient
              colors={["#2A5741", "#1E3B2F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButtonGradient}
            />
            {isCreatingPool ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Savings Pool</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusModal
        visible={statusModal.visible}
        onClose={() => {
          // Properly reset the modal state
          setStatusModal({
            visible: false,
            type: statusModal.type,
            title: statusModal.title,
            message: statusModal.message,
            transactionHash: statusModal.transactionHash,
          });

          // If transaction was successful, navigate back to the savings tab
          if (statusModal.type === "success") {
            router.replace("/tabs/savings");
          }
        }}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        transactionHash={statusModal.transactionHash}
        theme={activeTheme}
      />
    </SafeAreaView>
  );
}

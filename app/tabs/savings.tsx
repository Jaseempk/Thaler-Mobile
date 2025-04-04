import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions,
  Animated,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import ThemedStatusBar from "../../components/ui/ThemedStatusBar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { usePrivy } from "@privy-io/expo";
import { useWallet } from "../../context/WalletContext";
import { SavingsPool } from "../../models/savings";
import { useTheme } from "../../contexts/ThemeContext";
import { useSavingsPool } from "../../context/SavingsPoolContext";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

export default function SavingsScreen() {
  const router = useRouter();
  const { user } = usePrivy();
  const { address: walletAddress, isConnected } = useWallet();
  const { pools, isLoading, error, refreshPools } = useSavingsPool();
  const { activeTheme } = useTheme();
  const isDarkMode = activeTheme === "dark";
  const [refreshing, setRefreshing] = useState(false);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [eerror, setError] = useState<string | null>(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Import token logos
  const ethLogo = require("../../assets/images/ethereum.png");
  const usdcLogo = require("../../assets/images/usdc.png");

  // Animation value for header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [180, 110],
    extrapolate: "clamp",
  });

  // Fetch ETH price and 24h change from CoinGecko
  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.ethereum || !data.ethereum.usd) {
        throw new Error("Invalid ETH price data received");
      }

      setEthPrice(data.ethereum.usd);
      setError(null);
      return {
        price: data.ethereum.usd,
        priceChange24h: data.ethereum.usd_24h_change?.toFixed(2) || "0.00",
      };
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      setError("Failed to fetch ETH price");
      return {
        price: ethPrice || 3000, // Fallback price if fetch fails
        priceChange24h: "0.00",
      };
    }
  };

  // Refresh pools when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      console.log("Loading savings pools for wallet:", walletAddress);
      refreshPools();
      (async () => {
        await fetchEthPrice();
      })();
    }
  }, [isConnected, walletAddress]);

  const handleCreateSavingsPool = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/savings/create");
  };

  const handlePoolPress = (pool: SavingsPool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/savings/[id]",
      params: { id: pool.savingsPoolId },
    });
  };

  const handleDeposit = (pool: SavingsPool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === "ios") {
      Alert.prompt(
        `Deposit to ${pool.isEth ? "ETH" : "ERC20"} Savings Pool`,
        `Enter amount to deposit (${pool.tokenSymbol})`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Deposit",
            onPress: (amount) => {
              if (!amount) return;
              try {
                if (pool.isEth) {
                  router.push({
                    pathname: "/savings/deposit",
                    params: { id: pool.savingsPoolId, amount, token: "ETH" },
                  });
                } else {
                  router.push({
                    pathname: "/savings/deposit",
                    params: {
                      id: pool.savingsPoolId,
                      amount,
                      token: pool.tokenSymbol,
                    },
                  });
                }
              } catch (error) {
                console.error("Error initiating deposit:", error);
                Alert.alert(
                  "Error",
                  "Failed to initiate deposit. Please try again."
                );
              }
            },
          },
        ],
        "plain-text"
      );
    } else {
      // For Android, navigate to a dedicated deposit screen
      router.push({
        pathname: "/savings/deposit-amount",
        params: {
          id: pool.savingsPoolId,
          token: pool.isEth ? "ETH" : pool.tokenSymbol,
        },
      });
    }
  };

  const handleWithdraw = (pool: SavingsPool) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = Date.now();
    console.log("ppoosoosossl:", pool);
    if (now < pool.endDate && pool.progress < 100) {
      Alert.alert(
        "Early Withdrawal",
        "This pool has not ended yet. Early withdrawals require accountability charity donations. Do you want to proceed?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Proceed",
            onPress: () => {
              router.push({
                pathname: "/savings/early-withdrawal",
                params: { id: pool.savingsPoolId, early: "true" },
              });
            },
          },
        ]
      );
    } else {
      router.push({
        pathname: "/savings/withdraw",
        params: { id: pool.savingsPoolId },
      });
    }
  };

  const handlePullToRefresh = async () => {
    setRefreshing(true);
    await refreshPools();
    setRefreshing(false);
  };

  const getLogoForToken = (token: string) => {
    if (token === "ETH") return ethLogo;
    if (token === "USDC") return usdcLogo;
    // Default for other tokens
    return null;
  };

  const SavingsPoolCard = ({
    pool,
    onPress,
    onDeposit,
    onWithdraw,
  }: {
    pool: SavingsPool;
    onPress: (pool: SavingsPool) => void;
    onDeposit: (pool: SavingsPool) => void;
    onWithdraw: (pool: SavingsPool) => void;
  }) => {
    const tokenLogo = getLogoForToken(pool.tokenSymbol);
    const progressWidth = `${pool.progress || 0}%`;

    // Create detail items with keys
    const poolDetails = [
      {
        id: "target",
        label: "Target Amount",
        value: `${pool.amountToSave || 0} ${pool.tokenSymbol}`,
      },
      {
        id: "saved",
        label: "Saved So Far",
        value: `${pool.totalSaved || 0} ${pool.tokenSymbol}`,
      },
      {
        id: "nextDeposit",
        label: "Next Deposit",
        value: pool.nextDepositDate
          ? new Date(pool.nextDepositDate).toLocaleDateString()
          : "-",
      },
    ];

    // Create action buttons with keys
    const actionButtons = [
      {
        id: "deposit",
        label: "Deposit",
        icon: "arrow-up" as const,
        color: Colors[activeTheme].primary,
        backgroundColor: isDarkMode
          ? "rgba(75, 181, 67, 0.15)"
          : "rgba(75, 181, 67, 0.1)",
        onAction: () => onDeposit(pool),
      },
      {
        id: "withdraw",
        label: "Withdraw",
        icon: "arrow-down" as const,
        color: isDarkMode ? "#EF4444" : "#DC2626",
        backgroundColor: isDarkMode
          ? "rgba(239, 68, 68, 0.15)"
          : "rgba(239, 68, 68, 0.1)",
        onAction: () => onWithdraw(pool),
      },
    ];

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.poolCard,
          { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" },
        ]}
        onPress={() => onPress(pool)}
      >
        {/* Card Header */}
        <View style={styles.poolCardHeader}>
          <View style={styles.poolCardHeaderLeft}>
            {tokenLogo ? (
              <Image source={tokenLogo} style={styles.tokenLogo} />
            ) : (
              <View
                style={[
                  styles.tokenLogoFallback,
                  { backgroundColor: pool.isEth ? "#627EEA" : "#2775CA" },
                ]}
              >
                <Text style={styles.tokenLogoText}>
                  {pool.tokenSymbol.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.poolTitleContainer}>
              <Text
                style={[
                  styles.poolTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                {pool.tokenSymbol} Savings
              </Text>
              <Text
                style={[
                  styles.poolSubtitle,
                  { color: isDarkMode ? "#AAAAAA" : "#888888" },
                ]}
              >
                {pool.duration / 30 || 6} Month Plan
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isDarkMode
                  ? "rgba(75, 181, 67, 0.2)"
                  : "rgba(75, 181, 67, 0.15)",
              },
            ]}
          >
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: (width * (pool.progress || 0)) / 100,
                  backgroundColor: Colors[activeTheme].primary,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressText,
              { color: isDarkMode ? "#AAAAAA" : "#888888" },
            ]}
          >
            {pool.progress || 0}% Complete
          </Text>
        </View>

        {/* Pool Details */}
        <View style={styles.poolDetailsContainer}>
          {poolDetails.map((detail) => (
            <View key={detail.id} style={styles.poolDetailRow}>
              <Text
                style={[
                  styles.poolDetailLabel,
                  { color: isDarkMode ? "#AAAAAA" : "#888888" },
                ]}
              >
                {detail.label}
              </Text>
              <Text
                style={[
                  styles.poolDetailValue,
                  { color: isDarkMode ? "#FFFFFF" : "#000000" },
                ]}
              >
                {detail.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {actionButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={[
                styles.actionButton,
                { backgroundColor: button.backgroundColor },
              ]}
              onPress={button.onAction}
            >
              <Ionicons name={button.icon} size={20} color={button.color} />
              <Text style={[styles.actionButtonText, { color: button.color }]}>
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[activeTheme].background },
        ]}
      >
        <ThemedStatusBar />
        <LinearGradient
          colors={[
            isDarkMode ? "#1A1A1A" : "#F8F9FA",
            isDarkMode ? "#121212" : "#FFFFFF",
          ]}
          style={styles.authGradient}
        >
          <View style={styles.authContainer}>
            <LottieView source={""} style={styles.lottieAuth} autoPlay loop />
            <Text
              style={[
                styles.authTitle,
                { color: isDarkMode ? "#FFFFFF" : "#000000" },
              ]}
            >
              Authentication Required
            </Text>
            <Text
              style={[
                styles.authSubtitle,
                { color: isDarkMode ? "#AAAAAA" : "#666666" },
              ]}
            >
              Please log in to view your savings pools
            </Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={() => router.push("/auth/welcome")}
            >
              <LinearGradient
                colors={[
                  Colors[activeTheme].primary,
                  Colors[activeTheme].primaryLight,
                ]}
                style={styles.authButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.authButtonText}>Go to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F8F9FA" },
      ]}
    >
      <ThemedStatusBar />

      {/* Animated Header with Balance */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <LinearGradient
          colors={[
            Colors[activeTheme].primary,
            Colors[activeTheme].primaryLight,
          ]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Savings Pools</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateSavingsPool}
              >
                <BlurView
                  intensity={30}
                  tint="light"
                  style={styles.blurButtonBg}
                >
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {pools.length > 0 && (
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500, delay: 300 }}
                style={styles.balanceSummary}
              >
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Total Savings</Text>
                  <Text style={styles.balanceAmount}>
                    $
                    {pools
                      .reduce((sum, pool) => {
                        // Convert ETH to approximate USD for display
                        let amount = Number(pool.totalSaved || 0);
                        if (pool.tokenSymbol === "ETH") {
                          amount = amount * ethPrice; // Convert ETH to USD using current price
                        }
                        return sum + amount;
                      }, 0)
                      .toFixed(2)}
                  </Text>
                </View>

                <View style={styles.statContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pools.length}</Text>
                    <Text style={styles.statLabel}>Pools</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(
                        pools.reduce(
                          (sum, pool) => sum + (pool.progress || 0),
                          0
                        ) / pools.length
                      )}
                      %
                    </Text>
                    <Text style={styles.statLabel}>Avg Progress</Text>
                  </View>
                </View>
              </MotiView>
            )}
          </View>
        </LinearGradient>
      </Animated.View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LottieView source={""} style={styles.lottieLoading} autoPlay loop />
          <Text
            style={[styles.loadingText, { color: Colors[activeTheme].text }]}
          >
            Loading your savings pools...
          </Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlePullToRefresh}
              tintColor={Colors[activeTheme].text}
              colors={[Colors[activeTheme].primary]}
            />
          }
        >
          {pools.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LottieView
                source={""}
                style={styles.lottieEmpty}
                autoPlay
                loop
              />

              <Text
                style={[styles.emptyTitle, { color: Colors[activeTheme].text }]}
              >
                No Savings Pools Yet
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: Colors[activeTheme].textSecondary },
                ]}
              >
                Start saving by creating your first savings pool
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateSavingsPool}
              >
                <LinearGradient
                  colors={[
                    Colors[activeTheme].primary,
                    Colors[activeTheme].primaryLight,
                  ]}
                  style={styles.emptyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.emptyButtonText}>
                    Create Savings Pool
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeaderContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Your Savings Pools
                </Text>
                {pools.length > 0 && (
                  <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() =>
                      Alert.alert(
                        "Sort",
                        "Sorting options will be available soon."
                      )
                    }
                  >
                    <Ionicons
                      name="filter"
                      size={18}
                      color={isDarkMode ? "#AAAAAA" : "#888888"}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Use MotiView.FlatList for better performance with animations */}
              {pools.map((pool, index) => {
                // Generate a guaranteed unique key using index as fallback
                const uniqueKey = pool.savingsPoolId
                  ? `pool-${pool.savingsPoolId}`
                  : `pool-index-${index}`;

                return (
                  <MotiView
                    key={uniqueKey}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 400 }}
                  >
                    <SavingsPoolCard
                      key={uniqueKey}
                      pool={pool}
                      onPress={handlePoolPress}
                      onDeposit={handleDeposit}
                      onWithdraw={handleWithdraw}
                    />
                  </MotiView>
                );
              })}
            </>
          )}

          {/* Extra space at bottom for better scrolling */}
          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      )}

      {/* Floating Action Button */}
      {pools.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateSavingsPool}>
          <LinearGradient
            colors={[
              Colors[activeTheme].primary,
              Colors[activeTheme].primaryLight,
            ]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    width: "100%",
    overflow: "hidden",
  },
  headerGradient: {
    flex: 1,
    paddingBottom: 15,
  },
  headerContent: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  blurButtonBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  balanceSummary: {
    marginTop: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  sortButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieLoading: {
    width: 120,
    height: 120,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    minHeight: 400,
  },
  lottieEmpty: {
    width: 180,
    height: 180,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonGradient: {
    paddingHorizontal: 36,
    paddingVertical: 16,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  authGradient: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  lottieAuth: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  authButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  authButtonGradient: {
    paddingHorizontal: 36,
    paddingVertical: 16,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  poolCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  poolCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  poolCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "contain",
  },
  tokenLogoFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tokenLogoText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  poolTitleContainer: {
    marginLeft: 12,
  },
  poolTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  poolSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: "#4BB543",
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(200, 200, 200, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    marginTop: 6,
    textAlign: "right",
  },
  poolDetailsContainer: {
    marginBottom: 16,
  },
  poolDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  poolDetailLabel: {
    fontSize: 15,
  },
  poolDetailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    flex: 0.485,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 30,
    width: 60,
    height: 60,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

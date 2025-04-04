import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Clipboard,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from "../../context/WalletContext";
import Colors from "../../constants/Colors";
import { useTheme } from "../../contexts/ThemeContext";
import TokenBalanceCard from "../../components/wallet/TokenBalanceCard";
import TokenBalanceCardSkeleton from "../../components/wallet/TokenBalanceCardSkeleton";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useRouter } from "expo-router";
import { useTokenBalances } from "../../hooks/useTokenBalances";
import * as Font from "expo-font";

const { width } = Dimensions.get("window");

// Mock transaction data
const recentActivity = [
  {
    id: "1",
    name: "Swap ETH to USDC",
    date: "Today, 16:30",
    amount: "-0.05 ETH",
    type: "swap",
    avatar: "S",
    avatarColor: "#627EEA",
  },
  {
    id: "2",
    name: "Received USDC",
    date: "Today, 10:15",
    amount: "+25 USDC",
    type: "receive",
    avatar: "R",
    avatarColor: "#2775CA",
  },
  {
    id: "3",
    name: "Sent MATIC",
    date: "Yesterday",
    amount: "-10 MATIC",
    type: "send",
    avatar: "S",
    avatarColor: "#8247E5",
  },
];
//0xDEbd09128C04da6ecf14B8391141D732e420FE05
export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { activeTheme, toggleTheme } = useTheme();
  const { address, isConnected, connectWallet } = useWallet();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [userName, setUserName] = useState("Jonathan");
  const [isDarkMode, setIsDarkMode] = useState(activeTheme === "dark");
  const { balances, totalBalanceUSD, isLoading, refreshBalances } =
    useTokenBalances();

  console.log("totalBalances:", totalBalanceUSD);

  // Format the address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Update the switch state when theme changes
  useEffect(() => {
    setIsDarkMode(activeTheme === "dark");
  }, [activeTheme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      Alert.alert("Connection Error", "Failed to connect wallet");
    }
  };

  // Real-time token data
  const tokenData = balances.map((token, index) => ({
    id: String(index + 1),
    symbol: token.symbol,
    name: token.name,
    balance: token.balance,
    value:
      token.symbol === "ETH"
        ? (parseFloat(token.balance) * (token.price || 0)).toFixed(2)
        : token.balance,
    change: token.priceChange24h || "0.00",
    isPositive: parseFloat(token.priceChange24h || "0.00") >= 0,
    logo:
      token.symbol === "ETH"
        ? require("../../assets/images/ethereum.png")
        : require("../../assets/images/usdc.png"),
    gradientColors:
      token.symbol === "ETH"
        ? (["#627EEA", "#3C5BE0"] as [string, string])
        : (["#2775CA", "#2775CA"] as [string, string]),
  }));

  // Default token skeletons to show when data is loading
  const defaultTokens = [
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDC", name: "USD Coin" },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[activeTheme].background },
      ]}
    >
      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: Colors[activeTheme].background },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshBalances}
            tintColor={Colors[activeTheme].primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text
              style={[styles.greeting, { color: Colors[activeTheme].text }]}
            >
              Hi, {userName}
            </Text>
            <Text
              style={[
                styles.welcomeBack,
                { color: Colors[activeTheme].textSecondary },
              ]}
            >
              Welcome Back!
            </Text>
          </View>
          <View style={styles.headerRight}>
            {/* Theme Toggle Icon */}
            <TouchableOpacity
              style={styles.themeToggleButton}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
            >
              {isDarkMode ? (
                <Ionicons name="moon" size={22} color="#9BA4B5" />
              ) : (
                <Ionicons name="sunny" size={22} color="#FFC107" />
              )}
            </TouchableOpacity>
            {/* Notification Icon */}
            <TouchableOpacity
              style={[
                styles.notificationIcon,
                { backgroundColor: Colors[activeTheme].secondaryLight },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors[activeTheme].text}
              />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.balanceContainer}>
          <LinearGradient
            colors={
              isDarkMode 
                ? ["#1E3B2F", "#2A5741"] // Dark green gradient for dark mode
                : ["#1E3B2F", "#2A5741"] // Same dark green for light mode
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceContent}>
              <View style={styles.balanceTopRow}>
                <View>
                  <View style={styles.balanceRow}>
                    <TouchableOpacity
                      onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                    >
                      <Text style={styles.balanceAmountLight}>
                        $
                        {isConnected
                          ? isBalanceVisible
                            ? totalBalanceUSD
                            : "••••••"
                          : "---"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {isConnected ? (
                  <View />
                ) : (
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={handleConnectWallet}
                  >
                    <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.connectText}>Connect Wallet</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Embedded wallet address section */}
              {isConnected && address && (
                <View style={styles.walletAddressSection}>
                  <View style={styles.walletHeaderRow}>
                    <View style={styles.walletIconContainer}>
                      <Ionicons
                        name="wallet-outline"
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.walletTitle}>Embedded Wallet</Text>
                  </View>

                  <View style={styles.addressContainer}>
                    <Text style={styles.addressText}>
                      {formatAddress(address)}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => {
                        if (address) {
                          Clipboard.setString(address);
                          Alert.alert(
                            "Copied",
                            "Wallet address copied to clipboard"
                          );
                        }
                      }}
                    >
                      <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Wallet Action Buttons */}
                  <View style={styles.walletActionButtonsContainer}>
                    <TouchableOpacity
                      style={styles.walletActionButton}
                      onPress={() => router.push("/deposit")}
                    >
                      <View style={styles.walletActionButtonIcon}>
                        <MaterialCommunityIcons
                          name="arrow-down"
                          size={20}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.walletActionButtonText}>Deposit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.walletActionButton,
                        styles.createPoolButton,
                      ]}
                      onPress={() => router.push("/savings/create")}
                    >
                      <View style={styles.walletActionButtonIcon}>
                        <MaterialCommunityIcons
                          name="bank-plus"
                          size={22}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.walletActionButtonText}>
                        Create Pool
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.walletActionButton}
                      onPress={() => router.push("/withdraw")}
                    >
                      <View style={styles.walletActionButtonIcon}>
                        <MaterialCommunityIcons
                          name="arrow-up"
                          size={20}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.walletActionButtonText}>
                        Withdraw
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
        {/* Token Balances */}
        <View style={styles.tokensSection}>
          <View style={styles.sectionHeader}>
            {/* <TouchableOpacity style={styles.seeAllButton}>
              </TouchableOpacity> */}
            {/* <Text
                style={[
                  styles.seeAllText,
                  { color: Colors[activeTheme].primary },
                ]}
              >
                See All
              </Text> */}
            {/* <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors[activeTheme].primary}
              /> */}
          </View>
          <Text
            style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}
          >
            Token Balances
          </Text>
          {/* Always display token cards, either as skeletons or with real data */}
          {tokenData.length > 0
            ? // Show real data when available
              tokenData.map((token) => (
                <TokenBalanceCard
                  key={token.id}
                  token={token}
                  theme={activeTheme}
                />
              ))
            : // Show skeletons when no data is available yet
              defaultTokens.map((_, index) => (
                <TokenBalanceCardSkeleton key={index} theme={activeTheme} />
              ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}
            >
              Recent Activity
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => alert("Navigate to all transactions")}
            >
              <Text
                style={[
                  styles.seeAllText,
                  { color: Colors[activeTheme].primary },
                ]}
              >
                See All
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors[activeTheme].primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.activityStack}>
            {recentActivity.slice(0, 3).map((activity, index) => {
              // Create a more dynamic floating card for each transaction
              const AnimatedCard = () => {
                // Calculate the offset for stacked appearance
                const topOffset = index * 12;
                const scale = 1 - index * 0.04;
                const opacity = 1 - index * 0.15;

                // Create animated value for floating effect
                const translateY = useRef(new Animated.Value(0)).current;

                useEffect(() => {
                  // Create a subtle floating animation
                  const floatAnimation = Animated.loop(
                    Animated.sequence([
                      Animated.timing(translateY, {
                        toValue: -2,
                        duration: 1500 + index * 300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                      }),
                      Animated.timing(translateY, {
                        toValue: 2,
                        duration: 1500 + index * 300,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                      }),
                    ])
                  );

                  floatAnimation.start();

                  return () => {
                    floatAnimation.stop();
                  };
                }, []);

                return (
                  <Animated.View
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: Colors[activeTheme].card,
                        top: topOffset,
                        transform: [{ scale }, { translateY }],
                        opacity,
                        zIndex: recentActivity.length - index,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.activityCardContent}
                      activeOpacity={0.7} // More responsive
                      onPress={() => alert(`View details for ${activity.name}`)}
                    >
                      <View style={styles.activityLeftSection}>
                        <View
                          style={[
                            styles.activityAvatar,
                            { backgroundColor: activity.avatarColor },
                          ]}
                        >
                          {activity.type === "send" && (
                            <FontAwesome5
                              name="arrow-up"
                              size={14}
                              color="#FFF"
                            />
                          )}
                          {activity.type === "receive" && (
                            <FontAwesome5
                              name="arrow-down"
                              size={14}
                              color="#FFF"
                            />
                          )}
                          {activity.type === "swap" && (
                            <MaterialCommunityIcons
                              name="swap-horizontal"
                              size={16}
                              color="#FFF"
                            />
                          )}
                        </View>
                        <View style={styles.activityDetails}>
                          <Text
                            style={[
                              styles.activityName,
                              { color: Colors[activeTheme].text },
                            ]}
                          >
                            {activity.name}
                          </Text>
                          <Text
                            style={[
                              styles.activityDate,
                              { color: Colors[activeTheme].textSecondary },
                            ]}
                          >
                            {activity.date}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.activityRightSection}>
                        <Text
                          style={[
                            styles.activityAmount,
                            {
                              color:
                                activity.type === "receive"
                                  ? Colors[activeTheme].success
                                  : Colors[activeTheme].text,
                            },
                          ]}
                        >
                          {activity.amount}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              };

              return <AnimatedCard key={activity.id} />;
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.viewAllTransactionsButton,
              { backgroundColor: Colors[activeTheme].card },
            ]}
            onPress={() => alert("Navigate to all transactions")}
          >
            <Text
              style={[
                styles.viewAllText,
                { color: Colors[activeTheme].primary },
              ]}
            >
              View All Transactions
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors[activeTheme].primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Add extra padding at the bottom for better scrolling
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  welcomeBack: {
    fontSize: 16,
    color: "#666",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationIcon: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  balanceContainer: {
    marginBottom: 16,
    minHeight: 180, // Increased minimum height to fit all content
  },
  balanceGradient: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  balanceContent: {
    padding: 16,
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabelLight: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  balanceAmountLight: {
    fontSize: 40,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  eyeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  refreshText: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontSize: 14,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  connectText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#FFFFFF",
  },
  walletAddressSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 80, // Increased minimum height to fit content
    overflow: "visible", // Show all content
  },
  walletHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  walletIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  walletTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8, // Add margin to prevent text from touching copy button
  },
  copyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletActionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  walletActionButton: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  walletActionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  walletActionButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 6,
  },
  createPoolButton: {
    transform: [{ scale: 1.15 }],
    marginHorizontal: 8,
  },
  tokensSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  cardsSection: {
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  cardItem: {
    width: 120,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    justifyContent: "flex-end",
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#000",
  },
  recentActivity: {
    marginBottom: 24,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  activityStack: {
    position: "relative",
    marginBottom: 16,
    height: 220, // Adjust based on your card height and stack size
  },
  activityCard: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.85)", // More transparent for better stack effect
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activityCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  activityLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  activityDetails: {
    justifyContent: "center",
  },
  activityName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
  activityRightSection: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  activityTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginTop: 4,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  viewAllTransactionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  incomeAmount: {
    color: Colors.light.success,
  },
  expenseAmount: {
    color: "#000",
  },
});

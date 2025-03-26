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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";

const { width } = Dimensions.get("window");

// Mock token data
const tokenData = [
  {
    id: "1",
    symbol: "ETH",
    name: "Ethereum",
    balance: "0.42",
    value: "1,285.60",
    change: "2.4",
    isPositive: true,
    logo: require("../../assets/images/ethereum.png"),
    gradientColors: ["#627EEA", "#3C5BE0"] as [string, string],
  },
  {
    id: "2",
    symbol: "USDC",
    name: "USD Coin",
    balance: "325.75",
    value: "325.75",
    change: "0.01",
    isPositive: true,
    logo: require("../../assets/images/usdc.png"),
    gradientColors: ["#2775CA", "#2775CA"] as [string, string],
  },
  {
    id: "3",
    symbol: "USDT",
    name: "Tether",
    balance: "150.00",
    value: "150.00",
    change: "0.00",
    isPositive: true,
    logo: require("../../assets/images/usdt.png"),
    gradientColors: ["#26A17B", "#1A9270"] as [string, string],
  },
  {
    id: "4",
    symbol: "MATIC",
    name: "Polygon",
    balance: "45.32",
    value: "38.52",
    change: "1.2",
    isPositive: false,
    logo: require("../../assets/images/matic.png"),
    gradientColors: ["#8247E5", "#6F3CD0"] as [string, string],
  },
];

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

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeTheme, toggleTheme } = useTheme();
  const { address, balance, isConnected, connectWallet } = useWallet();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [userName, setUserName] = useState("Jonathan");
  const [isDarkMode, setIsDarkMode] = useState(activeTheme === "dark");
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState("1,800.87");

  // Format the address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Format the balance for display
  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance);
    return balanceNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  // Handle refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching updated balances
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      Alert.alert("Connection Error", "Failed to connect wallet");
    }
  };

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
            refreshing={refreshing}
            onRefresh={onRefresh}
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
              isDarkMode ? ["#2E7D32", "#1A237E"] : ["#4CAF50", "#1E88E5"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceContent}>
              <View style={styles.balanceTopRow}>
                <View>
                  <Text style={styles.balanceLabelLight}>Total Balance</Text>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceAmountLight}>
                      $
                      {isConnected
                        ? isBalanceVisible
                          ? formatBalance(totalBalance)
                          : "••••••"
                        : "---"}
                    </Text>
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                    >
                      <Ionicons
                        name={
                          isBalanceVisible ? "eye-outline" : "eye-off-outline"
                        }
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {isConnected ? (
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                  >
                    {refreshing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name="refresh-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                    <Text style={styles.refreshText}>Refresh</Text>
                  </TouchableOpacity>
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

                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusIndicator,
                        {
                          backgroundColor: isConnected ? "#4CD964" : "#FF3B30",
                        },
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Wallet address card is now integrated into the balance card above */}

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
          {tokenData.map((token) => (
            <TokenBalanceCard
              key={token.id}
              token={token}
              theme={activeTheme}
            />
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => alert("Send tokens")}
          >
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: Colors[activeTheme].primary },
              ]}
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#1E88E5", "#1565C0"] : ["#2196F3", "#1976D2"]
                }
                style={styles.actionButtonGradient}
              >
                <FontAwesome5 name="paper-plane" size={18} color="#fff" />
              </LinearGradient>
            </View>
            <Text
              style={[
                styles.actionButtonText,
                { color: Colors[activeTheme].text },
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => alert("Receive tokens")}
          >
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: Colors[activeTheme].accent },
              ]}
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#43A047", "#2E7D32"] : ["#4CAF50", "#388E3C"]
                }
                style={styles.actionButtonGradient}
              >
                <FontAwesome5 name="qrcode" size={18} color="#fff" />
              </LinearGradient>
            </View>
            <Text
              style={[
                styles.actionButtonText,
                { color: Colors[activeTheme].text },
              ]}
            >
              Receive
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Savings')}
          >
            <View
              style={[
                styles.actionButtonIcon,
                { backgroundColor: isDarkMode ? "#303F9F" : "#3F51B5" },
              ]}
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#7B1FA2", "#6A1B9A"] : ["#9C27B0", "#7B1FA2"]
                }
                style={styles.actionButtonGradient}
              >
                <MaterialCommunityIcons
                  name="piggy-bank"
                  size={22}
                  color="#fff"
                />
              </LinearGradient>
            </View>
            <Text
              style={[
                styles.actionButtonText,
                { color: Colors[activeTheme].text },
              ]}
            >
              Savings
            </Text>
          </TouchableOpacity>
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
                        <View
                          style={[
                            styles.activityTypeTag,
                            {
                              backgroundColor:
                                activity.type === "receive"
                                  ? "rgba(76, 217, 100, 0.15)"
                                  : activity.type === "send"
                                  ? "rgba(255, 59, 48, 0.15)"
                                  : "rgba(90, 200, 250, 0.15)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activityTypeText,
                              {
                                color:
                                  activity.type === "receive"
                                    ? Colors[activeTheme].success
                                    : activity.type === "send"
                                    ? Colors[activeTheme].error
                                    : Colors[activeTheme].primary,
                              },
                            ]}
                          >
                            {activity.type.charAt(0).toUpperCase() +
                              activity.type.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              };

              // Return the animated card component with a key
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
    fontSize: 30,
    fontWeight: "bold",
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
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 80, // Increased minimum height to fit content
    overflow: "visible", // Show all content
  },
  walletHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
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

  // seeAllText: {
  //   fontSize: 14,
  //   marginRight: 4,
  // },
});

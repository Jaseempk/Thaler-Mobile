import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Clipboard,
  Image,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// Removed expo-blur import as it's not installed
import ThemedStatusBar from "../../components/ui/ThemedStatusBar";
import Colors from "../../constants/Colors";
import { usePrivy } from "@privy-io/expo";
import { useTheme } from "../../contexts/ThemeContext";
import { usePrivyContext } from "../../context/PrivyContext";
import { useWallet } from "../../context/WalletContext";
import { UsePrivy } from "../../types/privy";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 80; // Further reduced header height

export default function ProfileScreen() {
  const router = useRouter();
  const privyHook = usePrivy();
  const {
    logout,
    user: privyUser,
    exportWallet,
  } = privyHook as unknown as UsePrivy;
  const { user } = usePrivyContext();
  const { address: walletAddress, isConnected } = useWallet();
  const { activeTheme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    activeTheme === "dark"
  );
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/welcome");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Failed", "Please try again later.");
    }
  };
  // Extract user email and name from Privy user data
  useEffect(() => {
    if (privyUser) {
      // Check for email in linkedAccounts
      const emailAccount = privyUser.linkedAccounts?.find(
        (account: { type: string; address?: string }) =>
          account.type === "email"
      );
      if (emailAccount && emailAccount.address) {
        setUserEmail(emailAccount.address);
        // Extract name from email (part before @)
        const nameFromEmail = emailAccount.address.split("@")[0];
        setUserName(nameFromEmail);
      }
    }
  }, [privyUser]);

  const handleWalletDetails = () => {
    if (!isConnected || !walletAddress) {
      Alert.alert("No Wallet", "You don't have a wallet connected yet.");
      return;
    }

    // Show wallet details or redirect to wallet management screen
    Alert.alert(
      "Wallet Details",
      `Address: ${walletAddress}\n\nThis is a Privy embedded wallet managed securely for you.`
    );
  };

  const copyWalletAddress = () => {
    if (isConnected && walletAddress) {
      Clipboard.setString(walletAddress);
      Alert.alert("Copied", "Wallet address copied to clipboard");
      console.log("Copied wallet address to clipboard:", walletAddress);
    }
  };

  const handleExportPrivateKey = () => {
    if (!isConnected || !walletAddress) {
      Alert.alert("No Wallet", "You don't have a wallet connected yet.");
      return;
    }

    // Check if the user has an embedded wallet
    const hasEmbeddedWallet = privyUser?.linkedAccounts?.some(
      (account: { type: string; [key: string]: any }) =>
        account.type === "wallet" &&
        account.wallet_client === "privy" &&
        account.chain_type === "ethereum"
    );

    if (!hasEmbeddedWallet) {
      Alert.alert(
        "Not Available",
        "Private key export is only available for embedded wallets."
      );
      return;
    }

    try {
      // Use Privy's exportWallet method to allow the user to export their private key
      console.log("Attempting to export wallet private key");
      exportWallet();
    } catch (error) {
      console.error("Error exporting wallet:", error);
      Alert.alert(
        "Export Failed",
        "There was an error exporting your wallet. Please try again later."
      );
    }
  };

  const handleChangePassword = () => {
    // In a real app, this would navigate to a password change screen
    Alert.alert(
      "Change Password",
      "Password management is handled by Privy authentication. Please use the password reset option from the login screen if needed."
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, this would call an API to delete the user's account
            Alert.alert(
              "Account Deletion",
              "Your account deletion request has been submitted."
            );
            handleLogout();
          },
        },
      ]
    );
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    toggleTheme();
  };

  // Check if user exists before rendering
  if (!privyUser) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[activeTheme].background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <Text
            style={[styles.loadingText, { color: Colors[activeTheme].text }]}
          >
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const profileImageSize = 100;

  // Calculate header animations
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 1.5], // Adjusted to keep more of the header visible when scrolling
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, HEADER_HEIGHT],
    outputRange: [1.2, 1, 0.9],
    extrapolate: "clamp",
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, 30], // Increased to move image down more when scrolling
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 50],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[activeTheme].background },
      ]}
    >
      <StatusBar translucent backgroundColor="transparent" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslate }] },
        ]}
      >
        <LinearGradient
          colors={
            activeTheme === "dark"
              ? ["#1A237E", "#303F9F", "#3949AB"]
              : ["#3F51B5", "#5C6BC0", "#7986CB"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          <Animated.View
            style={[styles.headerContent, { opacity: headerOpacity }]}
          >
            <Text style={styles.headerTitle}>Profile</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Profile Header Spacer - adjusted to give more space for profile pic */}
        <View style={{ height: HEADER_HEIGHT - 20 }} />

        {/* Profile Image and Info */}
        <View style={styles.profileImageContainer}>
          <Animated.View
            style={[
              styles.profileImageWrapper,
              {
                transform: [
                  { scale: imageScale },
                  { translateY: imageTranslateY },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={
                activeTheme === "dark"
                  ? ["#5C6BC0", "#3F51B5"]
                  : ["#7986CB", "#5C6BC0"]
              }
              style={styles.profileImageGradient}
            >
              <Text style={styles.profileInitial}>
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.profileInfoContainer}>
            <Text
              style={[styles.profileName, { color: Colors[activeTheme].text }]}
            >
              {userName || "User"}
            </Text>

            <Text
              style={[
                styles.profileEmail,
                { color: Colors[activeTheme].textSecondary },
              ]}
            >
              {userEmail || "No email provided"}
            </Text>

            <View style={styles.walletContainer}>
              <TouchableOpacity
                style={[
                  styles.walletButton,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
                onPress={handleWalletDetails}
              >
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={18}
                  color={Colors[activeTheme].primary}
                  style={styles.walletIcon}
                />
                <Text
                  style={[
                    styles.walletButtonText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  {walletAddress
                    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                    : "No Wallet Connected"}
                </Text>
                {walletAddress && (
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={copyWalletAddress}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={Colors[activeTheme].primary}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: activeTheme === "dark" ? "#303F9F" : "#5C6BC0",
              },
            ]}
          >
            <View style={styles.statsIconContainer}>
              <MaterialCommunityIcons
                name="chart-timeline-variant"
                size={24}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.statsValue}>12</Text>
            <Text style={styles.statsLabel}>Transactions</Text>
          </View>

          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: activeTheme === "dark" ? "#1A237E" : "#3F51B5",
              },
            ]}
          >
            <View style={styles.statsIconContainer}>
              <MaterialCommunityIcons
                name="swap-horizontal"
                size={24}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.statsValue}>3</Text>
            <Text style={styles.statsLabel}>Networks</Text>
          </View>

          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: activeTheme === "dark" ? "#283593" : "#7986CB",
              },
            ]}
          >
            <View style={styles.statsIconContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.statsValue}>28d</Text>
            <Text style={styles.statsLabel}>Active</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View
          style={[
            styles.cardContainer,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="settings"
              size={22}
              color={Colors[activeTheme].primary}
            />
            <Text
              style={[styles.cardTitle, { color: Colors[activeTheme].text }]}
            >
              Preferences
            </Text>
          </View>

          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.settingText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: Colors[activeTheme].border,
                  true: Colors[activeTheme].primary,
                }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Ionicons
                  name="finger-print-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.settingText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Biometric Auth
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{
                  false: Colors[activeTheme].border,
                  true: Colors[activeTheme].primary,
                }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Ionicons
                  name="moon-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.settingText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleDarkModeToggle}
                trackColor={{
                  false: Colors[activeTheme].border,
                  true: Colors[activeTheme].primary,
                }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View
          style={[
            styles.cardContainer,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="security"
              size={22}
              color={Colors[activeTheme].primary}
            />
            <Text
              style={[styles.cardTitle, { color: Colors[activeTheme].text }]}
            >
              Security
            </Text>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleWalletDetails}
            >
              <View style={styles.menuItemContent}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Wallet Details
                </Text>
              </View>
              <View
                style={[
                  styles.menuArrow,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleExportPrivateKey}
            >
              <View style={styles.menuItemContent}>
                <Ionicons
                  name="key-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Export Private Key
                </Text>
              </View>
              <View
                style={[
                  styles.menuArrow,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <View style={styles.menuItemContent}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Change Password
                </Text>
              </View>
              <View
                style={[
                  styles.menuArrow,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View
          style={[
            styles.cardContainer,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="info-outline"
              size={22}
              color={Colors[activeTheme].primary}
            />
            <Text
              style={[styles.cardTitle, { color: Colors[activeTheme].text }]}
            >
              About
            </Text>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  About Thaler
                </Text>
              </View>
              <View
                style={[
                  styles.menuArrow,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Terms of Service
                </Text>
              </View>
              <View
                style={[
                  styles.menuArrow,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <Ionicons
                  name="shield-outline"
                  size={22}
                  color={Colors[activeTheme].primary}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: Colors[activeTheme].text },
                  ]}
                >
                  Privacy Policy
                </Text>
              </View>
              <View
                style={[
                  styles.menuArrow,
                  {
                    backgroundColor:
                      activeTheme === "dark"
                        ? "rgba(92, 107, 192, 0.2)"
                        : "rgba(63, 81, 181, 0.1)",
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#FFFFFF"
              style={styles.actionButtonIcon}
            />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="#FFFFFF"
              style={styles.actionButtonIcon}
            />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Animated Header
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: HEADER_HEIGHT,
  },
  headerGradient: {
    height: HEADER_HEIGHT,
    width: "100%",
    justifyContent: "flex-end",
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  // Profile Image and Info
  profileImageContainer: {
    alignItems: "center",
    marginTop: -50, // Adjusted to position profile pic properly
    marginBottom: 24,
    paddingHorizontal: 16,
    zIndex: 20, // Ensure profile image stays on top when scrolling
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  profileImageGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileInfoContainer: {
    alignItems: "center",
    width: "100%",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  walletContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 10, // Added padding to ensure wallet card has room
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: "100%", // Increased width to show full content
    minHeight: 60, // Added minimum height
  },
  walletIcon: {
    marginRight: 8,
  },
  walletButtonText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8, // Added margin to prevent text from touching copy button
  },
  copyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsCard: {
    width: width / 3.5,
    height: width / 3.5,
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIconContainer: {
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Card Containers
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Settings
  settingsContainer: {
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  settingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  // Menu Items
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  // Action Buttons
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: Colors.light.primary,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

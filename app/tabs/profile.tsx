import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { usePrivy } from "@privy-io/expo";
import { useTheme } from "../../contexts/ThemeContext";
import { usePrivyContext } from "../../context/PrivyContext";
import { useWallet } from "../../context/WalletContext";
import { UsePrivy } from "../../types/privy";

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

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[activeTheme].background },
      ]}
    >
      <StatusBar style={activeTheme === "dark" ? "light" : "dark"} />

      <View
        style={[
          styles.header,
          { backgroundColor: Colors[activeTheme].primary },
        ]}
      >
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: Colors[activeTheme].background },
        ]}
      >
        <View
          style={[
            styles.profileSection,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>

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

          <TouchableOpacity
            style={[
              styles.walletButton,
              { backgroundColor: Colors[activeTheme].secondaryLight },
            ]}
            onPress={handleWalletDetails}
          >
            <Text
              style={[
                styles.walletButtonText,
                { color: Colors[activeTheme].text },
              ]}
            >
              {walletAddress
                ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(
                    walletAddress.length - 4
                  )}`
                : "No Wallet Connected"}
            </Text>
            {walletAddress && (
              <TouchableOpacity onPress={copyWalletAddress}>
                <Ionicons
                  name="copy-outline"
                  size={16}
                  color={Colors[activeTheme].primary}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}
          >
            Preferences
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors[activeTheme].text}
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
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons
                name="finger-print-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.settingText}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{
                false: Colors[activeTheme].border,
                true: Colors[activeTheme].primary,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons
                name="moon-outline"
                size={24}
                color={Colors[activeTheme].text}
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
            />
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}
          >
            Security
          </Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleWalletDetails}
          >
            <View style={styles.menuItemContent}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>Wallet Details</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleExportPrivateKey}
          >
            <View style={styles.menuItemContent}>
              <Ionicons
                name="key-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>Export Private Key</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <View style={styles.menuItemContent}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: Colors[activeTheme].card },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}
          >
            About
          </Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>About Thaler</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={Colors.light.text}
              />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    padding: 16,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.light.card,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  walletButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 8,
  },
  section: {
    backgroundColor: Colors.light.card,
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  actionSection: {
    padding: 16,
    marginBottom: 32,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
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

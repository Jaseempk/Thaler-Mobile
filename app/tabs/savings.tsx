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
} from "react-native";
import { useRouter } from "expo-router";
import ThemedStatusBar from "../../components/ui/ThemedStatusBar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { usePrivy } from "@privy-io/expo";
import { useWallet } from "../../context/WalletContext";
import { SavingsPool } from "../../models/savings";
import SavingsPoolCard from "../../components/savings/SavingsPoolCard";
import { SavingsService } from "../../services/SavingsService";
import { ethers } from "ethers";
import { useTheme } from "../../contexts/ThemeContext";

export default function SavingsScreen() {
  const router = useRouter();
  const { user } = usePrivy();
  const { address: walletAddress, isConnected } = useWallet();
  const [pools, setPools] = useState<SavingsPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeTheme } = useTheme();
  const isDarkMode = activeTheme === 'dark';

  // Initialize savings service with provider
  const provider = new ethers.providers.JsonRpcProvider(
    "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327" // Goerli testnet for demo
  );
  const savingsService = new SavingsService(provider);

  // Set wallet in savings service
  useEffect(() => {
    if (walletAddress) {
      console.log('Setting wallet address in savings service:', walletAddress);
      savingsService.setPrivyWallet(walletAddress);
    }
  }, [walletAddress]);

  // Load user's savings pools
  useEffect(() => {
    const loadPools = async () => {
      if (!isConnected || !walletAddress) {
        console.log('No wallet connected, cannot load savings pools');
        setIsLoading(false);
        return;
      }
      
      console.log('Loading savings pools for wallet:', walletAddress);

      try {
        setIsLoading(true);

        // In a real app, this would fetch the user's pools from the blockchain
        // For this demo, we'll use mock data
        const mockPools: SavingsPool[] = [
          {
            id: "1",
            user: walletAddress,
            endDate: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days from now
            duration: 90 * 24 * 60 * 60, // 90 days in seconds
            startDate: Date.now(),
            totalSaved: "0.5",
            tokenToSave: "0x0000000000000000000000000000000000000000", // ETH
            amountToSave: "3",
            totalIntervals: 3,
            initialDeposit: "0.5",
            nextDepositDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
            numberOfDeposits: 1,
            lastDepositedTimestamp: Date.now(),
            isEth: true,
            progress: 17, // (0.5 / 3) * 100
            tokenSymbol: "ETH",
            tokenDecimals: 18,
          },
          {
            id: "2",
            user: walletAddress,
            endDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago (completed)
            duration: 180 * 24 * 60 * 60, // 180 days in seconds
            startDate: Date.now() - 210 * 24 * 60 * 60 * 1000, // 210 days ago
            totalSaved: "1000",
            tokenToSave: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI token
            amountToSave: "1000",
            totalIntervals: 6,
            initialDeposit: "200",
            nextDepositDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
            numberOfDeposits: 6,
            lastDepositedTimestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
            isEth: false,
            progress: 100,
            tokenSymbol: "UNI",
            tokenDecimals: 18,
          },
        ];

        setPools(mockPools);
      } catch (error) {
        console.error("Error loading savings pools:", error);
        Alert.alert(
          "Error",
          "Failed to load your savings pools. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPools();
  }, [user, walletAddress]);

  const handleCreateSavingsPool = () => {
    router.push("/savings/create");
  };

  const handlePoolPress = (pool: SavingsPool) => {
    // Navigate to pool details screen
    router.push({
      pathname: "/savings/[id]",
      params: { id: pool.id },
    });
  };

  const handleDeposit = (pool: SavingsPool) => {
    // Navigate to deposit screen
    router.push({
      pathname: "/savings/deposit",
      params: { id: pool.id },
    });
  };

  const handleWithdraw = (pool: SavingsPool) => {
    // Check if pool has ended
    const now = Date.now();
    if (now < pool.endDate && pool.progress < 100) {
      Alert.alert(
        "Early Withdrawal",
        "This pool has not ended yet. Early withdrawals require a donation verification. Do you want to proceed?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Proceed",
            onPress: () => {
              router.push({
                pathname: "/savings/withdraw",
                params: { id: pool.id, early: "true" },
              });
            },
          },
        ]
      );
    } else {
      // Regular withdrawal
      router.push({
        pathname: "/savings/withdraw",
        params: { id: pool.id },
      });
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedStatusBar />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authSubtitle}>
            Please log in to view your savings pools
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => router.push("/auth/welcome")}
          >
            <Text style={styles.authButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedStatusBar />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings Pools</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateSavingsPool}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading your savings pools...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {pools.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="wallet-outline"
                size={64}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.emptyTitle}>No Savings Pools Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start saving by creating your first savings pool
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={handleCreateSavingsPool}
              >
                <Text style={styles.emptyButtonText}>Create Savings Pool</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Your Savings Pools</Text>
              {pools.map((pool) => (
                <SavingsPoolCard
                  key={pool.id}
                  pool={pool}
                  onPress={handlePoolPress}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.light.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
    color: Colors.light.text,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

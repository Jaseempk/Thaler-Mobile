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
import { ethers } from "ethers";
import { useTheme } from "../../contexts/ThemeContext";
import { useSavingsPool } from "../../context/SavingsPoolContext";

export default function SavingsScreen() {
  const router = useRouter();
  const { user } = usePrivy();
  const { address: walletAddress, isConnected } = useWallet();
  const { pools, isLoading, error, refreshPools } = useSavingsPool();
  const { activeTheme } = useTheme();
  const isDarkMode = activeTheme === 'dark';

  // Refresh pools when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      console.log('Loading savings pools for wallet:', walletAddress);
      refreshPools();
    }
  }, [isConnected, walletAddress]);

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
    // Show deposit modal
    Alert.prompt(
      `Deposit to ${pool.isEth ? 'ETH' : 'ERC20'} Savings Pool`,
      `Enter amount to deposit (${pool.tokenSymbol})`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Deposit',
          onPress: (amount) => {
            if (!amount) return;
            
            try {
              if (pool.isEth) {
                router.push({
                  pathname: "/savings/deposit",
                  params: { id: pool.id, amount, token: 'ETH' },
                });
              } else {
                router.push({
                  pathname: "/savings/deposit",
                  params: { id: pool.id, amount, token: pool.tokenSymbol },
                });
              }
            } catch (error) {
              console.error('Error initiating deposit:', error);
              Alert.alert('Error', 'Failed to initiate deposit. Please try again.');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleWithdraw = (pool: SavingsPool) => {
    // Check if pool has ended
    const now = Date.now();
    if (now < pool.endDate && pool.progress < 100) {
      Alert.alert(
        "Early Withdrawal",
        "This pool has not ended yet. Early withdrawals require a zero-knowledge proof. Do you want to proceed?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Proceed",
            onPress: () => {
              // In a real app, we would generate the zero-knowledge proof here
              // For now, we'll just navigate to the withdraw screen
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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[activeTheme].secondary }]}>
      <ThemedStatusBar />

      <View style={[styles.header, { backgroundColor: Colors[activeTheme].primary }]}>
        <Text style={styles.headerTitle}>Savings Pools</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: Colors[activeTheme].primaryLight }]}
          onPress={handleCreateSavingsPool}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[activeTheme].primary} />
          <Text style={[styles.loadingText, { color: Colors[activeTheme].text }]}>
            Loading your savings pools...
          </Text>
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
                color={Colors[activeTheme].textSecondary}
              />
              <Text style={[styles.emptyTitle, { color: Colors[activeTheme].text }]}>
                No Savings Pools Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: Colors[activeTheme].textSecondary }]}>
                Start saving by creating your first savings pool
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: Colors[activeTheme].primary }]}
                onPress={handleCreateSavingsPool}
              >
                <Text style={styles.emptyButtonText}>Create Savings Pool</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}>
                Your Savings Pools
              </Text>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
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
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  authButton: {
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

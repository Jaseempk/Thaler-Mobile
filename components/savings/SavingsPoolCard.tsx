import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SavingsPool } from "../../models/savings";
import Colors from "../../constants/Colors";
import { useWallet } from "../../context/WalletContext";

interface SavingsPoolCardProps {
  pool: SavingsPool;
  onPress: (pool: SavingsPool) => void;
  onDeposit: (pool: SavingsPool) => void;
  onWithdraw: (pool: SavingsPool) => void;
}

const SavingsPoolCard: React.FC<SavingsPoolCardProps> = ({
  pool,
  onPress,
  onDeposit,
  onWithdraw,
}) => {
  const { address: walletAddress } = useWallet();

  // Format date to readable string
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    const now = Date.now();
    const endDate = pool.endDate;

    if (now >= endDate) {
      return "Completed";
    }

    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return `${daysRemaining} days remaining`;
  };

  // Determine if user can withdraw
  const canWithdraw = () => {
    const now = Date.now();
    return now >= pool.endDate || pool.progress >= 100;
  };

  // Check if this pool belongs to the current user
  const isUserPool = () => {
    return (
      walletAddress && pool.user.toLowerCase() === walletAddress.toLowerCase()
    );
  };

  // Get token symbol with default
  const tokenSymbol = pool.tokenSymbol || (pool.isEth ? "ETH" : "TOKEN");

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(pool)}
      disabled={!isUserPool()}
    >
      <View style={styles.header}>
        <View style={styles.tokenContainer}>
          <View
            style={[
              styles.tokenIcon,
              { backgroundColor: pool.isEth ? "#454A75" : "#F0B90B" },
            ]}
          >
            <Text style={styles.tokenSymbol}>{tokenSymbol.charAt(0)}</Text>
          </View>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>{tokenSymbol} Savings</Text>
            <Text style={styles.poolDuration}>
              {pool.duration / 30} Month Plan
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusText,
              {
                color:
                  pool.progress >= 100
                    ? Colors.light.success
                    : Colors.light.primary,
              },
            ]}
          >
            {pool.progress >= 100 ? "Completed" : "Active"}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${pool.progress}%` }]}
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{pool.progress}% Complete</Text>
          <Text style={styles.daysRemaining}>{calculateDaysRemaining()}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Target Amount</Text>
          <Text style={styles.detailValue}>
            {pool.amountToSave} {tokenSymbol}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Saved So Far</Text>
          <Text style={styles.detailValue}>
            {pool.totalSaved} {tokenSymbol}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Next Deposit</Text>
          <Text style={styles.detailValue}>
            {pool.progress >= 100 ? "N/A" : formatDate(pool.nextDepositDate)}
          </Text>
        </View>
      </View>

      {isUserPool() && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
            onPress={() => onDeposit(pool)}
            disabled={pool.progress >= 100}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={18}
              color={Colors.light.primary}
            />
            <Text style={styles.depositButtonText}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.withdrawButton,
              !canWithdraw() && styles.disabledButton,
            ]}
            onPress={() => onWithdraw(pool)}
            disabled={!canWithdraw()}
          >
            <Ionicons
              name="arrow-down-circle-outline"
              size={18}
              color={canWithdraw() ? Colors.light.success : Colors.light.gray}
            />
            <Text
              style={[
                styles.withdrawButtonText,
                !canWithdraw() && styles.disabledButtonText,
              ]}
            >
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tokenSymbol: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  tokenInfo: {
    justifyContent: "center",
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  poolDuration: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.light.secondaryLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  daysRemaining: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  depositButton: {
    backgroundColor: Colors.light.secondaryLight,
    marginRight: 8,
  },
  depositButtonText: {
    color: Colors.light.primary,
    fontWeight: "bold",
    marginLeft: 8,
  },
  withdrawButton: {
    backgroundColor: Colors.light.secondaryLight,
    marginLeft: 8,
  },
  withdrawButtonText: {
    color: Colors.light.success,
    fontWeight: "bold",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: Colors.light.gray,
  },
});

export default SavingsPoolCard;

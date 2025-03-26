import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useSavingsPool } from "../../context/SavingsPoolContext";
import { useWallet } from "../../context/WalletContext";
import { useTheme } from "../../contexts/ThemeContext";
import SavingsPoolCard from "../../components/savings/SavingsPoolCard";
import Colors from "../../constants/Colors";
import { SavingsPool } from "../../models/savings";

type SavingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SavingsScreen = () => {
  const navigation = useNavigation<SavingsScreenNavigationProp>();
  const { activeTheme } = useTheme();
  const { address, isConnected } = useWallet();
  const {
    pools,
    isLoading,
    error,
    createEthSavingsPool,
    createERC20SavingsPool,
    depositToEthPool,
    depositToERC20Pool,
    withdrawFromEthPool,
    withdrawFromERC20Pool,
    refreshPools,
  } = useSavingsPool();

  // State for modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [selectedPool, setSelectedPool] = useState<SavingsPool | null>(null);

  // State for form inputs
  const [tokenType, setTokenType] = useState<"ETH" | "ERC20">("ETH");
  const [tokenAddress, setTokenAddress] = useState("");
  const [amountToSave, setAmountToSave] = useState("");
  const [duration, setDuration] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [totalIntervals, setTotalIntervals] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawProof, setWithdrawProof] = useState("");

  // Handle create pool
  const handleCreatePool = async () => {
    try {
      if (tokenType === "ETH") {
        await createEthSavingsPool(
          amountToSave,
          parseInt(duration) * 86400, // Convert days to seconds
          initialDeposit,
          parseInt(totalIntervals)
        );
      } else {
        if (!tokenAddress) {
          alert("Please enter a token address");
          return;
        }
        await createERC20SavingsPool(
          tokenAddress,
          amountToSave,
          parseInt(duration) * 86400, // Convert days to seconds
          initialDeposit,
          parseInt(totalIntervals)
        );
      }
      setCreateModalVisible(false);
      resetForm();
    } catch (error: any) {
      console.error("Error creating pool:", error);
      alert(`Failed to create pool: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    try {
      if (!selectedPool) return;

      if (selectedPool.isEth) {
        await depositToEthPool(selectedPool.id, depositAmount);
      } else {
        await depositToERC20Pool(selectedPool.id, depositAmount);
      }
      setDepositModalVisible(false);
      setDepositAmount("");
    } catch (error: any) {
      console.error("Error depositing to pool:", error);
      alert(`Failed to deposit: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    try {
      if (!selectedPool) return;

      // In a real app, you would generate the zero-knowledge proof here
      // For now, we'll just use placeholder values
      const proof = withdrawProof || "0x";
      const publicInputs = ["0"];

      if (selectedPool.isEth) {
        await withdrawFromEthPool(selectedPool.id, proof, publicInputs);
      } else {
        await withdrawFromERC20Pool(selectedPool.id, proof, publicInputs);
      }
      setWithdrawModalVisible(false);
      setWithdrawProof("");
    } catch (error: any) {
      console.error("Error withdrawing from pool:", error);
      alert(`Failed to withdraw: ${error.message || 'Unknown error'}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setTokenType("ETH");
    setTokenAddress("");
    setAmountToSave("");
    setDuration("");
    setInitialDeposit("");
    setTotalIntervals("");
  };

  // Open deposit modal
  const openDepositModal = (pool: SavingsPool) => {
    setSelectedPool(pool);
    setDepositModalVisible(true);
  };

  // Open withdraw modal
  const openWithdrawModal = (pool: SavingsPool) => {
    setSelectedPool(pool);
    setWithdrawModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[activeTheme].background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[activeTheme].text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[activeTheme].text }]}>Savings Pools</Text>
        <TouchableOpacity onPress={refreshPools} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={Colors[activeTheme].text} />
        </TouchableOpacity>
      </View>

      {!isConnected ? (
        <View style={styles.connectWalletContainer}>
          <Text style={[styles.connectWalletText, { color: Colors[activeTheme].text }]}>
            Connect your wallet to view savings pools
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[activeTheme].primary} />
          <Text style={[styles.loadingText, { color: Colors[activeTheme].text }]}>
            Loading savings pools...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[activeTheme].error }]}>{error}</Text>
          <TouchableOpacity onPress={refreshPools} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {pools.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: Colors[activeTheme].text }]}>
                You don't have any savings pools yet
              </Text>
            </View>
          ) : (
            pools.map((pool) => (
              <SavingsPoolCard
                key={pool.id}
                pool={pool}
                onPress={() => {}}
                onDeposit={() => openDepositModal(pool)}
                onWithdraw={() => openWithdrawModal(pool)}
              />
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: Colors[activeTheme].primary }]}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.createButtonText}>Create New Savings Pool</Text>
      </TouchableOpacity>

      {/* Create Pool Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors[activeTheme].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[activeTheme].text }]}>
              Create Savings Pool
            </Text>

            <View style={styles.tokenTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.tokenTypeButton,
                  tokenType === "ETH" && {
                    backgroundColor: Colors[activeTheme].primary,
                  },
                ]}
                onPress={() => setTokenType("ETH")}
              >
                <Text
                  style={[
                    styles.tokenTypeText,
                    tokenType === "ETH" && { color: "white" },
                  ]}
                >
                  ETH
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tokenTypeButton,
                  tokenType === "ERC20" && {
                    backgroundColor: Colors[activeTheme].primary,
                  },
                ]}
                onPress={() => setTokenType("ERC20")}
              >
                <Text
                  style={[
                    styles.tokenTypeText,
                    tokenType === "ERC20" && { color: "white" },
                  ]}
                >
                  ERC20
                </Text>
              </TouchableOpacity>
            </View>

            {tokenType === "ERC20" && (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: Colors[activeTheme].card },
                ]}
                placeholder="Token Address"
                placeholderTextColor={Colors[activeTheme].textSecondary}
                value={tokenAddress}
                onChangeText={setTokenAddress}
              />
            )}

            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[activeTheme].card },
              ]}
              placeholder={`Amount to Save (${tokenType})`}
              placeholderTextColor={Colors[activeTheme].textSecondary}
              keyboardType="numeric"
              value={amountToSave}
              onChangeText={setAmountToSave}
            />

            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[activeTheme].card },
              ]}
              placeholder="Duration (days)"
              placeholderTextColor={Colors[activeTheme].textSecondary}
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[activeTheme].card },
              ]}
              placeholder={`Initial Deposit (${tokenType})`}
              placeholderTextColor={Colors[activeTheme].textSecondary}
              keyboardType="numeric"
              value={initialDeposit}
              onChangeText={setInitialDeposit}
            />

            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[activeTheme].card },
              ]}
              placeholder="Number of Deposits"
              placeholderTextColor={Colors[activeTheme].textSecondary}
              keyboardType="numeric"
              value={totalIntervals}
              onChangeText={setTotalIntervals}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCreateModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={handleCreatePool}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors[activeTheme].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[activeTheme].text }]}>
              Deposit to Savings Pool
            </Text>

            {selectedPool && (
              <Text style={[styles.poolInfo, { color: Colors[activeTheme].text }]}>
                Pool Target: {selectedPool.amountToSave} {selectedPool.tokenSymbol}
              </Text>
            )}

            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[activeTheme].card },
              ]}
              placeholder={`Amount to Deposit (${selectedPool?.tokenSymbol || "ETH"})`}
              placeholderTextColor={Colors[activeTheme].textSecondary}
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDepositModalVisible(false);
                  setDepositAmount("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.depositButton]}
                onPress={handleDeposit}
              >
                <Text style={styles.modalButtonText}>Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Colors[activeTheme].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[activeTheme].text }]}>
              Withdraw from Savings Pool
            </Text>

            {selectedPool && (
              <Text style={[styles.poolInfo, { color: Colors[activeTheme].text }]}>
                Available: {selectedPool.totalSaved} {selectedPool.tokenSymbol}
              </Text>
            )}

            <TextInput
              style={[
                styles.input,
                { backgroundColor: Colors[activeTheme].card },
              ]}
              placeholder="Zero-Knowledge Proof (optional)"
              placeholderTextColor={Colors[activeTheme].textSecondary}
              value={withdrawProof}
              onChangeText={setWithdrawProof}
            />

            <Text style={[styles.noteText, { color: Colors[activeTheme].text }]}>
              Note: In a real app, the zero-knowledge proof would be generated automatically.
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setWithdrawModalVisible(false);
                  setWithdrawProof("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.withdrawButton]}
                onPress={handleWithdraw}
              >
                <Text style={styles.modalButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  connectWalletContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  connectWalletText: {
    fontSize: 16,
    textAlign: "center",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  createButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tokenTypeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tokenTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  tokenTypeText: {
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  createModalButton: {
    backgroundColor: "#007AFF",
  },
  depositButton: {
    backgroundColor: "#4CD964",
  },
  withdrawButton: {
    backgroundColor: "#FF9500",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  poolInfo: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  noteText: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },
});

export default SavingsScreen;

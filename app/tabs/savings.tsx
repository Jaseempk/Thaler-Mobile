import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';
import { useWallet } from '../../context/WalletContext';
import { SavingsPool, SavingsPoolStatus } from '../../models/savings';

// Mock data for savings pools
const mockSavingsPools: SavingsPool[] = [
  {
    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    user: '0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620',
    endDate: Date.now() + 86400000 * 30 * 3, // 3 months from now
    duration: 7884000, // 3 months in seconds
    startDate: Date.now(),
    totalSaved: '0.5',
    tokenToSave: '0x0000000000000000000000000000000000000000', // ETH
    amountToSave: '1.5',
    totalIntervals: 3,
    initialDeposit: '0.5',
    nextDepositDate: Date.now() + 86400000 * 30, // 1 month from now
    numberOfDeposits: 1,
    lastDepositedTimestamp: Date.now(),
    isEth: true,
    progress: 33,
  },
  {
    id: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    user: '0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620',
    endDate: Date.now() + 86400000 * 30 * 6, // 6 months from now
    duration: 15768000, // 6 months in seconds
    startDate: Date.now() - 86400000 * 30, // Started 1 month ago
    totalSaved: '1000',
    tokenToSave: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    amountToSave: '3000',
    totalIntervals: 6,
    initialDeposit: '500',
    nextDepositDate: Date.now() + 86400000 * 30, // 1 month from now
    numberOfDeposits: 2,
    lastDepositedTimestamp: Date.now() - 86400000 * 15,
    isEth: false,
    progress: 33,
    tokenSymbol: 'USDC',
    tokenDecimals: 6,
  },
  {
    id: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    user: '0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620',
    endDate: Date.now() - 86400000 * 30, // Ended 1 month ago
    duration: 7884000, // 3 months in seconds
    startDate: Date.now() - 86400000 * 30 * 4, // Started 4 months ago
    totalSaved: '2.0',
    tokenToSave: '0x0000000000000000000000000000000000000000', // ETH
    amountToSave: '2.0',
    totalIntervals: 3,
    initialDeposit: '0.5',
    nextDepositDate: 0, // No next deposit, pool completed
    numberOfDeposits: 3,
    lastDepositedTimestamp: Date.now() - 86400000 * 30 * 2,
    isEth: true,
    progress: 100,
  },
];

export default function SavingsScreen() {
  const { isConnected, connectWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  // Filter pools based on active tab
  const filteredPools = mockSavingsPools.filter(pool => {
    if (activeTab === 'active') {
      return pool.endDate > Date.now();
    } else {
      return pool.endDate <= Date.now();
    }
  });
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Format amount for display
  const formatAmount = (amount: string, isEth: boolean, decimals: number = 18) => {
    const num = parseFloat(amount);
    return isEth 
      ? `${num.toFixed(4)} ETH` 
      : `${num.toFixed(2)} ${mockSavingsPools[1].tokenSymbol}`;
  };
  
  // Calculate days remaining
  const getDaysRemaining = (endDate: number) => {
    const now = Date.now();
    const diff = endDate - now;
    if (diff <= 0) return 'Completed';
    
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} days remaining`;
  };
  
  // Render a savings pool card
  const renderSavingsPool = ({ item }: { item: SavingsPool }) => {
    return (
      <Card variant="elevated" style={styles.poolCard}>
        <View style={styles.poolHeader}>
          <View style={styles.poolTitleContainer}>
            <Text style={styles.poolTitle}>
              {item.isEth ? 'ETH' : item.tokenSymbol} Savings Pool
            </Text>
            <Text style={styles.poolDuration}>
              {item.duration === 7884000 ? '3 Months' : 
               item.duration === 15768000 ? '6 Months' : '12 Months'}
            </Text>
          </View>
          <View 
            style={[
              styles.statusBadge,
              { 
                backgroundColor: item.endDate > Date.now() 
                  ? Colors.light.secondaryLight 
                  : Colors.light.success + '30'
              }
            ]}
          >
            <Text 
              style={[
                styles.statusText,
                { 
                  color: item.endDate > Date.now() 
                    ? Colors.light.primary 
                    : Colors.light.success
                }
              ]}
            >
              {item.endDate > Date.now() ? 'Active' : 'Completed'}
            </Text>
          </View>
        </View>
        
        <View style={styles.poolDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Saved:</Text>
            <Text style={styles.detailValue}>
              {formatAmount(item.totalSaved, item.isEth, item.tokenDecimals)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target Amount:</Text>
            <Text style={styles.detailValue}>
              {formatAmount(item.amountToSave, item.isEth, item.tokenDecimals)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.endDate)}</Text>
          </View>
          
          {item.endDate > Date.now() && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Deposit:</Text>
              <Text style={styles.detailValue}>{formatDate(item.nextDepositDate)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${item.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{item.progress}% Complete</Text>
        </View>
        
        <View style={styles.poolActions}>
          {item.endDate > Date.now() ? (
            <>
              <Button 
                title="Deposit" 
                onPress={() => {}}
                variant="primary"
                size="small"
                style={styles.actionButton}
              />
              <Button 
                title="Early Withdraw" 
                onPress={() => {}}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
            </>
          ) : (
            <Button 
              title="Withdraw" 
              onPress={() => {}}
              variant="primary"
              size="small"
              style={[styles.actionButton, { flex: 1 }]}
            />
          )}
        </View>
      </Card>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savings Pools</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {!isConnected ? (
        <View style={styles.connectContainer}>
          <Text style={styles.connectText}>
            Connect your wallet to view and manage your savings pools
          </Text>
          <Button 
            title="Connect Wallet" 
            onPress={connectWallet}
            variant="primary"
            style={styles.connectButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'active' ? styles.activeTab : null
              ]}
              onPress={() => setActiveTab('active')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'active' ? styles.activeTabText : null
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'completed' ? styles.activeTab : null
              ]}
              onPress={() => setActiveTab('completed')}
            >
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'completed' ? styles.activeTabText : null
                ]}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>
          
          {filteredPools.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="wallet-outline" 
                size={64} 
                color={Colors.light.primary} 
              />
              <Text style={styles.emptyText}>
                {activeTab === 'active' 
                  ? "You don't have any active savings pools" 
                  : "You don't have any completed savings pools"}
              </Text>
              {activeTab === 'active' && (
                <Button 
                  title="Create New Pool" 
                  onPress={() => {}}
                  variant="primary"
                  style={styles.createButton}
                />
              )}
            </View>
          ) : (
            <FlatList
              data={filteredPools}
              renderItem={renderSavingsPool}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  connectText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.light.text,
  },
  connectButton: {
    width: '100%',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.secondaryLight,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    color: Colors.light.text,
  },
  createButton: {
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  poolCard: {
    marginBottom: 16,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolTitleContainer: {
    flex: 1,
  },
  poolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  poolDuration: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  poolDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
    textAlign: 'right',
  },
  poolActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

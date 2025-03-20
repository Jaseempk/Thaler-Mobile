import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../../context/WalletContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';

// Mock data for recent activity
const recentActivity = [
  {
    id: '1',
    name: 'Deposit',
    date: 'Today, 16:30',
    amount: '+0.1 ETH',
    type: 'deposit',
    icon: 'arrow-down-circle-outline',
  },
  {
    id: '2',
    name: 'Withdrawal',
    date: 'Yesterday',
    amount: '-0.05 ETH',
    type: 'withdrawal',
    icon: 'arrow-up-circle-outline',
  },
  {
    id: '3',
    name: 'Pool Created',
    date: '3 days ago',
    amount: '-0.2 ETH',
    type: 'create',
    icon: 'add-circle-outline',
  },
];

export default function HomeScreen() {
  const { address, balance, isConnected, connectWallet } = useWallet();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [userName, setUserName] = useState('User');
  
  // Format the address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format the balance for display
  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance);
    return balanceNum.toFixed(4);
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{isConnected ? userName : 'Connect your wallet'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color={Colors.light.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Wallet Balance Card */}
        <Card variant="elevated" style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
            <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons 
                name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={Colors.light.text} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>
              {isConnected 
                ? (isBalanceVisible ? `${formatBalance(balance)} ETH` : '••••••') 
                : '---'}
            </Text>
          </View>
          
          {/* Connect wallet button if not connected */}
          {!isConnected && (
            <Button 
              title="Connect Wallet" 
              onPress={connectWallet}
              variant="primary"
              style={styles.connectButton}
            />
          )}
          
          {/* Cards section */}
          {isConnected && (
            <View style={styles.cardsSection}>
              <Text style={styles.sectionTitle}>Savings Pools</Text>
              <View style={styles.cardsRow}>
                <View style={styles.savingsCard}>
                  <View style={[styles.cardIcon, { backgroundColor: Colors.light.secondaryLight }]}>
                    <Ionicons name="time-outline" size={24} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.cardNumber}>3</Text>
                  <Text style={styles.cardLabel}>Active</Text>
                </View>
                
                <View style={styles.savingsCard}>
                  <View style={[styles.cardIcon, { backgroundColor: Colors.light.secondaryLight }]}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.cardNumber}>1</Text>
                  <Text style={styles.cardLabel}>Completed</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Action buttons */}
          {isConnected && (
            <View style={styles.actionButtons}>
              <Button 
                title="Create Pool" 
                onPress={() => {}}
                variant="primary"
                size="medium"
                style={styles.actionButton}
              />
              <Button 
                title="Deposit" 
                onPress={() => {}}
                variant="secondary"
                size="medium"
                style={styles.actionButton}
              />
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="grid-outline" size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          )}
        </Card>
        
        {/* Recent Activity */}
        {isConnected && (
          <View style={styles.recentActivity}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeDetailsText}>See Details</Text>
              </TouchableOpacity>
            </View>
            
            {recentActivity.map((activity) => (
              <Card key={activity.id} variant="outlined" style={styles.activityCard}>
                <View style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons 
                      name={activity.icon as any} 
                      size={24} 
                      color={
                        activity.type === 'deposit' 
                          ? Colors.light.success 
                          : activity.type === 'withdrawal' 
                            ? Colors.light.error 
                            : Colors.light.primary
                      } 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityDate}>{activity.date}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.activityAmount,
                      {
                        color: 
                          activity.type === 'deposit' 
                            ? Colors.light.success 
                            : activity.type === 'withdrawal' 
                              ? Colors.light.error 
                              : Colors.light.primary
                      }
                    ]}
                  >
                    {activity.amount}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  notificationIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  connectButton: {
    marginTop: 16,
  },
  cardsSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  cardLabel: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  moreButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentActivity: {
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeDetailsText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  activityCard: {
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  activityDate: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

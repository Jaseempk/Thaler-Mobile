import React, { useState, useEffect } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../../context/WalletContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import WalletAddressCard from '../../components/wallet/WalletAddressCard';
import TokenBalanceCard from '../../components/wallet/TokenBalanceCard';

const { width } = Dimensions.get('window');

// Mock token data
const tokenData = [
  {
    id: '1',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '0.42',
    value: '1,285.60',
    change: '2.4',
    isPositive: true,
    logo: require('../../assets/images/ethereum.png'),
    gradientColors: ['#627EEA', '#3C5BE0']
  },
  {
    id: '2',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '325.75',
    value: '325.75',
    change: '0.01',
    isPositive: true,
    logo: require('../../assets/images/usdc.png'),
    gradientColors: ['#2775CA', '#2775CA']
  },
  {
    id: '3',
    symbol: 'USDT',
    name: 'Tether',
    balance: '150.00',
    value: '150.00',
    change: '0.00',
    isPositive: true,
    logo: require('../../assets/images/usdt.png'),
    gradientColors: ['#26A17B', '#1A9270']
  },
  {
    id: '4',
    symbol: 'MATIC',
    name: 'Polygon',
    balance: '45.32',
    value: '38.52',
    change: '1.2',
    isPositive: false,
    logo: require('../../assets/images/matic.png'),
    gradientColors: ['#8247E5', '#6F3CD0']
  }
];

// Mock transaction data
const recentActivity = [
  {
    id: '1',
    name: 'Swap ETH to USDC',
    date: 'Today, 16:30',
    amount: '-0.05 ETH',
    type: 'swap',
    avatar: 'S',
    avatarColor: '#627EEA',
  },
  {
    id: '2',
    name: 'Received USDC',
    date: 'Today, 10:15',
    amount: '+25 USDC',
    type: 'receive',
    avatar: 'R',
    avatarColor: '#2775CA',
  },
  {
    id: '3',
    name: 'Sent MATIC',
    date: 'Yesterday',
    amount: '-10 MATIC',
    type: 'send',
    avatar: 'S',
    avatarColor: '#8247E5',
  },
];

export default function HomeScreen() {
  const { activeTheme, toggleTheme } = useTheme();
  const { address, balance, isConnected, connectWallet } = useWallet();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [userName, setUserName] = useState('Jonathan');
  const [isDarkMode, setIsDarkMode] = useState(activeTheme === 'dark');
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState('1,800.87');
  
  // Format the address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format the balance for display
  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance);
    return balanceNum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Update the switch state when theme changes
  useEffect(() => {
    setIsDarkMode(activeTheme === 'dark');
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
      Alert.alert('Connection Error', 'Failed to connect wallet');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[activeTheme].background }]}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: Colors[activeTheme].background }]} 
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
            <Text style={[styles.greeting, { color: Colors[activeTheme].text }]}>Hi, {userName}</Text>
            <Text style={[styles.welcomeBack, { color: Colors[activeTheme].textSecondary }]}>Welcome Back!</Text>
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
            <TouchableOpacity style={[styles.notificationIcon, { backgroundColor: Colors[activeTheme].secondaryLight }]}>
              <Ionicons name="notifications-outline" size={24} color={Colors[activeTheme].text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Wallet Balance Card */}
        <View style={styles.balanceContainer}>
          <LinearGradient
            colors={isDarkMode ? ['#2E7D32', '#1A237E'] : ['#4CAF50', '#1E88E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabelLight}>Total Balance</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmountLight}>
                  ${isConnected 
                    ? (isBalanceVisible ? formatBalance(totalBalance) : '••••••') 
                    : '---'}
                </Text>
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                >
                  <Ionicons 
                    name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
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
                    <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
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
          </LinearGradient>
        </View>
        
        {/* Wallet Address Card - Only show if connected */}
        {isConnected && address && (
          <WalletAddressCard 
            address={address} 
            isConnected={isConnected} 
            theme={activeTheme}
          />
        )}
        
        {/* Token Balances */}
        <View style={styles.tokensSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}>Token Balances</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={[styles.seeAllText, { color: Colors[activeTheme].primary }]}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors[activeTheme].primary} />
            </TouchableOpacity>
          </View>
          
          {tokenData.map((token) => (
            <TokenBalanceCard 
              key={token.id}
              token={token}
              theme={activeTheme}
            />
          ))}
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: Colors[activeTheme].primary }]}>
              <Ionicons name="send-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionButtonText, { color: Colors[activeTheme].text }]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: Colors[activeTheme].accent }]}>
              <Ionicons name="download-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionButtonText, { color: Colors[activeTheme].text }]}>Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: isDarkMode ? '#424242' : '#9E9E9E' }]}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionButtonText, { color: Colors[activeTheme].text }]}>Swap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: isDarkMode ? '#303F9F' : '#3F51B5' }]}>
              <Ionicons name="grid-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionButtonText, { color: Colors[activeTheme].text }]}>More</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}>Recent Activity</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={[styles.seeAllText, { color: Colors[activeTheme].primary }]}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors[activeTheme].primary} />
            </TouchableOpacity>
          </View>
          
          {recentActivity.map((activity) => (
            <View 
              key={activity.id} 
              style={[styles.activityItem, { backgroundColor: Colors[activeTheme].secondaryLight }]}
            >
              <View style={styles.activityLeftSection}>
                <View style={[styles.activityAvatar, { backgroundColor: activity.avatarColor }]}>
                  <Text style={styles.activityAvatarText}>{activity.avatar}</Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityName, { color: Colors[activeTheme].text }]}>{activity.name}</Text>
                  <Text style={[styles.activityDate, { color: Colors[activeTheme].textSecondary }]}>{activity.date}</Text>
                </View>
              </View>
              <View style={styles.activityRightSection}>
                <Text style={[
                  styles.activityAmount,
                  activity.type === 'receive' ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {activity.amount}
                </Text>
                <Text style={[styles.activityType, { color: Colors[activeTheme].textSecondary }]}>{activity.type}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  welcomeBack: {
    fontSize: 16,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceContainer: {
    marginBottom: 24,
  },
  balanceLabelDark: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceAmountDark: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  cardsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cardItem: {
    width: 120,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    justifyContent: 'flex-end',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 32,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 32,
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#000',
  },
  recentActivity: {
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeDetailsText: {
    fontSize: 14,
    color: Colors.light.primary,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityAvatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activityDetails: {
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  activityRightSection: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  incomeAmount: {
    color: Colors.light.success,
  },
  expenseAmount: {
    color: '#000',
  },
  activityType: {
    fontSize: 12,
    color: '#666',
  },
  balanceGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  balanceContent: {
    padding: 20,
  },
  balanceLabelLight: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  balanceAmountLight: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  refreshText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  connectText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
  },
  tokensSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    marginRight: 4,
  },
});

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch,
  ScrollView, 
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../../context/WalletContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

// Mock data for recent activity
const recentActivity = [
  {
    id: '1',
    name: 'Dribbble',
    date: 'Today, 16:30',
    amount: '-$120',
    type: 'transfer',
    avatar: 'D',
    avatarColor: '#ea4c89',
  },
  {
    id: '2',
    name: 'Wilson Mango',
    date: 'Today, 10:15',
    amount: '-$240',
    type: 'transfer',
    avatar: 'WM',
    avatarColor: '#4CAF50',
  },
  {
    id: '3',
    name: 'Abram Botosh',
    date: 'Yesterday',
    amount: '+$450',
    type: 'income',
    avatar: null,
    avatarColor: '#1E88E5',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];

export default function HomeScreen() {
  const { activeTheme, toggleTheme } = useTheme();
  const { address, balance, isConnected } = useWallet();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [userName, setUserName] = useState('Jonathan');
  const [isDarkMode, setIsDarkMode] = useState(activeTheme === 'dark');
  
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[activeTheme].background }]}>
      <ScrollView style={[styles.scrollView, { backgroundColor: Colors[activeTheme].background }]} showsVerticalScrollIndicator={false}>
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
          <Text style={[styles.balanceLabel, { color: Colors[activeTheme].textSecondary }]}>Wallet Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceAmount, { color: Colors[activeTheme].text }]}>
              ${isConnected 
                ? (isBalanceVisible ? formatBalance("17298.92") : '••••••') 
                : '---'}
            </Text>
            <TouchableOpacity onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
              <Ionicons 
                name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} 
                size={24} 
                color={Colors[activeTheme].text} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Cards section */}
        <View style={styles.cardsSection}>
          <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}>Cards</Text>
          <View style={styles.cardsRow}>
            <View style={[styles.cardItem, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.cardNumber}>•••• 4679</Text>
            </View>
            <View style={[styles.cardItem, { backgroundColor: '#212121' }]}>
              <Text style={styles.cardNumber}>•••• 7391</Text>
            </View>
          </View>
        </View>
        
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonIcon}>
              <Ionicons name="send-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionButtonText, { color: Colors[activeTheme].text }]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: Colors.light.accent }]}>
              <Ionicons name="download-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionButtonText, { color: Colors[activeTheme].text }]}>Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionButtonIcon, { backgroundColor: '#9E9E9E' }]}>
              <Ionicons name="grid-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.actionButtonText}></Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Activity */}
        <View style={styles.recentActivity}>
          <View style={styles.activityHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[activeTheme].text }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeDetailsText}>See Details</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityLeftSection}>
                {activity.image ? (
                  <Image source={{ uri: activity.image }} style={styles.activityAvatar} />
                ) : (
                  <View style={[styles.activityAvatar, { backgroundColor: activity.avatarColor }]}>
                    <Text style={styles.activityAvatarText}>{activity.avatar}</Text>
                  </View>
                )}
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityName, { color: Colors[activeTheme].text }]}>{activity.name}</Text>
                  <Text style={[styles.activityDate, { color: Colors[activeTheme].textSecondary }]}>{activity.date}</Text>
                </View>
              </View>
              <View style={styles.activityRightSection}>
                <Text style={[
                  styles.activityAmount,
                  activity.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {activity.amount}
                </Text>
                <Text style={styles.activityType}>Transfer</Text>
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
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceAmount: {
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

});

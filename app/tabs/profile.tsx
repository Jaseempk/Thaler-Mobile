import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { usePrivy } from '../../context/PrivyContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, isAuthenticated, walletAddress, user } = usePrivy();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/welcome');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'Please try again later.');
    }
  };
  
  const handleWalletDetails = () => {
    // Show wallet details or redirect to wallet management screen
    Alert.alert(
      'Wallet Details', 
      `Address: ${walletAddress}\n\nThis is a Privy embedded wallet managed securely for you.`
    );
  };
  
  const handleExportPrivateKey = () => {
    // In a real app, this would require additional security confirmations
    Alert.alert(
      'Security Notice', 
      'For security reasons, private key export is not available for embedded wallets. Your wallet is securely managed by Privy.'
    );
  };
  
  const handleChangePassword = () => {
    // In a real app, this would navigate to a password change screen
    Alert.alert(
      'Change Password', 
      'Password management is handled by Privy authentication. Please use the password reset option from the login screen if needed.'
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call an API to delete the user's account
            Alert.alert('Account Deletion', 'Your account deletion request has been submitted.');
            handleLogout();
          },
        },
      ]
    );
  };
  
  if (!isAuthenticated) {
    router.replace('/auth/welcome');
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          <Text style={styles.profileName}>
            {user?.email ? user.email.split('@')[0] : 'User'}
          </Text>
          
          <Text style={styles.profileEmail}>{user?.email || 'No email provided'}</Text>
          
          <TouchableOpacity style={styles.walletButton} onPress={handleWalletDetails}>
            <Text style={styles.walletButtonText}>
              {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'No Wallet Connected'}
            </Text>
            <Ionicons name="copy-outline" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="finger-print-outline" size={24} color={Colors.light.text} />
              <Text style={styles.settingText}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="moon-outline" size={24} color={Colors.light.text} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleWalletDetails}>
            <View style={styles.menuItemContent}>
              <Ionicons name="wallet-outline" size={24} color={Colors.light.text} />
              <Text style={styles.menuItemText}>Wallet Details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleExportPrivateKey}>
            <View style={styles.menuItemContent}>
              <Ionicons name="key-outline" size={24} color={Colors.light.text} />
              <Text style={styles.menuItemText}>Export Private Key</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <View style={styles.menuItemContent}>
              <Ionicons name="lock-closed-outline" size={24} color={Colors.light.text} />
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.light.text} />
              <Text style={styles.menuItemText}>About Thaler</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="document-text-outline" size={24} color={Colors.light.text} />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Ionicons name="shield-outline" size={24} color={Colors.light.text} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
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
    backgroundColor: Colors.light.secondary,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.light.card,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: Colors.light.primary,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

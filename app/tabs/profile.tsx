import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';
import { useWallet } from '../../context/WalletContext';

export default function ProfileScreen() {
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  
  // Format the address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Toggle switches
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleNotifications = () => setNotificationsEnabled(prev => !prev);
  const toggleBiometrics = () => setBiometricsEnabled(prev => !prev);
  
  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          onPress: disconnectWallet,
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        {/* Wallet Section */}
        <Card variant="elevated" style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="wallet-outline" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletTitle}>Wallet</Text>
              <Text style={styles.walletAddress}>
                {isConnected ? formatAddress(address) : 'Not connected'}
              </Text>
            </View>
            {isConnected ? (
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => Alert.alert('Copied', 'Address copied to clipboard')}
              >
                <Ionicons name="copy-outline" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            ) : null}
          </View>
          
          {isConnected ? (
            <Button 
              title="Disconnect Wallet" 
              onPress={handleLogout}
              variant="outline"
              size="small"
              style={styles.walletButton}
            />
          ) : (
            <Button 
              title="Connect Wallet" 
              onPress={connectWallet}
              variant="primary"
              size="small"
              style={styles.walletButton}
            />
          )}
        </Card>
        
        {/* Settings Section */}
        <Card variant="elevated" style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={20} color={Colors.light.text} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={Colors.light.text} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="finger-print-outline" size={20} color={Colors.light.text} />
              <Text style={styles.settingText}>Biometric Authentication</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={toggleBiometrics}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>
        
        {/* Security Section */}
        <Card variant="elevated" style={styles.securityCard}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <Ionicons name="key-outline" size={20} color={Colors.light.text} />
              <Text style={styles.securityText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.light.text} />
              <Text style={styles.securityText}>Two-Factor Authentication</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </Card>
        
        {/* About Section */}
        <Card variant="elevated" style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.aboutItem}>
            <View style={styles.aboutInfo}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.light.text} />
              <Text style={styles.aboutText}>About Thaler</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <View style={styles.aboutInfo}>
              <Ionicons name="document-text-outline" size={20} color={Colors.light.text} />
              <Text style={styles.aboutText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <View style={styles.aboutInfo}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.text} />
              <Text style={styles.aboutText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <View style={styles.aboutInfo}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.light.text} />
              <Text style={styles.aboutText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </Card>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  walletCard: {
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  walletAddress: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletButton: {
    width: '100%',
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 12,
  },
  securityCard: {
    marginBottom: 16,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 12,
  },
  aboutCard: {
    marginBottom: 16,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  aboutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
});

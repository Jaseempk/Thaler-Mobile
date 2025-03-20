import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';
import { usePrivy } from '../../context/PrivyContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, walletAddress, createWallet } = usePrivy();
  
  // If user is already authenticated, redirect to tabs
  React.useEffect(() => {
    if (isAuthenticated && walletAddress) {
      router.replace('/tabs');
    } else if (isAuthenticated && !walletAddress) {
      // User is authenticated but doesn't have a wallet yet
      handleCreateWallet();
    }
  }, [isAuthenticated, walletAddress]);
  
  const handleGetStarted = async () => {
    try {
      // Start with email login
      await login('email', 'user@example.com');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Please try again later.');
    }
  };
  
  const handleCreateWallet = async () => {
    try {
      await createWallet();
      router.replace('/tabs');
    } catch (error) {
      console.error('Wallet creation error:', error);
      Alert.alert('Wallet Creation Failed', 'Could not create your embedded wallet. Please try again.');
    }
  };
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Track Your Savings Effortlessly</Text>
        
        <Text style={styles.subtitle}>
          Manage your blockchain savings easily using our intuitive and user-friendly interface and set financial goals with Thaler's savings protocol
        </Text>
        
        <Button 
          title="Get Started with Email" 
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.getStartedButton}
          textStyle={styles.getStartedButtonText}
        />
        
        <View style={styles.socialLoginContainer}>
          <Button 
            title="Continue with Google" 
            onPress={() => login('google')}
            variant="outline"
            size="large"
            style={styles.socialButton}
            icon={<Text style={styles.socialIcon}>G</Text>}
          />
          
          <Button 
            title="Continue with Apple" 
            onPress={() => login('apple')}
            variant="outline"
            size="large"
            style={styles.socialButton}
            icon={<Text style={styles.socialIcon}>A</Text>}
          />
        </View>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginButton}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 48,
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: Colors.light.primary,
    marginBottom: 24,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  socialLoginContainer: {
    marginBottom: 24,
  },
  socialButton: {
    marginBottom: 12,
    borderColor: Colors.light.border,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  loginButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginLeft: 4,
  },
});

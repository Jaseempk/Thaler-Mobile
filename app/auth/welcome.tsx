import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePrivy, useLoginWithEmail } from '@privy-io/expo';
import { UsePrivy } from '../../types/privy';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const privyHook = usePrivy();
  const { user, authenticated } = privyHook as unknown as UsePrivy;
  const { sendCode, state: { status } } = useLoginWithEmail();
  
  // If user is already authenticated, redirect to tabs
  React.useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      router.replace('/tabs');
    }
  }, [user, authenticated]);
  
  const handleGetStarted = async () => {
    try {
      await sendCode({ email: 'user@example.com' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Please try again later.');
    }
  };
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  if (status === 'sending-code' || status === 'submitting-code') {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Track Your{'\n'}Spending{'\n'}Effortlessly</Text>
        
        <Text style={styles.subtitle}>
          Manage your finances easily using our intuitive and user-friendly interface and set financial goals and monitor your progress
        </Text>
        
        <Button 
          title="Get Started" 
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          style={styles.getStartedButton}
          textStyle={styles.getStartedButtonText}
          fullWidth={true}
        />
        
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
    backgroundColor: Colors.light.welcomeBackground,
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
    alignItems: 'flex-start',
    marginTop: 60,
    marginLeft: 30,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 30,
    marginTop: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 48,
    lineHeight: 24,
    opacity: 0.8,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    marginBottom: 24,
    borderRadius: 30,
    height: 56,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginText: {
    fontSize: 14,
    color: '#333333',
  },
  loginButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginLeft: 4,
  },
});

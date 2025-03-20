import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '../../components/common/Button';
import Colors from '../../constants/Colors';
import { usePrivy } from '../../context/PrivyContext';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
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
  
  const handleLogin = async () => {
    try {
      if (!email) {
        Alert.alert('Email Required', 'Please enter your email address');
        return;
      }
      
      // Login with email
      await login('email', email);
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
  
  const handleSignUp = () => {
    router.push('/auth/welcome');
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
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        
        <Text style={styles.subtitle}>
          Sign in to continue managing your savings
        </Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.light.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          <Button 
            title="Login" 
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.loginButton}
            textStyle={styles.loginButtonText}
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
        </View>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupButton}>Sign Up</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  backButton: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
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
  formContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    color: Colors.light.text,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    marginBottom: 24,
  },
  loginButtonText: {
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  signupButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginLeft: 4,
  },
});

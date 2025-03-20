import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { usePrivy } from '../../context/PrivyContext';
import { SavingsService } from '../../services/SavingsService';
import { SavingsPoolCreationParams } from '../../models/savings';
import { ethers } from 'ethers';

export default function CreateSavingsScreen() {
  const router = useRouter();
  const { isAuthenticated, walletAddress, user, createWallet } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenType, setTokenType] = useState<'eth' | 'erc20'>('eth');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('ETH');
  const [amountToSave, setAmountToSave] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [duration, setDuration] = useState<number>(90); // 3 months in days
  const [intervals, setIntervals] = useState<number>(3); // 3 deposits
  
  // Initialize savings service with provider
  const provider = new ethers.providers.JsonRpcProvider(
    'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' // Goerli testnet for demo
  );
  const savingsService = new SavingsService(provider);
  
  // Set Privy wallet in savings service
  useEffect(() => {
    if (walletAddress) {
      savingsService.setPrivyWallet(walletAddress);
    }
  }, [walletAddress]);
  
  // Validate form
  const validateForm = () => {
    if (!amountToSave || parseFloat(amountToSave) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount to save');
      return false;
    }
    
    if (!initialDeposit || parseFloat(initialDeposit) <= 0) {
      Alert.alert('Error', 'Please enter a valid initial deposit amount');
      return false;
    }
    
    if (parseFloat(initialDeposit) > parseFloat(amountToSave)) {
      Alert.alert('Error', 'Initial deposit cannot be greater than the total amount to save');
      return false;
    }
    
    if (tokenType === 'erc20' && !ethers.utils.isAddress(tokenAddress)) {
      Alert.alert('Error', 'Please enter a valid token address');
      return false;
    }
    
    return true;
  };
  
  // Create savings pool
  const handleCreateSavingsPool = async () => {
    if (!validateForm()) return;
    
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in to create a savings pool');
      router.push('/auth/welcome');
      return;
    }
    
    if (!walletAddress) {
      try {
        // Create a wallet if one doesn't exist
        await createWallet();
      } catch (error) {
        console.error('Failed to create wallet:', error);
        Alert.alert('Error', 'Failed to create wallet. Please try again later.');
        return;
      }
    }
    
    try {
      setIsLoading(true);
      
      // Convert duration from days to seconds
      const durationInSeconds = duration * 24 * 60 * 60;
      
      const poolParams: SavingsPoolCreationParams = {
        tokenType,
        tokenAddress: tokenType === 'erc20' ? tokenAddress : undefined,
        amountToSave,
        duration: durationInSeconds,
        initialDeposit,
        totalIntervals: intervals
      };
      
      // In a real app, this would create the savings pool on the blockchain
      // For this demo, we'll simulate the creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to savings screen
      Alert.alert(
        'Success', 
        'Your savings pool has been created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating savings pool:', error);
      Alert.alert('Error', 'Failed to create savings pool. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle token type selection
  const handleTokenTypeSelect = (type: 'eth' | 'erc20') => {
    setTokenType(type);
    if (type === 'eth') {
      setTokenSymbol('ETH');
      setTokenAddress('');
    } else {
      setTokenSymbol('');
    }
  };
  
  // Handle duration selection
  const handleDurationSelect = (months: number) => {
    setDuration(months * 30); // Convert months to days
    
    // Update intervals based on duration
    if (months === 3) setIntervals(3);
    else if (months === 6) setIntervals(6);
    else setIntervals(12);
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Authentication Required</Text>
          <Text style={styles.authSubtitle}>Please log in to create a savings pool</Text>
          <TouchableOpacity 
            style={styles.authButton}
            onPress={() => router.push('/auth/welcome')}
          >
            <Text style={styles.authButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Savings Pool</Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Token Type</Text>
            <View style={styles.tokenTypeContainer}>
              <TouchableOpacity 
                style={[
                  styles.tokenTypeButton, 
                  tokenType === 'eth' && styles.tokenTypeButtonActive
                ]}
                onPress={() => handleTokenTypeSelect('eth')}
              >
                <Text style={[
                  styles.tokenTypeText,
                  tokenType === 'eth' && styles.tokenTypeTextActive
                ]}>
                  ETH
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tokenTypeButton, 
                  tokenType === 'erc20' && styles.tokenTypeButtonActive
                ]}
                onPress={() => handleTokenTypeSelect('erc20')}
              >
                <Text style={[
                  styles.tokenTypeText,
                  tokenType === 'erc20' && styles.tokenTypeTextActive
                ]}>
                  ERC20 Token
                </Text>
              </TouchableOpacity>
            </View>
            
            {tokenType === 'erc20' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Token Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0x..."
                  placeholderTextColor={Colors.light.textSecondary}
                  value={tokenAddress}
                  onChangeText={setTokenAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <Text style={styles.inputLabel}>Token Symbol</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. USDC"
                  placeholderTextColor={Colors.light.textSecondary}
                  value={tokenSymbol}
                  onChangeText={setTokenSymbol}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Savings Plan</Text>
            
            <Text style={styles.inputLabel}>Amount to Save</Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.0"
                placeholderTextColor={Colors.light.textSecondary}
                value={amountToSave}
                onChangeText={setAmountToSave}
                keyboardType="numeric"
              />
              <Text style={styles.amountSymbol}>{tokenSymbol}</Text>
            </View>
            
            <Text style={styles.inputLabel}>Initial Deposit</Text>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.0"
                placeholderTextColor={Colors.light.textSecondary}
                value={initialDeposit}
                onChangeText={setInitialDeposit}
                keyboardType="numeric"
              />
              <Text style={styles.amountSymbol}>{tokenSymbol}</Text>
            </View>
            
            <Text style={styles.inputLabel}>Duration</Text>
            <View style={styles.durationContainer}>
              <TouchableOpacity 
                style={[
                  styles.durationButton, 
                  duration === 90 && styles.durationButtonActive
                ]}
                onPress={() => handleDurationSelect(3)}
              >
                <Text style={[
                  styles.durationText,
                  duration === 90 && styles.durationTextActive
                ]}>
                  3 Months
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.durationButton, 
                  duration === 180 && styles.durationButtonActive
                ]}
                onPress={() => handleDurationSelect(6)}
              >
                <Text style={[
                  styles.durationText,
                  duration === 180 && styles.durationTextActive
                ]}>
                  6 Months
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.durationButton, 
                  duration === 360 && styles.durationButtonActive
                ]}
                onPress={() => handleDurationSelect(12)}
              >
                <Text style={[
                  styles.durationText,
                  duration === 360 && styles.durationTextActive
                ]}>
                  12 Months
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Summary</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Token</Text>
              <Text style={styles.summaryValue}>{tokenSymbol}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                {amountToSave ? `${amountToSave} ${tokenSymbol}` : '-'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Initial Deposit</Text>
              <Text style={styles.summaryValue}>
                {initialDeposit ? `${initialDeposit} ${tokenSymbol}` : '-'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {duration === 90 ? '3 Months' : 
                 duration === 180 ? '6 Months' : '12 Months'}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Number of Deposits</Text>
              <Text style={styles.summaryValue}>{intervals}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Deposit Frequency</Text>
              <Text style={styles.summaryValue}>Monthly</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Deposit Amount</Text>
              <Text style={styles.summaryValue}>
                {amountToSave && initialDeposit ? 
                  `${((parseFloat(amountToSave) - parseFloat(initialDeposit)) / (intervals - 1)).toFixed(4)} ${tokenSymbol}` : 
                  '-'
                }
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateSavingsPool}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Savings Pool</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  tokenTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tokenTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.secondaryLight,
    marginRight: 8,
    alignItems: 'center',
  },
  tokenTypeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  tokenTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  tokenTypeTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  amountSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.secondaryLight,
    marginRight: 8,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  durationTextActive: {
    color: '#FFFFFF',
  },
  summarySection: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  authButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

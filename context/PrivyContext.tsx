import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Since we don't have the actual types yet, we'll define interfaces for what we need
interface PrivyClient {
  getSession: () => Promise<{ userId: string } | null>;
  getWallets: (userId: string) => Promise<PrivyWallet[]>;
  loginWithEmail: (email: string) => Promise<PrivyLoginResponse>;
  loginWithGoogle: () => Promise<PrivyLoginResponse>;
  loginWithApple: () => Promise<PrivyLoginResponse>;
  loginWithPasskey: () => Promise<PrivyLoginResponse>;
  logout: () => Promise<void>;
  createWallet: (userId: string, options: { walletClientType: string }) => Promise<PrivyWallet>;
  sendTransaction: (userId: string, walletAddress: string, txParams: any) => Promise<any>;
}

interface PrivyWallet {
  address: string;
  walletClientType: string;
  getSigner: () => any;
}

interface PrivyLoginResponse {
  status: 'success' | 'error';
  userId: string;
}

interface PrivyUser {
  id?: string;
  email?: string;
  phone?: string;
  wallet?: {
    address: string;
  };
  socialProfiles?: {
    google?: {
      email: string;
      name?: string;
    };
    apple?: {
      email: string;
      name?: string;
    };
  };
}

import { PrivyClient as PrivyClientImpl } from '@privy-io/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import Config from '../constants/Config';

// Define your Privy app ID - you'll need to get this from the Privy dashboard
const PRIVY_APP_ID = Config.PRIVY.APP_ID;

// Define the context type
interface PrivyContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  walletAddress: string | null;
  embeddedWallet: PrivyWallet | null;
  balance: string;
  user: PrivyUser | null;
  login: (method: 'email' | 'google' | 'apple' | 'passkey', identifier?: string) => Promise<void>;
  logout: () => Promise<void>;
  createWallet: () => Promise<PrivyWallet>;
  getProvider: () => ethers.providers.Provider | null;
  getSigner: () => ethers.Signer | null;
  sendTransaction: (to: string, amount: string) => Promise<ethers.providers.TransactionResponse>;
}

// Create the context
const PrivyContext = createContext<PrivyContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  walletAddress: null,
  embeddedWallet: null,
  balance: '0',
  user: null,
  login: async () => {},
  logout: async () => {},
  createWallet: async () => { throw new Error('Not implemented'); },
  getProvider: () => null,
  getSigner: () => null,
  sendTransaction: async () => { throw new Error('Not implemented'); }
});

// Hook to use the Privy context
export const usePrivy = () => useContext(PrivyContext);

// Provider component
interface PrivyProviderProps {
  children: ReactNode;
}

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [embeddedWallet, setEmbeddedWallet] = useState<PrivyWallet | null>(null);
  const [balance, setBalance] = useState('0');
  const [user, setUser] = useState<PrivyUser | null>(null);
  const [privyClient, setPrivyClient] = useState<PrivyClient | null>(null);
  
  // Initialize Privy client
  useEffect(() => {
    const initPrivy = async () => {
      try {
        const client = new PrivyClientImpl({
          appId: PRIVY_APP_ID,
        });
        setPrivyClient(client);
        
        // Check if user is already logged in
        const session = await client.getSession();
        if (session) {
          setIsAuthenticated(true);
          setUserId(session.userId);
          
          // Load wallet if it exists
          await loadWallet(client, session.userId);
        }
      } catch (error) {
        console.error('Failed to initialize Privy:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initPrivy();
  }, []);
  
  // Load wallet for authenticated user
  const loadWallet = async (client: PrivyClient, uid: string) => {
    try {
      // Check if user has an embedded wallet
      const wallets = await client.getWallets(uid);
      const embeddedWallets = wallets.filter((w: PrivyWallet) => w.walletClientType === 'privy');
      
      if (embeddedWallets.length > 0) {
        // Use the first embedded wallet
        const wallet = embeddedWallets[0];
        setEmbeddedWallet(wallet);
        setWalletAddress(wallet.address);
        
        // Get wallet balance
        await fetchBalance(wallet.address);
      } else {
        // No embedded wallet found, user might need to create one
        console.log('No embedded wallet found for user');
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };
  
  // Fetch wallet balance
  const fetchBalance = async (address: string) => {
    try {
      // Connect to Ethereum provider
      const provider = new ethers.providers.JsonRpcProvider(Config.RPC_URL);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };
  
  // Login with Privy
  const login = async (method: 'email' | 'google' | 'apple' | 'passkey', identifier?: string) => {
    if (!privyClient) {
      throw new Error('Privy client not initialized');
    }
    
    setIsLoading(true);
    
    try {
      let loginResponse;
      
      switch (method) {
        case 'email':
          if (!identifier) throw new Error('Email is required');
          loginResponse = await privyClient.loginWithEmail(identifier);
          break;
        case 'google':
          loginResponse = await privyClient.loginWithGoogle();
          break;
        case 'apple':
          loginResponse = await privyClient.loginWithApple();
          break;
        case 'passkey':
          loginResponse = await privyClient.loginWithPasskey();
          break;
        default:
          throw new Error('Invalid login method');
      }
      
      // Handle login response
      if (loginResponse.status === 'success') {
        setIsAuthenticated(true);
        setUserId(loginResponse.userId);
        
        // Load wallet if it exists
        await loadWallet(privyClient, loginResponse.userId);
        
        // Create a mock user based on the login method
        const mockUser: PrivyUser = {
          id: loginResponse.userId,
          email: method === 'email' ? identifier : `user_${Math.random().toString(36).substring(2, 9)}@example.com`,
        };
        
        // Set the user
        setUser(mockUser);
        
        // Store session info
        await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_ID, loginResponse.userId);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout
  const logout = async () => {
    if (!privyClient) {
      throw new Error('Privy client not initialized');
    }
    
    try {
      await privyClient.logout();
      
      // Clear state
      setIsAuthenticated(false);
      setUserId(null);
      setWalletAddress(null);
      setEmbeddedWallet(null);
      setBalance('0');
      setUser(null);
      
      // Clear storage
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };
  
  // Create embedded wallet
  const createWallet = async (): Promise<PrivyWallet> => {
    if (!privyClient || !userId) {
      throw new Error('Privy client not initialized or user not logged in');
    }
    
    try {
      setIsLoading(true);
      
      // Create new embedded wallet
      const wallet = await privyClient.createWallet(userId, {
        walletClientType: 'privy',
      });
      
      setEmbeddedWallet(wallet);
      setWalletAddress(wallet.address);
      
      // Get initial balance
      await fetchBalance(wallet.address);
      
      // Update user with wallet
      if (user) {
        setUser({
          ...user,
          wallet: {
            address: wallet.address
          }
        });
      }
      
      return wallet;
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get provider
  const getProvider = (): ethers.providers.Provider | null => {
    if (!embeddedWallet) return null;
    
    try {
      return new ethers.providers.JsonRpcProvider(Config.RPC_URL);
    } catch (error) {
      console.error('Failed to get provider:', error);
      return null;
    }
  };
  
  // Get signer
  const getSigner = (): ethers.Signer | null => {
    if (!embeddedWallet || !privyClient || !userId) return null;
    
    try {
      // This is a simplified version - in a real implementation,
      // you would use the Privy SDK to get a signer
      return embeddedWallet.getSigner();
    } catch (error) {
      console.error('Failed to get signer:', error);
      return null;
    }
  };
  
  // Send transaction
  const sendTransaction = async (to: string, amount: string): Promise<ethers.providers.TransactionResponse> => {
    if (!embeddedWallet || !privyClient || !userId) {
      throw new Error('Wallet not initialized or user not logged in');
    }
    
    try {
      const amountWei = ethers.utils.parseEther(amount);
      
      // Use Privy's embedded wallet to send transaction
      const tx = await privyClient.sendTransaction(userId, embeddedWallet.address, {
        to,
        value: amountWei.toString(),
      });
      
      // Update balance after transaction
      await fetchBalance(walletAddress!);
      
      return tx as unknown as ethers.providers.TransactionResponse;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };
  
  // Refresh balance periodically
  useEffect(() => {
    if (!walletAddress) return;
    
    const intervalId = setInterval(() => {
      fetchBalance(walletAddress);
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [walletAddress]);
  
  const contextValue: PrivyContextType = {
    isAuthenticated,
    isLoading,
    userId,
    walletAddress,
    embeddedWallet,
    balance,
    user,
    login,
    logout,
    createWallet,
    getProvider,
    getSigner,
    sendTransaction,
  };
  
  return (
    <PrivyContext.Provider value={contextValue}>
      {children}
    </PrivyContext.Provider>
  );
};

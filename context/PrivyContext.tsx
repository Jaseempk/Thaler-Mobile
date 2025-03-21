import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  PrivyProvider as PrivySDKProvider, 
  usePrivy as usePrivySDK,
  useLoginWithEmail
} from '@privy-io/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import Config from '../constants/Config';
import 'react-native-get-random-values';
import '@ethersproject/shims';

// Define the user type
export interface PrivyUser {
  id?: string;
  email?: {
    address: string;
    verified: boolean;
  };
  phone?: {
    number: string;
    verified: boolean;
  };
  wallet?: {
    address: string;
  };
  linkedAccounts?: Array<{
    type: string;
    address: string;
    [key: string]: any;
  }>;
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

// Define the context type
interface PrivyContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  userId: string | null;
  walletAddress: string | null;
  embeddedWallet: any | null;
  balance: string;
  user: PrivyUser | null;
  login: (method: 'email' | 'google' | 'apple' | 'passkey', identifier?: string) => Promise<void>;
  logout: () => Promise<void>;
  createWallet: () => Promise<any>;
  getProvider: () => ethers.providers.Provider | null;
  getSigner: () => ethers.Signer | null;
  sendTransaction: (to: string, value: string, data?: string) => Promise<ethers.providers.TransactionResponse>;
  sendERC20Approval: (tokenAddress: string, spender: string, amount: string) => Promise<ethers.providers.TransactionResponse>;
}

// Create the context
const PrivyContext = createContext<PrivyContextType>({
  isAuthenticated: false,
  isLoading: true,
  isReady: false,
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
  sendTransaction: async () => { throw new Error('Not implemented'); },
  sendERC20Approval: async () => { throw new Error('Not implemented'); }
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
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [embeddedWallet, setEmbeddedWallet] = useState<any | null>(null);
  const [balance, setBalance] = useState('0');
  const [user, setUser] = useState<PrivyUser | null>(null);
  
  // Use the Privy SDK hooks
  const privy = usePrivySDK();
  const emailLogin = useLoginWithEmail();
  
  // Check authentication status
  useEffect(() => {
    console.log('PrivyProvider useEffect - privy:', privy);
    console.log('PrivyProvider useEffect - privy.isReady:', privy?.isReady);
    console.log('PrivyProvider useEffect - privy.isAuthenticated:', privy?.isAuthenticated);
    
    const checkAuth = async () => {
      try {
        console.log('checkAuth - privy.isReady:', privy?.isReady);
        if (privy?.isReady) {
          setIsLoading(false);
          setIsReady(true);
          console.log('checkAuth - privy.isAuthenticated:', privy?.isAuthenticated);
          
          if (privy?.isAuthenticated) {
            setIsAuthenticated(true);
            
            // Set user ID
            if (privy.user?.id) {
              setUserId(privy.user.id);
              
              // Create user object
              const privyUser: PrivyUser = {
                id: privy.user.id,
                email: privy.user.email,
              };
              
              setUser(privyUser);
              
              // Load wallet if available
              await loadWallet();
            }
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [privy.isReady, privy.isAuthenticated, privy.user]);
  
  // Load wallet
  const loadWallet = async () => {
    try {
      // Check if user has any linked accounts with wallets
      // Try different property names based on Privy SDK version
      const linkedAccounts = (privy.user as any)?.linkedAccounts || (privy.user as any)?.linked_accounts;
      if (linkedAccounts) {
        const walletAccounts = linkedAccounts.filter(
          (account: { type: string }) => account.type === 'wallet'
        );
        
        if (walletAccounts.length > 0) {
          const walletAddress = walletAccounts[0].address;
          setWalletAddress(walletAddress);
          setEmbeddedWallet(walletAccounts[0]);
          
          // Get initial balance
          await fetchBalance(walletAddress);
        }
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
    try {
      setIsLoading(true);
      
      switch (method) {
        case 'email':
          if (!identifier) throw new Error('Email is required');
          // Use the email login hook
          await emailLogin.sendCode({ email: identifier });
          // Note: User will need to enter the code they receive in a separate step
          break;
        case 'google':
          // Use the Privy SDK for social logins
          // Note: Different versions of Privy SDK have different methods
          // Try alternate methods if this fails
          try {
            await (privy as any).login({ type: 'google' });
          } catch (e) {
            console.log('Trying alternate login method for Google');
            await (privy as any).loginWithGoogle();
          }
          break;
        case 'apple':
          try {
            await (privy as any).login({ type: 'apple' });
          } catch (e) {
            console.log('Trying alternate login method for Apple');
            await (privy as any).loginWithApple();
          }
          break;
        case 'passkey':
          try {
            await (privy as any).login({ type: 'passkey' });
          } catch (e) {
            console.log('Trying alternate login method for Passkey');
            await (privy as any).loginWithPasskey();
          }
          break;
        default:
          throw new Error('Invalid login method');
      }
      
      // Authentication state will be updated by the useEffect hook
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await privy.logout();
      
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
  const createWallet = async () => {
    try {
      setIsLoading(true);
      
      // Create new embedded wallet using Privy SDK
      // Different versions of Privy SDK have different methods
      let wallet;
      try {
        wallet = await (privy as any).createEmbeddedWallet();
      } catch (e) {
        console.log('Trying alternate wallet creation method');
        wallet = await (privy as any).createWallet();
      }
      
      if (wallet) {
        setEmbeddedWallet(wallet);
        setWalletAddress(wallet.address);
        
        // Get initial balance
        await fetchBalance(wallet.address);
        
        // Update user state
        if (user) {
          setUser({
            ...user
          });
        }
        
        return wallet;
      }
      
      throw new Error('Failed to create wallet');
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get provider
  const getProvider = (): ethers.providers.Provider | null => {
    try {
      return new ethers.providers.JsonRpcProvider(Config.RPC_URL);
    } catch (error) {
      console.error('Failed to get provider:', error);
      return null;
    }
  };
  
  // Get signer
  const getSigner = (): ethers.Signer | null => {
    if (!embeddedWallet) return null;
    
    try {
      // For Privy, we don't have direct access to the private key
      // Instead, we need to use their transaction methods
      // This is a placeholder that will be used for read-only operations
      const provider = getProvider();
      if (!provider) return null;
      
      // This is a dummy signer that won't actually work for sending transactions
      // Real transactions should use sendTransaction method
      // Note: Using any type here because provider.getSigner is not in the Provider type
      return (provider as any).getSigner(walletAddress!);
    } catch (error) {
      console.error('Failed to get signer:', error);
      return null;
    }
  };
  
  // Send transaction
  const sendTransaction = async (
    to: string, 
    value: string, 
    data?: string
  ): Promise<ethers.providers.TransactionResponse> => {
    if (!embeddedWallet) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      // Convert value to wei
      const valueWei = ethers.utils.parseEther(value);
      
      // Prepare transaction parameters
      const txParams: any = {
        to,
        value: valueWei.toString(),
      };
      
      // Add data if provided
      if (data) {
        txParams.data = data;
      }
      
      // Send transaction using Privy's wallet
      const txHash = await embeddedWallet.sendTransaction(txParams);
      
      // Update balance after transaction
      await fetchBalance(walletAddress!);
      
      // Create a transaction response object
      const provider = getProvider();
      if (!provider) {
        throw new Error('Provider not available');
      }
      
      // Wait for the transaction to be mined
      const txResponse = await provider.getTransaction(txHash);
      
      return txResponse;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };
  
  // Send ERC20 approval transaction
  const sendERC20Approval = async (
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<ethers.providers.TransactionResponse> => {
    if (!embeddedWallet) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      // ERC20 interface for approval function
      const erc20Interface = new ethers.utils.Interface([
        'function approve(address spender, uint256 amount) returns (bool)'
      ]);
      
      // Encode the approval function call
      const data = erc20Interface.encodeFunctionData('approve', [
        spender,
        ethers.utils.parseEther(amount)
      ]);
      
      // Send the approval transaction
      return await sendTransaction(tokenAddress, '0', data);
    } catch (error) {
      console.error('ERC20 approval failed:', error);
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
    isReady,
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
    sendERC20Approval,
  };
  
  return (
    <PrivyContext.Provider value={contextValue}>
      {children}
    </PrivyContext.Provider>
  );
};

// Wrapper component that includes the Privy SDK provider
interface RootPrivyProviderProps {
  children: ReactNode;
}

export const RootPrivyProvider: React.FC<RootPrivyProviderProps> = ({ children }) => {
  return (
    <PrivySDKProvider 
      appId={Config.PRIVY.APP_ID}
      clientId={Config.PRIVY.CLIENT_ID}
    >
      <PrivyProvider>
        {children}
      </PrivyProvider>
    </PrivySDKProvider>
  );
};

export default PrivyContext;

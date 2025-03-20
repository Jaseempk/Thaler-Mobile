import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../constants/Config';

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  getProvider: () => ethers.providers.Provider | null;
  getSigner: () => ethers.Signer | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: '0',
  isConnected: false,
  isLoading: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  getProvider: () => null,
  getSigner: () => null,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      try {
        // In a real app, this would use WalletConnect or a similar service
        // For now, we'll use a simple JSON RPC provider
        const newProvider = new ethers.providers.JsonRpcProvider(Config.BLOCKCHAIN.RPC_URL);
        setProvider(newProvider);
        
        // Check if we have a stored address
        const storedAddress = await AsyncStorage.getItem(Config.STORAGE_KEYS.USER_ADDRESS);
        if (storedAddress) {
          setAddress(storedAddress);
          setIsConnected(true);
          
          // Get balance
          const ethBalance = await newProvider.getBalance(storedAddress);
          setBalance(ethers.utils.formatEther(ethBalance));
        }
      } catch (error) {
        console.error('Failed to initialize wallet provider:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initProvider();
  }, []);

  // Mock wallet connection (in a real app, this would use WalletConnect)
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // This is a mock implementation - in a real app, this would trigger a wallet connection flow
      const mockAddress = '0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620';
      setAddress(mockAddress);
      setIsConnected(true);
      
      // Store the address
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_ADDRESS, mockAddress);
      
      // Get balance
      if (provider) {
        const ethBalance = await provider.getBalance(mockAddress);
        setBalance(ethers.utils.formatEther(ethBalance));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsLoading(true);
    try {
      setAddress(null);
      setBalance('0');
      setIsConnected(false);
      
      // Clear stored address
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_ADDRESS);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProvider = () => provider;

  const getSigner = () => {
    if (!provider || !address) return null;
    
    // In a real app with WalletConnect, this would return a proper signer
    // For now, we'll return a mock signer that won't actually sign transactions
    return new ethers.VoidSigner(address, provider);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
        getProvider,
        getSigner,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

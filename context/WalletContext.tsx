import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/expo';
import Config from '../constants/Config';
import { UsePrivy, PrivyUser } from '../types/privy';

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  getProvider: () => Promise<ethers.providers.Provider | null>;
  getSigner: () => Promise<ethers.Signer | null>;
  sendTransaction: (to: string, amount: string, data?: string) => Promise<ethers.providers.TransactionResponse>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: '0',
  isConnected: false,
  isLoading: false,
  getProvider: async () => null,
  getSigner: async () => null,
  sendTransaction: async () => { throw new Error('Not implemented'); },
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
  
  const privyHook = usePrivy();
  const { user, authenticated } = privyHook as unknown as UsePrivy;

  useEffect(() => {
    const initializeWallet = async () => {
      if (!authenticated) return;

      try {
        if (user?.wallet?.address) {
          setAddress(user.wallet.address);
          setIsConnected(true);
          
          // Get initial balance
          const provider = new ethers.providers.JsonRpcProvider(Config.BLOCKCHAIN.RPC_URL);
          const balanceWei = await provider.getBalance(user.wallet.address);
          setBalance(ethers.utils.formatEther(balanceWei));
        } else if (user?.smartWallet?.address) {
          setAddress(user.smartWallet.address);
          setIsConnected(true);
          
          // Get initial balance
          const provider = new ethers.providers.JsonRpcProvider(Config.BLOCKCHAIN.RPC_URL);
          const balanceWei = await provider.getBalance(user.smartWallet.address);
          setBalance(ethers.utils.formatEther(balanceWei));
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, [authenticated, user]);

  const getProvider = async () => {
    if (!user?.wallet) return null;
    const provider = new ethers.providers.JsonRpcProvider(Config.BLOCKCHAIN.RPC_URL);
    return provider;
  };

  const getSigner = async () => {
    const provider = await getProvider();
    if (!provider || !address) return null;
    return new ethers.providers.Web3Provider(provider as any).getSigner(address);
  };

  const sendTransaction = async (to: string, amount: string, data?: string) => {
    if (!address) throw new Error('No wallet available');
    
    const provider = await getProvider();
    if (!provider) throw new Error('No provider available');

    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
      data: data || '0x'
    });

    return tx;
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        isLoading,
        getProvider,
        getSigner,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

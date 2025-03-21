import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { usePrivy } from '@privy-io/expo';
import Config from '../constants/Config';

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
  
  const { ready, user, wallet } = usePrivy();

  useEffect(() => {
    const initializeWallet = async () => {
      if (!ready) return;

      try {
        if (user?.linkedAccounts?.length > 0) {
          const walletAccount = user.linkedAccounts.find(
            account => account.type === 'wallet'
          );
          
          if (walletAccount) {
            setAddress(walletAccount.address);
            setIsConnected(true);
            
            // Get initial balance
            const provider = new ethers.providers.JsonRpcProvider(Config.BLOCKCHAIN.RPC_URL);
            const balanceWei = await provider.getBalance(walletAccount.address);
            setBalance(ethers.utils.formatEther(balanceWei));
          }
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, [ready, user]);

  const getProvider = async () => {
    if (!wallet) return null;
    return await wallet.getProvider();
  };

  const getSigner = async () => {
    const provider = await getProvider();
    if (!provider) return null;
    return new ethers.providers.Web3Provider(provider).getSigner();
  };

  const sendTransaction = async (to: string, amount: string, data?: string) => {
    if (!wallet) throw new Error('No wallet available');
    
    const provider = await getProvider();
    if (!provider) throw new Error('No provider available');

    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });

    const tx = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to,
        value: ethers.utils.parseEther(amount).toHexString(),
        data
      }]
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

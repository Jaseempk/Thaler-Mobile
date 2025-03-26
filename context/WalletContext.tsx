import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { usePrivy, useEmbeddedEthereumWallet } from "@privy-io/expo";
import Config from "../constants/Config";
import { UsePrivy, PrivyUser } from "../types/privy";

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  getProvider: () => Promise<ethers.providers.Provider | null>;
  getSigner: () => Promise<ethers.Signer | null>;
  sendTransaction: (
    to: string,
    amount: string,
    data?: string
  ) => Promise<ethers.providers.TransactionResponse>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  isConnected: false,
  isLoading: false,
  connectWallet: async () => {
    throw new Error("Not implemented");
  },
  disconnectWallet: async () => {
    throw new Error("Not implemented");
  },
  getProvider: async () => null,
  getSigner: async () => null,
  sendTransaction: async () => {
    throw new Error("Not implemented");
  },
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const privyHook = usePrivy();
  const { user, isReady } = privyHook as unknown as UsePrivy;
  const { wallets } = useEmbeddedEthereumWallet();

  useEffect(() => {
    const initializeWallet = async () => {
      if (!isReady) return;
      console.log("Waalaleteshshds:", wallets);
      try {
        // Check for embedded wallet first
        if (wallets && wallets.length > 0) {
          const embeddedWallet = wallets[0];
          console.log("Found embedded wallet:", embeddedWallet);
          setAddress(embeddedWallet.address);
          setIsConnected(true);

          // Get initial balance
          const provider = new ethers.providers.JsonRpcProvider(
            Config.BLOCKCHAIN.RPC_URL
          );
          const balanceWei = await provider.getBalance(embeddedWallet.address);
          setBalance(ethers.utils.formatEther(balanceWei));
        }
        // Fallback to other wallet types if embedded wallet is not available
        else if (user?.wallet?.address) {
          console.log("Using user wallet:", user.wallet.address);
          setAddress(user.wallet.address);
          setIsConnected(true);

          // Get initial balance
          const provider = new ethers.providers.JsonRpcProvider(
            Config.BLOCKCHAIN.RPC_URL
          );
          const balanceWei = await provider.getBalance(user.wallet.address);
          setBalance(ethers.utils.formatEther(balanceWei));
        } else if (user?.smartWallet?.address) {
          console.log("Using smart wallet:", user.smartWallet.address);
          setAddress(user.smartWallet.address);
          setIsConnected(true);

          // Get initial balance
          const provider = new ethers.providers.JsonRpcProvider(
            Config.BLOCKCHAIN.RPC_URL
          );
          const balanceWei = await provider.getBalance(
            user.smartWallet.address
          );
          setBalance(ethers.utils.formatEther(balanceWei));
        } else {
          console.log("No wallet found for user");
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, [isReady, user, wallets]);

  const getProvider = async () => {
    // Create a JSON RPC provider regardless of wallet type
    const provider = new ethers.providers.JsonRpcProvider(
      Config.BLOCKCHAIN.RPC_URL
    );
    return provider;
  };

  const getSigner = async () => {
    // Check for embedded wallet first
    if (wallets && wallets.length > 0) {
      try {
        const embeddedWallet = wallets[0];
        console.log("Getting signer from embedded wallet:", embeddedWallet);

        // In Privy's API, we can use the embedded wallet directly with ethers.js
        // The wallet should be compatible with ethers.js Wallet interface
        if (embeddedWallet.address) {
          // Use the provider with the wallet address
          const provider = await getProvider();
          if (provider) {
            return provider.getSigner(embeddedWallet.address);
          }
        }
      } catch (error) {
        console.error("Failed to get signer from embedded wallet:", error);
      }
    }

    // Fallback to traditional provider/signer pattern
    const provider = await getProvider();
    if (!provider || !address) return null;
    return new ethers.providers.Web3Provider(provider as any).getSigner(
      address
    );
  };

  const sendTransaction = async (to: string, amount: string, data?: string) => {
    if (!address) throw new Error("No wallet available");
    console.log("Sending transaction from address:", address);

    // Check if we have an embedded wallet first
    if (wallets && wallets.length > 0) {
      console.log("Using embedded wallet for transaction");
    }

    const provider = await getProvider();
    if (!provider) throw new Error("No provider available");

    const signer = await getSigner();
    if (!signer) throw new Error("No signer available");

    console.log("Transaction details:", {
      to,
      amount,
      amountWei: ethers.utils.parseEther(amount).toString(),
      data: data || "0x",
    });

    const tx = await signer.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
      data: data || "0x",
    });

    return tx;
  };

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      
      // If we have Privy, use it to connect
      if (privyHook && (privyHook as any).login) {
        await (privyHook as any).login();
      }
      
      // Check for embedded wallet
      if (wallets && wallets.length > 0) {
        const embeddedWallet = wallets[0];
        setAddress(embeddedWallet.address);
        setIsConnected(true);
        
        // Get balance
        const provider = await getProvider();
        if (provider && embeddedWallet.address) {
          const balanceWei = await provider.getBalance(embeddedWallet.address);
          setBalance(ethers.utils.formatEther(balanceWei));
        }
      }
      
      // If no wallet is connected yet, check user wallet
      if (!isConnected && user?.wallet?.address) {
        setAddress(user.wallet.address);
        setIsConnected(true);
        
        // Get balance
        const provider = await getProvider();
        if (provider && user.wallet.address) {
          const balanceWei = await provider.getBalance(user.wallet.address);
          setBalance(ethers.utils.formatEther(balanceWei));
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      
      // If we have Privy, use it to logout
      if (privyHook && (privyHook as any).logout) {
        await (privyHook as any).logout();
      }
      
      // Reset state
      setAddress(null);
      setBalance("0");
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
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
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

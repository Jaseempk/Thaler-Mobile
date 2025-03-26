import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  PrivyProvider as PrivySDKProvider,
  usePrivy,
  useLoginWithEmail,
  useLoginWithOAuth,
} from "@privy-io/expo";
import { ethers } from "ethers";
import Config from "../constants/Config";
import { PrivyContextType, PrivyUser, UsePrivy } from "../types/privy";
import "react-native-get-random-values";
import "@ethersproject/shims";

// Create the context with the imported type
const PrivyContext = createContext<PrivyContextType>({
  isLoading: true,
  user: null,
  walletAddress: null,
  balance: "0",
  loginWithEmail: async () => {},
  loginWithGoogle: async () => {},
  loginWithApple: async () => {},
  verifyCode: async () => {},
  logout: async () => {},
  sendTransaction: async () => {
    throw new Error("Not implemented");
  },
});

// Hook to use the Privy context
export const usePrivyContext = () => useContext(PrivyContext);

// Provider component
interface PrivyProviderProps {
  children: ReactNode;
}

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");

  // Use Privy hooks with proper typing
  const privyHook = usePrivy();
  const { user, logout: privyLogout } = privyHook as unknown as UsePrivy;
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { login: oauthLogin } = useLoginWithOAuth({
    onSuccess: (user, isNewUser) => {
      console.log("Logged in successfully", { user, isNewUser });
    },
    onError: (error) => {
      console.error("Login failed", error);
      throw error;
    },
  });

  // Update wallet address when user changes
  useEffect(() => {
    if (user?.wallet?.address) {
      setWalletAddress(user.wallet.address);
      fetchBalance(user.wallet.address);
    } else if (user?.smartWallet?.address) {
      setWalletAddress(user.smartWallet.address);
      fetchBalance(user.smartWallet.address);
    } else {
      setWalletAddress(null);
      setBalance("0");
    }
    setIsLoading(false);
  }, [user]);

  // Fetch wallet balance
  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        Config.BLOCKCHAIN.RPC_URL
      );
      const balanceWei = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balanceWei));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  // Login methods
  const loginWithEmail = async (email: string) => {
    try {
      setIsLoading(true);
      await sendCode({ email });
    } catch (error) {
      console.error("Failed to send verification code:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      await loginWithCode({ email, code });
    } catch (error) {
      console.error("Failed to verify code:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await oauthLogin({ provider: "google" });
    } catch (error) {
      console.error("Failed to login with Google:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async () => {
    try {
      setIsLoading(true);
      await oauthLogin({ provider: "apple" });
    } catch (error) {
      console.error("Failed to login with Apple:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await privyLogout();
      setWalletAddress(null);
      setBalance("0");
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send transaction
  const sendTransaction = async (
    to: string,
    value: string,
    data?: string
  ): Promise<ethers.providers.TransactionResponse> => {
    if (!walletAddress) {
      throw new Error("No wallet connected");
    }

    try {
      const provider = new ethers.providers.JsonRpcProvider(
        Config.BLOCKCHAIN.RPC_URL
      );
      const valueWei = ethers.utils.parseEther(value);

      const tx = await provider.send("eth_sendTransaction", [
        {
          from: walletAddress,
          to,
          value: valueWei.toHexString(),
          data: data || "0x",
        },
      ]);

      return await provider.getTransaction(tx);
    } catch (error) {
      console.error("Transaction failed:", error);
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

  return (
    <PrivyContext.Provider
      value={{
        isLoading,
        user: user as PrivyUser | null,
        walletAddress,
        balance,
        loginWithEmail,
        loginWithGoogle,
        loginWithApple,
        verifyCode,
        logout,
        sendTransaction,
      }}
    >
      {children}
    </PrivyContext.Provider>
  );
};

// Root provider that includes the Privy SDK provider
interface RootPrivyProviderProps {
  children: ReactNode;
}

export const RootPrivyProvider: React.FC<RootPrivyProviderProps> = ({
  children,
}) => {
  return (
    <PrivySDKProvider
      appId={Config.PRIVY.APP_ID}
      clientId={Config.PRIVY.CLIENT_ID}
    >
      <PrivyProvider>{children}</PrivyProvider>
    </PrivySDKProvider>
  );
};

export default PrivyContext;

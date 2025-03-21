import { ethers } from 'ethers';

export interface PrivyWallet {
  address: string;
  type: 'wallet';
}

export interface PrivySmartWallet {
  address: string;
  type: 'smartWallet';
}

export interface PrivyUser {
  id: string;
  createdAt: Date;
  email?: {
    address: string;
    verified: boolean;
  };
  phone?: {
    number: string;
    verified: boolean;
  };
  wallet?: PrivyWallet;
  smartWallet?: PrivySmartWallet;
  google?: {
    email: string;
    name?: string;
  };
  apple?: {
    email: string;
    name?: string;
  };
  linkedAccounts: Array<{
    type: string;
    address?: string;
    [key: string]: any;
  }>;
  customMetadata?: Record<string, any>;
}

export interface UsePrivy {
  ready: boolean;
  authenticated: boolean;
  user: PrivyUser | null;
  logout: () => Promise<void>;
  createWallet: () => Promise<any>;
  linkWallet: () => Promise<any>;
  unlinkWallet: (address: string) => Promise<void>;
  connectWallet: () => Promise<any>;
}

export interface PrivyContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: PrivyUser | null;
  walletAddress: string | null;
  balance: string;
  loginWithEmail: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  sendTransaction: (
    to: string,
    value: string,
    data?: string
  ) => Promise<ethers.providers.TransactionResponse>;
}

export interface UseLoginWithOAuth {
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
} 
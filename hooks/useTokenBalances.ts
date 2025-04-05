import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

// USDC contract ABI (minimal for balanceOf)
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

// Base Sepolia USDC address
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  address?: string;
  decimals: number;
  priceChange24h?: string;
  price?: number;
}

// Cache for token balances
const balanceCache = new Map<string, {
  balances: TokenBalance[];
  totalBalanceUSD: string;
  timestamp: number;
}>();

const CACHE_DURATION = 10000; // 10 seconds cache duration

export function useTokenBalances() {
  const { address, getProvider, isConnected } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  // Format the balance for display with proper decimal places
  const formatBalance = (balance: string) => {
    const balanceNum = parseFloat(balance);
    return balanceNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  // Format USD value for display
  const formatUSD = (value: string) => {
    const valueNum = parseFloat(value);
    return valueNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get a specific token's balance
  const getTokenBalance = (symbol: string): string => {
    const token = balances.find(t => t.symbol === symbol);
    return token ? token.balance : '0';
  };

  // Get a specific token's USD value
  const getTokenUSDValue = (symbol: string): string => {
    const token = balances.find(t => t.symbol === symbol);
    if (!token || !token.price) return '0';
    return (parseFloat(token.balance) * token.price).toFixed(2);
  };

  // Get a specific token's full data
  const getTokenData = (symbol: string): TokenBalance | null => {
    return balances.find(t => t.symbol === symbol) || null;
  };

  // Get cached balances for specific tokens
  const getCachedBalances = (symbols: string[]): {
    [key: string]: { balance: string; price: number | null };
  } => {
    const result: { [key: string]: { balance: string; price: number | null } } = {};
    
    symbols.forEach(symbol => {
      const token = balances.find(t => t.symbol === symbol);
      if (token) {
        result[symbol] = {
          balance: token.balance,
          price: token.price || null
        };
      }
    });
    
    return result;
  };

  // Fetch ETH price and 24h change from CoinGecko
  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.ethereum || !data.ethereum.usd) {
        throw new Error('Invalid ETH price data received');
      }
      
      setEthPrice(data.ethereum.usd);
      setError(null);
      return {
        price: data.ethereum.usd,
        priceChange24h: data.ethereum.usd_24h_change?.toFixed(2) || '0.00'
      };
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      setError('Failed to fetch ETH price');
      return {
        price: ethPrice || 0,
        priceChange24h: '0.00'
      };
    }
  };

  // Fetch balances
  const fetchBalances = async (forceRefresh = false) => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return;
    }

    // Check cache first
    const now = Date.now();
    const cachedData = balanceCache.get(address);
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      setBalances(cachedData.balances);
      setTotalBalanceUSD(cachedData.totalBalanceUSD);
      isInitialLoadRef.current = false;
      return;
    }
    
    // Only show loading state on initial load or force refresh
    if (isInitialLoadRef.current || forceRefresh) {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      const provider = await getProvider();
      if (!provider) {
        setError('No provider available');
        return;
      }

      // Fetch ETH price and 24h change
      const { price, priceChange24h } = await fetchEthPrice();

      // Fetch ETH balance
      const ethBalanceWei = await provider.getBalance(address);
      const formattedEthBalance = ethers.utils.formatEther(ethBalanceWei);

      // Fetch USDC balance
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
      const usdcBalanceWei = await usdcContract.balanceOf(address);
      const usdcDecimals = await usdcContract.decimals();
      const formattedUsdcBalance = ethers.utils.formatUnits(usdcBalanceWei, usdcDecimals);

      // Calculate total balance in USD
      const ethBalanceUSD = parseFloat(formattedEthBalance) * price;
      const usdcBalanceUSD = parseFloat(formattedUsdcBalance);
      const total = ethBalanceUSD + usdcBalanceUSD;

      // Set token balances with price and price change data
      const newBalances = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: formatBalance(formattedEthBalance),
          decimals: 18,
          price: price,
          priceChange24h: priceChange24h
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: formatBalance(formattedUsdcBalance),
          address: USDC_ADDRESS,
          decimals: 6,
          price: 1,
          priceChange24h: '0.00'
        }
      ];

      // Update cache
      balanceCache.set(address, {
        balances: newBalances,
        totalBalanceUSD: total.toFixed(2),
        timestamp: now
      });

      setBalances(newBalances);
      setTotalBalanceUSD(total.toFixed(2));
      lastFetchRef.current = now;
      isInitialLoadRef.current = false;

    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  // Update balances and prices
  useEffect(() => {
    if (isConnected) {
      fetchBalances();

      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchBalances(true); // Force refresh on interval
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  return {
    balances,
    totalBalanceUSD,
    isLoading,
    error,
    refreshBalances: () => fetchBalances(true),
    getTokenBalance,
    getTokenUSDValue,
    getTokenData,
    getCachedBalances
  };
} 
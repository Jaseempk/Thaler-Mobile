import { useState, useEffect } from 'react';
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

export function useTokenBalances() {
  const { address, getProvider, isConnected } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [ethPrice, setEthPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch ETH price and 24h change from CoinGecko
  const fetchEthPrice = async () => {
    try {
      console.log('Fetching ETH price...');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('ETH price response:', data);
      
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
      // Set a default price if we can't fetch it
      setEthPrice(0);
      return {
        price: 0,
        priceChange24h: '0.00'
      };
    }
  };

  // Fetch balances
  const fetchBalances = async () => {
    if (!isConnected || !address) {
      console.log('Wallet not connected or no address:', { isConnected, address });
      setError('Wallet not connected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching balances for address:', address);
      const provider = await getProvider();
      if (!provider) {
        console.log('No provider available');
        setError('No provider available');
        return;
      }

      // Fetch ETH price and 24h change
      const { price, priceChange24h } = await fetchEthPrice();

      // Fetch ETH balance
      console.log('Fetching ETH balance...');
      const ethBalanceWei = await provider.getBalance(address);
      const formattedEthBalance = ethers.utils.formatEther(ethBalanceWei);
      console.log('ETH balance:', formattedEthBalance);

      // Fetch USDC balance
      console.log('Fetching USDC balance...');
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
      const usdcBalanceWei = await usdcContract.balanceOf(address);
      const usdcDecimals = await usdcContract.decimals();
      const formattedUsdcBalance = ethers.utils.formatUnits(usdcBalanceWei, usdcDecimals);
      console.log('USDC balance:', formattedUsdcBalance);

      // Calculate total balance in USD
      const ethBalanceUSD = parseFloat(formattedEthBalance) * price;
      const usdcBalanceUSD = parseFloat(formattedUsdcBalance); // USDC is pegged to USD
      const total = ethBalanceUSD + usdcBalanceUSD;
      console.log('Total balance USD:', total);
      setTotalBalanceUSD(total.toFixed(2));

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
          price: 1, // USDC is pegged to USD
          priceChange24h: '0.00' // USDC is pegged to USD
        }
      ];
      console.log('Setting balances:', newBalances);
      setBalances(newBalances);

    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  // Update balances and prices
  useEffect(() => {
    console.log('useEffect triggered:', { isConnected, address });
    if (isConnected) {
      fetchBalances();

      // Refresh every 30 seconds
      const interval = setInterval(() => {
        console.log('Auto-refreshing balances...');
        fetchBalances();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  return {
    balances,
    totalBalanceUSD,
    isLoading,
    error,
    refreshBalances: fetchBalances
  };
} 
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import {
  THALER_SAVINGS_POOL_ABI,
  THALER_SAVINGS_POOL_ADDRESS,
  TIME_CONSTANTS,
} from "../constants/Contracts";
import { encodeFunctionData } from "viem";
import { useEmbeddedEthereumWallet } from "@privy-io/expo";

// Define the structure for a savings pool
interface SavingsPool {
  id: string; // savingsPoolId from contract
  user: string;
  tokenToSave: string;
  amountToSave: string;
  totalSaved: string;
  duration: number;
  startDate: number;
  endDate: number;
  nextDepositDate: number;
  numberOfDeposits: number;
  totalIntervals: number;
  initialDeposit: string;
  progress: number; // Calculated field
  isEth: boolean;
  tokenSymbol: string;
}

interface SavingsPoolContextType {
  pools: SavingsPool[];
  isLoading: boolean;
  error: string | null;
  createEthSavingsPool: (
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => Promise<void>;
  createERC20SavingsPool: (
    tokenAddress: string,
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => Promise<void>;
  depositToEthPool: (poolId: string, amount: string) => Promise<void>;
  depositToERC20Pool: (poolId: string, amount: string) => Promise<void>;
  withdrawFromEthPool: (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => Promise<void>;
  withdrawFromERC20Pool: (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => Promise<void>;
  refreshPools: () => Promise<void>;
}

interface SavingsPoolProviderProps {
  children: ReactNode;
}

const SavingsPoolContext = createContext<SavingsPoolContextType | undefined>(
  undefined
);

export const useSavingsPool = () => {
  const context = useContext(SavingsPoolContext);
  if (context === undefined) {
    throw new Error("useSavingsPool must be used within a SavingsPoolProvider");
  }
  return context;
};

export const SavingsPoolProvider: React.FC<SavingsPoolProviderProps> = ({
  children,
}) => {
  const { address } = useWallet();
  const { wallets } = useEmbeddedEthereumWallet();
  const [pools, setPools] = useState<SavingsPool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize contract when address or wallets change
  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!address || !wallets) {
          setContract(null);
          return;
        }

        const embeddedWallet = wallets.find((w) => w.address === address);
        if (!embeddedWallet) {
          throw new Error("No embedded wallet found");
        }

        const privyProvider = await embeddedWallet.getProvider();
        if (!privyProvider) {
          throw new Error("Failed to get provider");
        }

        // Create an ethers provider from the Privy provider
        const provider = new ethers.providers.Web3Provider(privyProvider);
        const newContract = new ethers.Contract(
          THALER_SAVINGS_POOL_ADDRESS,
          THALER_SAVINGS_POOL_ABI,
          provider
        );

        setContract(newContract);
      } catch (error) {
        console.error("Error initializing contract:", error);
        setError("Failed to initialize contract");
        setContract(null);
      }
    };

    initializeContract();
  }, [address, wallets]);

  // Calculate progress percentage
  const calculateProgress = (
    totalSaved: string,
    amountToSave: string
  ): number => {
    const saved = parseFloat(ethers.utils.formatEther(totalSaved));
    const target = parseFloat(ethers.utils.formatEther(amountToSave));
    if (target === 0) return 0;
    return Math.min(Math.round((saved / target) * 100), 100);
  };

  // Format pool data from contract
  const formatPoolData = (
    poolId: string,
    poolData: any,
    isEth: boolean
  ): SavingsPool => {
    return {
      id: poolId,
      user: poolData.user,
      tokenToSave: poolData.tokenToSave,
      amountToSave: ethers.utils.formatEther(poolData.amountToSave),
      totalSaved: ethers.utils.formatEther(poolData.totalSaved),
      duration: poolData.duration.toNumber(),
      startDate: poolData.startDate.toNumber() * 1000, // Convert to milliseconds
      endDate: poolData.endDate.toNumber() * 1000,
      nextDepositDate: poolData.nextDepositDate.toNumber() * 1000,
      numberOfDeposits: poolData.numberOfDeposits.toNumber(),
      totalIntervals: poolData.totalIntervals,
      initialDeposit: ethers.utils.formatEther(poolData.initialDeposit),
      progress: calculateProgress(poolData.totalSaved, poolData.amountToSave),
      isEth,
      tokenSymbol: isEth ? "ETH" : "USDC", // Default to USDC for ERC20, should be updated based on token address
    };
  };

  // Update fetchUserPools to use the contract from state
  const fetchUserPools = async () => {
    if (!address || !contract) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all past SavingsPoolCreated events
      const events = await contract.queryFilter(
        contract.filters.SavingsPoolCreated()
      );
      console.log("Fetched events:", events.length);

      // Filter events to only include the current user's pools
      const userEvents = events.filter(
        (event) => event.args?.user.toLowerCase() === address.toLowerCase()
      );

      console.log("User-specific events:", userEvents.length);

      const userPools: SavingsPool[] = [];

      // Process each user's event to fetch pool data
      for (const event of userEvents) {
        const poolId = event.args?.savingsPoolId;
        if (!poolId) continue;

        const poolData = await contract.savingsPools(poolId);
        if (poolData.user.toLowerCase() === address.toLowerCase()) {
          const isEthPool =
            poolData.tokenToSave === ethers.constants.AddressZero;
          userPools.push(formatPoolData(poolId, poolData, isEthPool));
        }
      }

      setPools(userPools);
    } catch (error) {
      console.error("Error fetching user pools:", error);
      setError("Failed to fetch savings pools");
    } finally {
      setIsLoading(false);
    }
  };

  // Update createEthSavingsPool to use wallets directly
  const createEthSavingsPool = async (
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => {
    if (!address || !contract || !wallets) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const embeddedWallet = wallets.find((w) => w.address === address);
      if (!embeddedWallet) throw new Error("No embedded wallet found");

      const provider = await embeddedWallet.getProvider();
      if (!provider) throw new Error("Failed to get provider");

      // Convert amounts to wei
      const amountToSaveWei = ethers.utils.parseEther(amountToSave);
      const initialDepositWei = ethers.utils.parseEther(initialDeposit);

      // Encode function data using viem
      const data = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "createSavingsPoolEth",
        args: [amountToSaveWei, duration, initialDepositWei, totalIntervals],
      });

      // Prepare transaction request
      const transactionRequest = {
        to: THALER_SAVINGS_POOL_ADDRESS,
        data: data,
        value: initialDepositWei.toHexString(),
      };

      // Send transaction
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await fetchUserPools();
    } catch (error) {
      console.error("Error creating ETH savings pool:", error);
      setError("Failed to create ETH savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create ERC20 savings pool
  const createERC20SavingsPool = async (
    tokenAddress: string,
    amountToSave: string,
    duration: number,
    initialDeposit: string,
    totalIntervals: number
  ) => {
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const provider = await wallets[0].getProvider();
      if (!provider) throw new Error("Failed to get provider");

      // Convert amounts to wei
      const amountToSaveWei = ethers.utils.parseEther(amountToSave);
      const initialDepositWei = ethers.utils.parseEther(initialDeposit);

      // First, approve token spending
      const approveData = encodeFunctionData({
        abi: [
          "function approve(address spender, uint256 amount) returns (bool)"
        ],
        functionName: "approve",
        args: [THALER_SAVINGS_POOL_ADDRESS, initialDepositWei],
      });

      const approveTx = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          to: tokenAddress,
          data: approveData,
          value: "0x0",
        }],
      });

      // Wait for approval transaction
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Then create the savings pool
      const createData = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "createSavingsPoolERC20",
        args: [tokenAddress, amountToSaveWei, duration, initialDepositWei, totalIntervals],
      });

      const createTx = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          to: THALER_SAVINGS_POOL_ADDRESS,
          data: createData,
          value: "0x0",
        }],
      });

      // Wait for creation transaction
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Refresh pools after creation
      await fetchUserPools();
    } catch (error) {
      console.error("Error creating ERC20 savings pool:", error);
      setError("Failed to create ERC20 savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit to ETH pool
  const depositToEthPool = async (poolId: string, amount: string) => {
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const provider = await wallets[0].getProvider();
      if (!provider) throw new Error("Failed to get provider");

      const depositAmountWei = ethers.utils.parseEther(amount);

      const data = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "depositToEthSavingPool",
        args: [poolId, depositAmountWei],
      });

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          to: THALER_SAVINGS_POOL_ADDRESS,
          data: data,
          value: depositAmountWei.toHexString(),
        }],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await fetchUserPools();
    } catch (error) {
      console.error("Error depositing to ETH pool:", error);
      setError("Failed to deposit to ETH pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deposit to ERC20 pool
  const depositToERC20Pool = async (poolId: string, amount: string) => {
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const provider = await wallets[0].getProvider();
      if (!provider) throw new Error("Failed to get provider");

      const depositAmountWei = ethers.utils.parseEther(amount);

      // Get pool data to get token address
      const pool = pools.find(p => p.id === poolId);
      if (!pool) throw new Error("Pool not found");
      const tokenAddress = pool.tokenToSave;

      // First approve token spending
      const approveData = encodeFunctionData({
        abi: [
          "function approve(address spender, uint256 amount) returns (bool)"
        ],
        functionName: "approve",
        args: [THALER_SAVINGS_POOL_ADDRESS, depositAmountWei],
      });

      const approveTx = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          to: tokenAddress,
          data: approveData,
          value: "0x0",
        }],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Then deposit
      const depositData = encodeFunctionData({
        abi: THALER_SAVINGS_POOL_ABI,
        functionName: "depositToERC20SavingPool",
        args: [poolId, depositAmountWei],
      });

      const depositTx = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          to: THALER_SAVINGS_POOL_ADDRESS,
          data: depositData,
          value: "0x0",
        }],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await fetchUserPools();
    } catch (error) {
      console.error("Error depositing to ERC20 pool:", error);
      setError("Failed to deposit to ERC20 pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from ETH pool
  const withdrawFromEthPool = async (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => {
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      // Call contract function
      const tx = await contract.withdrawFromEthSavingPool(
        poolId,
        proof,
        publicInputs
      );

      await tx.wait();

      // Refresh pools after withdrawal
      await fetchUserPools();
    } catch (error) {
      console.error("Error withdrawing from ETH pool:", error);
      setError("Failed to withdraw from ETH savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw from ERC20 pool
  const withdrawFromERC20Pool = async (
    poolId: string,
    proof: string,
    publicInputs: string[]
  ) => {
    if (!address || !contract) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      // Call contract function
      const tx = await contract.withdrawFromERC20SavingPool(
        poolId,
        proof,
        publicInputs
      );

      await tx.wait();

      // Refresh pools after withdrawal
      await fetchUserPools();
    } catch (error) {
      console.error("Error withdrawing from ERC20 pool:", error);
      setError("Failed to withdraw from ERC20 savings pool");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh pools
  const refreshPools = async () => {
    await fetchUserPools();
  };

  // Fetch pools when address changes
  useEffect(() => {
    if (address) {
      fetchUserPools();
    } else {
      setPools([]);
    }
  }, [address]);

  return (
    <SavingsPoolContext.Provider
      value={{
        pools,
        isLoading,
        error,
        createEthSavingsPool,
        createERC20SavingsPool,
        depositToEthPool,
        depositToERC20Pool,
        withdrawFromEthPool,
        withdrawFromERC20Pool,
        refreshPools,
      }}
    >
      {children}
    </SavingsPoolContext.Provider>
  );
};
